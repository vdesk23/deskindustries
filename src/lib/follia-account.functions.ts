import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { TEMPLATES } from "@/lib/email-templates/registry";
import { render } from "@react-email/components";
import * as React from "react";
import { createClient } from "@supabase/supabase-js";

export const listMyFolliaSites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("follia_sites")
      .select("id, subdomain, custom_domain, business_type, business_data, status, plan, has_full_assistance, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { sites: data || [] };
  });

export const getMyFolliaSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ siteId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: site, error } = await supabase
      .from("follia_sites")
      .select("*")
      .eq("id", data.siteId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!site) throw new Error("Sito non trovato");

    const [menu, products, services, tickets] = await Promise.all([
      supabase.from("follia_menu_items").select("*").eq("site_id", data.siteId).order("position"),
      supabase.from("follia_products").select("*").eq("site_id", data.siteId).order("position"),
      supabase.from("follia_services").select("*").eq("site_id", data.siteId).order("position"),
      supabase.from("follia_tickets").select("*").eq("site_id", data.siteId).order("created_at", { ascending: false }),
    ]);

    return {
      site,
      menu: menu.data || [],
      products: products.data || [],
      services: services.data || [],
      tickets: tickets.data || [],
    };
  });

const configSchema = z.object({
  siteId: z.string().uuid(),
  config: z.object({
    show_map: z.boolean().optional(),
    opening_hours: z.string().max(500).optional(),
    address: z.string().max(200).optional(),
    phone: z.string().max(40).optional(),
    email: z.string().email().max(255).optional(),
  }),
});

export const updateMyFolliaSiteConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => configSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: existing, error: readErr } = await supabase
      .from("follia_sites")
      .select("config, status")
      .eq("id", data.siteId)
      .maybeSingle();
    if (readErr || !existing) throw new Error("Sito non trovato");

    const merged = { ...(existing.config as Record<string, unknown>), ...data.config };
    const { error } = await supabase
      .from("follia_sites")
      .update({ config: merged })
      .eq("id", data.siteId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const ticketSchema = z.object({
  siteId: z.string().uuid(),
  subject: z.string().trim().min(3).max(140),
  body: z.string().trim().min(5).max(4000),
  category: z.enum(["general", "edit_request", "bug", "billing"]).default("general"),
});

export const createFolliaTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ticketSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    // rate-limit: 5 / 30gg
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("follia_tickets")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since);
    if ((count || 0) >= 5) {
      return { ok: false as const, error: "Hai raggiunto il limite di 5 ticket negli ultimi 30 giorni." };
    }

    const { data: ticket, error } = await supabase
      .from("follia_tickets")
      .insert({
        site_id: data.siteId,
        user_id: userId,
        subject: data.subject,
        category: data.category,
      })
      .select("id")
      .single();
    if (error || !ticket) throw new Error(error?.message || "Errore creazione ticket");

    const { error: msgErr } = await supabase
      .from("follia_ticket_messages")
      .insert({ ticket_id: ticket.id, author_id: userId, body: data.body, is_staff: false });
    if (msgErr) throw new Error(msgErr.message);

    return { ok: true as const, ticketId: ticket.id };
  });
