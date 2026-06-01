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
    const { supabase, userId } = context;

    // Auto-claim: assegna eventuali siti non rivendicati il cui lead_email
    // coincide con l'email dell'utente loggato. Copre i clienti che hanno
    // creato il sito via form e poi si sono registrati senza passare dal
    // link email con ?siteId=.
    try {
      const admin = getAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("email")
        .eq("user_id", userId)
        .maybeSingle();
      const email = (profile?.email || "").toLowerCase().trim();
      if (email) {
        await admin
          .from("follia_sites")
          .update({ user_id: userId, claimed_at: new Date().toISOString() })
          .is("user_id", null)
          .ilike("lead_email", email);
      }
    } catch (e) {
      console.error("auto-claim follia sites failed", e);
    }

    const { data, error } = await supabase
      .from("follia_sites")
      .select("id, subdomain, custom_domain, business_type, business_data, status, request_status, plan, has_full_assistance, published_url, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { sites: data || [] };
  });

export const getMyFolliaSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ siteId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: site, error } = await supabase
      .from("follia_sites")
      .select("id, subdomain, custom_domain, business_type, business_data, config, status, request_status, plan, has_full_assistance, published_url, created_at, lead_email")
      .eq("id", data.siteId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!site) throw new Error("Sito non trovato");

    const { data: tickets } = await supabase
      .from("follia_tickets")
      .select("id, subject, status, category, created_at")
      .eq("site_id", data.siteId)
      .order("created_at", { ascending: false });

    // Billing for current user (RLS-scoped)
    const { data: purchases } = await supabase
      .from("purchases")
      .select("id, amount_total, currency, mode, price_id, environment, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("id, status, price_id, current_period_end, cancel_at_period_end, environment, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return { site, tickets: tickets || [], purchases: purchases || [], subscriptions: subscriptions || [] };
  });

const fullUpdateSchema = z.object({
  siteId: z.string().uuid(),
  business_data: z
    .object({
      name: z.string().trim().min(1).max(120).optional(),
      city: z.string().trim().max(80).optional(),
      primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      secondary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      description: z.string().trim().max(800).optional(),
      services: z.string().trim().max(500).optional(),
      notes: z.string().trim().max(800).optional(),
    })
    .optional(),
  config: z
    .object({
      show_map: z.boolean().optional(),
      opening_hours: z.string().max(500).optional(),
      address: z.string().max(200).optional(),
      phone: z.string().max(40).optional(),
      email: z.string().email().max(255).optional(),
    })
    .optional(),
});

export const updateMyFolliaSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => fullUpdateSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: existing, error: readErr } = await supabase
      .from("follia_sites")
      .select("business_data, config, user_id")
      .eq("id", data.siteId)
      .maybeSingle();
    if (readErr || !existing) throw new Error("Sito non trovato");
    if (existing.user_id !== context.userId) throw new Error("Forbidden");
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.business_data) {
      patch.business_data = { ...(existing.business_data as Record<string, unknown>), ...data.business_data };
    }
    if (data.config) {
      patch.config = { ...(existing.config as Record<string, unknown>), ...data.config };
    }
    const { error } = await supabase.from("follia_sites").update(patch).eq("id", data.siteId);
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

    // Verify site ownership before creating ticket
    const { data: site, error: siteErr } = await supabase
      .from("follia_sites")
      .select("id, user_id")
      .eq("id", data.siteId)
      .maybeSingle();
    if (siteErr || !site) throw new Error("Sito non trovato");
    if (site.user_id !== userId) throw new Error("Non sei il proprietario di questo sito");


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

// ---------- v2: ticketing with categories, attachments, optional payment ----------

const TICKET_CATEGORIES = ["domain", "branding", "copy", "general"] as const;
type TicketCategory = (typeof TICKET_CATEGORIES)[number];

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  domain: "Dominio",
  branding: "Colori e logo",
  copy: "Scritte e titoli",
  general: "Altro",
};

const ticketV2Schema = z.object({
  siteId: z.string().uuid(),
  category: z.enum(TICKET_CATEGORIES),
  body: z.string().trim().min(10).max(4000),
  attachments: z
    .array(
      z.object({
        name: z.string().min(1).max(255),
        path: z.string().min(1).max(500),
        size: z.number().int().min(0).max(10 * 1024 * 1024),
      }),
    )
    .max(5)
    .default([]),
});

const STAFF_EMAILS = ["master@deskindustries.com", "web@deskindustries.com"];
const APP_BASE_URL = "https://deskindustries.com";

function getAdminClient(): any {
  const url = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin not configured");
  return createClient(url, key);
}

async function enqueueRenderedEmail(args: {
  templateName: string;
  to: string;
  templateData: Record<string, unknown>;
  idempotencyKey: string;
}) {
  const tpl = TEMPLATES[args.templateName];
  if (!tpl) throw new Error(`Template ${args.templateName} not found`);
  const element = React.createElement(tpl.component, args.templateData as Record<string, unknown>);
  const html = await render(element);
  const plainText = await render(element, { plainText: true });
  const subject =
    typeof tpl.subject === "function" ? tpl.subject(args.templateData as Record<string, unknown>) : tpl.subject;

  const admin = getAdminClient();
  const messageId = crypto.randomUUID();

  await admin.from("email_send_log").insert({
    message_id: messageId,
    template_name: args.templateName,
    recipient_email: args.to,
    status: "pending",
  });

  const { error } = await admin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: args.to,
      from: "Foll.IA <noreply@deskindustries.com>",
      sender_domain: "notify.deskindustries.com",
      subject,
      html,
      text: plainText,
      purpose: "transactional",
      label: args.templateName,
      idempotency_key: args.idempotencyKey,
      queued_at: new Date().toISOString(),
    },
  });
  if (error) console.error("enqueue_email failed", error);
}

