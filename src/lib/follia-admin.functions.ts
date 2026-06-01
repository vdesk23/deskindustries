import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

function getAdmin(): any {
  const url = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin not configured");
  return createClient(url, key);
}

async function assertAdmin(userId: string) {
  const admin = getAdmin();
  const { data, error } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
  return admin;
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = getAdmin();
    const { data } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const adminListSites = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        search: z.string().max(200).optional(),
        requestStatus: z.enum(["new", "in_progress", "awaiting_payment", "live", "archived"]).optional(),
        claimed: z.enum(["all", "yes", "no"]).default("all"),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.userId);
    let q = admin
      .from("follia_sites")
      .select(
        "id, subdomain, custom_domain, business_type, business_data, lead_email, status, request_status, plan, has_full_assistance, published_url, user_id, claimed_at, created_at",
      )
      .order("created_at", { ascending: false });

    if (data.requestStatus) q = q.eq("request_status", data.requestStatus);
    if (data.claimed === "yes") q = q.not("user_id", "is", null);
    if (data.claimed === "no") q = q.is("user_id", null);
    if (data.search) {
      const s = `%${data.search}%`;
      q = q.or(`subdomain.ilike.${s},lead_email.ilike.${s},custom_domain.ilike.${s}`);
    }
    const { data: sites, error } = await q.limit(500);
    if (error) throw new Error(error.message);
    return { sites: sites || [] };
  });

export const adminGetSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ siteId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.userId);
    const { data: site, error } = await admin
      .from("follia_sites")
      .select("*")
      .eq("id", data.siteId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!site) throw new Error("Sito non trovato");

    const [menu, products, services, tickets, bookings, appointments] = await Promise.all([
      admin.from("follia_menu_items").select("*").eq("site_id", data.siteId).order("position"),
      admin.from("follia_products").select("*").eq("site_id", data.siteId).order("position"),
      admin.from("follia_services").select("*").eq("site_id", data.siteId).order("position"),
      admin.from("follia_tickets").select("*").eq("site_id", data.siteId).order("created_at", { ascending: false }),
      admin.from("follia_table_bookings").select("*").eq("site_id", data.siteId).order("slot_at", { ascending: false }),
      admin.from("follia_appointments").select("*").eq("site_id", data.siteId).order("slot_at", { ascending: false }),
    ]);

    let ownerEmail: string | null = null;
    if (site.user_id) {
      const { data: profile } = await admin
        .from("profiles")
        .select("email, full_name")
        .eq("user_id", site.user_id)
        .maybeSingle();
      ownerEmail = profile?.email || null;
    }

    return {
      site,
      ownerEmail,
      menu: menu.data || [],
      products: products.data || [],
      services: services.data || [],
      tickets: tickets.data || [],
      bookings: bookings.data || [],
      appointments: appointments.data || [],
    };
  });

const updatePatchSchema = z.object({
  siteId: z.string().uuid(),
  patch: z
    .object({
      status: z.enum(["draft", "awaiting_payment", "in_review", "live", "suspended"]).optional(),
      request_status: z.enum(["new", "in_progress", "awaiting_payment", "live", "archived"]).optional(),
      plan: z.string().max(40).nullable().optional(),
      has_full_assistance: z.boolean().optional(),
      subdomain: z
        .string()
        .min(2)
        .max(63)
        .regex(/^[a-z0-9-]+$/)
        .optional(),
      custom_domain: z.string().max(255).nullable().optional(),
      published_url: z.string().url().max(500).nullable().optional(),
      internal_notes: z.string().max(4000).nullable().optional(),
      business_data: z.record(z.string(), z.unknown()).optional(),
      config: z.record(z.string(), z.unknown()).optional(),
    })
    .refine((v) => Object.keys(v).length > 0, "Nessuna modifica"),
});

export const adminUpdateSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updatePatchSchema.parse(input))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.userId);
    const { error } = await admin
      .from("follia_sites")
      .update({ ...data.patch, updated_at: new Date().toISOString() })
      .eq("id", data.siteId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminMarkAwaitingPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      siteId: z.string().uuid(),
      plan: z.enum(["basic", "with_setup"]),
    }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.userId);
    const planValue = data.plan === "with_setup" ? "with_setup_297" : "basic_19";
    const { error } = await admin
      .from("follia_sites")
      .update({
        request_status: "awaiting_payment",
        plan: planValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.siteId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminAssignSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ siteId: z.string().uuid(), email: z.string().email().max(255) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.userId);
    const email = data.email.toLowerCase().trim();
    const { data: profile, error: pErr } = await admin
      .from("profiles")
      .select("user_id")
      .ilike("email", email)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!profile) throw new Error("Nessun account trovato con questa email");
    const { error } = await admin
      .from("follia_sites")
      .update({ user_id: profile.user_id, claimed_at: new Date().toISOString() })
      .eq("id", data.siteId);
    if (error) throw new Error(error.message);
    return { ok: true as const, userId: profile.user_id };
  });

export const adminDeleteSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ siteId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.userId);
    // delete dependent rows first (no FK cascade defined)
    await admin.from("follia_menu_items").delete().eq("site_id", data.siteId);
    await admin.from("follia_products").delete().eq("site_id", data.siteId);
    await admin.from("follia_services").delete().eq("site_id", data.siteId);
    await admin.from("follia_appointments").delete().eq("site_id", data.siteId);
    await admin.from("follia_table_bookings").delete().eq("site_id", data.siteId);
    // tickets + messages
    const { data: ts } = await admin.from("follia_tickets").select("id").eq("site_id", data.siteId);
    const ticketIds = (ts || []).map((t: { id: string }) => t.id);
    if (ticketIds.length) {
      await admin.from("follia_ticket_messages").delete().in("ticket_id", ticketIds);
      await admin.from("follia_tickets").delete().in("id", ticketIds);
    }
    const { error } = await admin.from("follia_sites").delete().eq("id", data.siteId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context.userId);
    const counts = async (filter?: (q: any) => any) => {
      let q = admin.from("follia_sites").select("id", { count: "exact", head: true });
      if (filter) q = filter(q);
      const { count } = await q;
      return count || 0;
    };
    const [total, newReq, inProgress, awaitingPayment, live, unclaimed, openTickets] = await Promise.all([
      counts(),
      counts((q) => q.eq("request_status", "new")),
      counts((q) => q.eq("request_status", "in_progress")),
      counts((q) => q.eq("request_status", "awaiting_payment")),
      counts((q) => q.eq("request_status", "live")),
      counts((q) => q.is("user_id", null)),
      (async () => {
        const { count } = await admin
          .from("follia_tickets")
          .select("id", { count: "exact", head: true })
          .eq("status", "open");
        return count || 0;
      })(),
    ]);
    return { total, newReq, inProgress, awaitingPayment, live, unclaimed, openTickets };
  });

export const adminListTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context.userId);
    const { data, error } = await admin
      .from("follia_tickets")
      .select("id, subject, category, status, requires_payment, paid_at, customer_email, site_id, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { tickets: data || [] };
  });

export const adminReplyTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ ticketId: z.string().uuid(), body: z.string().trim().min(1).max(4000) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context.userId);
    const { error } = await admin.from("follia_ticket_messages").insert({
      ticket_id: data.ticketId,
      author_id: context.userId,
      body: data.body,
      is_staff: true,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
