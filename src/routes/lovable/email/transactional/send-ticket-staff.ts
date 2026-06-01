import * as React from "react";
import { render } from "@react-email/components";
import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { TEMPLATES } from "@/lib/email-templates/registry";

const STAFF_EMAILS = ["master@deskindustries.com", "web@deskindustries.com"];
const APP_BASE_URL = "https://deskindustries.com";

const CATEGORY_LABELS: Record<string, string> = {
  domain: "Dominio",
  branding: "Colori e logo",
  copy: "Scritte e titoli",
  general: "Altro",
};

async function enqueue(
  admin: any,
  templateName: string,
  to: string,
  templateData: Record<string, unknown>,
  idempotencyKey: string,
) {
  const tpl = TEMPLATES[templateName];
  if (!tpl) return;
  const element = React.createElement(tpl.component, templateData as Record<string, unknown>);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject =
    typeof tpl.subject === "function" ? tpl.subject(templateData as Record<string, unknown>) : tpl.subject;
  const messageId = crypto.randomUUID();
  await admin.from("email_send_log").insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: to,
    status: "pending",
  });
  await admin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to,
      from: "Foll.IA <noreply@deskindustries.com>",
      sender_domain: "notify.deskindustries.com",
      subject,
      html,
      text,
      purpose: "transactional",
      label: templateName,
      idempotency_key: idempotencyKey,
      queued_at: new Date().toISOString(),
    },
  });
}

export const Route = createFileRoute("/lovable/email/transactional/send-ticket-staff")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: "Server misconfigured" }, { status: 500 });
        }
        const auth = request.headers.get("Authorization");
        if (auth !== `Bearer ${serviceKey}`) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        let ticketId: string;
        try {
          const body = await request.json();
          ticketId = String(body.ticketId);
          if (!ticketId) throw new Error("ticketId required");
        } catch {
          return Response.json({ error: "Invalid body" }, { status: 400 });
        }

        const admin = createClient(supabaseUrl, serviceKey);
        const { data: ticket } = await admin
          .from("follia_tickets")
          .select("id, site_id, subject, category, attachments, customer_email, requires_payment, paid_at")
          .eq("id", ticketId)
          .maybeSingle();
        if (!ticket) return Response.json({ error: "Ticket not found" }, { status: 404 });

        const { data: site } = await admin
          .from("follia_sites")
          .select("subdomain, business_data")
          .eq("id", ticket.site_id)
          .maybeSingle();

        const { data: msg } = await admin
          .from("follia_ticket_messages")
          .select("body, author_id")
          .eq("ticket_id", ticketId)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        const { data: profile } = msg?.author_id
          ? await admin.from("profiles").select("full_name").eq("user_id", msg.author_id).maybeSingle()
          : { data: null };

        const siteName =
          (site?.business_data as { name?: string } | null)?.name || site?.subdomain || "Sito Foll.IA";
        const categoryLabel = CATEGORY_LABELS[ticket.category] || "Altro";

        // Sign attachments
        const atts = (ticket.attachments as Array<{ name: string; path: string; size?: number }>) || [];
        const signed: Array<{ name: string; url: string; size?: number }> = [];
        for (const a of atts) {
          const { data: s } = await admin.storage
            .from("follia-ticket-attachments")
            .createSignedUrl(a.path, 60 * 60 * 24 * 7);
          if (s?.signedUrl) signed.push({ name: a.name, url: s.signedUrl, size: a.size });
        }

        const adminUrl = `${APP_BASE_URL}/account/sites/${ticket.site_id}`;
        const paidBadge = ticket.requires_payment ? "paid" : "included";

        for (const staffEmail of STAFF_EMAILS) {
          await enqueue(
            admin,
            "follia-ticket-staff",
            staffEmail,
            {
              ticketId: ticket.id,
              category: ticket.category,
              categoryLabel,
              subject: ticket.subject,
              siteName,
              siteSubdomain: site?.subdomain || "",
              customerEmail: ticket.customer_email || "",
              customerName: profile?.full_name || undefined,
              body: msg?.body || "",
              attachments: signed,
              paidBadge,
              adminUrl,
            },
            `ticket-staff-${ticket.id}-${staffEmail}`,
          );
        }

        if (ticket.customer_email) {
          await enqueue(
            admin,
            "follia-ticket-customer-confirmation",
            ticket.customer_email,
            {
              siteName,
              categoryLabel,
              subject: ticket.subject,
              requiresPayment: false,
            },
            `ticket-customer-paid-${ticket.id}`,
          );
        }

        return Response.json({ ok: true });
      },
    },
  },
});