async function signTicketAttachments(
  attachments: Array<{ name: string; path: string; size?: number }>,
) {
  if (!attachments.length) return [];
  const admin = getAdminClient();
  const signed: Array<{ name: string; url: string; size?: number }> = [];
  for (const a of attachments) {
    const { data } = await admin.storage
      .from("follia-ticket-attachments")
      .createSignedUrl(a.path, 60 * 60 * 24 * 7);
    if (data?.signedUrl) signed.push({ name: a.name, url: data.signedUrl, size: a.size });
  }
  return signed;
}

export const createFolliaTicketV2 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ticketV2Schema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    // Load site + ownership check + assistance flag + name
    const { data: site, error: siteErr } = await supabase
      .from("follia_sites")
      .select("id, subdomain, business_data, has_full_assistance, user_id, status")
      .eq("id", data.siteId)
      .maybeSingle();
    if (siteErr || !site) throw new Error("Sito non trovato");
    if (site.user_id !== userId) throw new Error("Non sei il proprietario di questo sito");

    const requiresPayment = !site.has_full_assistance;

    // Rate limit only for users with full assistance
    if (!requiresPayment) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("follia_tickets")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", since);
      if ((count || 0) >= 10) {
        return { ok: false as const, error: "Hai raggiunto il limite di 10 ticket nelle ultime 24 ore." };
      }
    }

    const siteName =
      (site.business_data as { name?: string } | null)?.name || site.subdomain || "Sito Foll.IA";
    const categoryLabel = CATEGORY_LABELS[data.category];
    const subject = `${categoryLabel} — ${siteName}`;

    // Resolve customer email from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", userId)
      .maybeSingle();
    const customerEmail = profile?.email || "";
    const customerName = profile?.full_name || undefined;

    // Insert ticket
    const { data: ticket, error: insErr } = await supabase
      .from("follia_tickets")
      .insert({
        site_id: data.siteId,
        user_id: userId,
        subject,
        category: data.category,
        status: requiresPayment ? "awaiting_payment" : "open",
        requires_payment: requiresPayment,
        amount_cents: requiresPayment ? 5000 : null,
        attachments: data.attachments,
        customer_email: customerEmail,
      })
      .select("id")
      .single();
    if (insErr || !ticket) throw new Error(insErr?.message || "Errore creazione ticket");

    await supabase
      .from("follia_ticket_messages")
      .insert({ ticket_id: ticket.id, author_id: userId, body: data.body, is_staff: false });

    // If assistance included, send emails immediately. Otherwise, wait for payment webhook.
    if (!requiresPayment) {
      const signed = await signTicketAttachments(data.attachments);
      const adminUrl = `${APP_BASE_URL}/account/sites/${data.siteId}`;
      // Send to each staff address separately with distinct idempotency keys
      for (const staffEmail of STAFF_EMAILS) {
        await enqueueRenderedEmail({
          templateName: "follia-ticket-staff",
          to: staffEmail,
          idempotencyKey: `ticket-staff-${ticket.id}-${staffEmail}`,
          templateData: {
            ticketId: ticket.id,
            category: data.category,
            categoryLabel,
            subject,
            siteName,
            siteSubdomain: site.subdomain,
            customerEmail,
            customerName,
            body: data.body,
            attachments: signed,
            paidBadge: "included",
            adminUrl,
          },
        });
      }
      if (customerEmail) {
        await enqueueRenderedEmail({
          templateName: "follia-ticket-customer-confirmation",
          to: customerEmail,
          idempotencyKey: `ticket-customer-${ticket.id}`,
          templateData: {
            siteName,
            categoryLabel,
            subject,
            requiresPayment: false,
          },
        });
      }
    }

    return {
      ok: true as const,
      ticketId: ticket.id,
      requiresPayment,
    };
  });

export const uploadTicketAttachment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        fileName: z
          .string()
          .min(1)
          .max(255)
          .regex(/^[a-zA-Z0-9._\- ]+$/, "Nome file non valido"),
        contentType: z.string().max(120),
        size: z
          .number()
          .int()
          .min(1)
          .max(10 * 1024 * 1024, "Massimo 10 MB per file"),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { userId } = context;
    const allowed = [
      "image/",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.some((p) => data.contentType.startsWith(p) || data.contentType === p)) {
      throw new Error("Tipo file non consentito (img, pdf, doc)");
    }
    const admin = getAdminClient();
    const path = `${userId}/${crypto.randomUUID()}-${data.fileName}`;
    const { data: signed, error } = await admin.storage
      .from("follia-ticket-attachments")
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error(error?.message || "Impossibile creare URL di upload");
    return { path, token: signed.token, signedUrl: signed.signedUrl };
  });

// Claim a Follia site after signup/login when the user arrives via the
// email preview link. We trust the siteId because it was emailed to the
// lead_email; if it's still unclaimed, assign to the current user.
export const claimFolliaSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ siteId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { userId } = context;
    const admin = getAdminClient();
    const { data: site, error: selErr } = await admin
      .from("follia_sites")
      .select("id, user_id")
      .eq("id", data.siteId)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);
    if (!site) return { ok: false as const, reason: "not_found" as const };
    if (site.user_id && site.user_id !== userId) {
      return { ok: false as const, reason: "owned_by_other" as const };
    }
    if (site.user_id === userId) {
      return { ok: true as const, alreadyClaimed: true };
    }
    const { error: updErr } = await admin
      .from("follia_sites")
      .update({ user_id: userId, claimed_at: new Date().toISOString() })
      .eq("id", data.siteId)
      .is("user_id", null);
    if (updErr) throw new Error(updErr.message);
    return { ok: true as const, alreadyClaimed: false };
  });
