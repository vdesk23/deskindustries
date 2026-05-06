import * as React from "react";
import { render } from "@react-email/components";
import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { TEMPLATES } from "@/lib/email-templates/registry";

const SITE_NAME = "Desk Industries";
const SENDER_DOMAIN = "notify.deskindustries.com";
const FROM_DOMAIN = "deskindustries.com";

const RECIPIENTS = [
  "master@deskindustries.com",
  "content@deskindustries.com",
];

const PDF_EXPIRES_SECONDS = 60 * 60 * 24 * 30; // 30 giorni

const plannerRowSchema = z.object({
  giorno: z.string().max(8),
  tipologia: z.string().max(40).optional().or(z.literal("")),
  formato: z.string().max(40).optional().or(z.literal("")),
  gancio: z.string().max(200).optional().or(z.literal("")),
  cta: z.string().max(200).optional().or(z.literal("")),
});

const briefingSchema = z.object({
  titolo: z.string().max(120).optional().or(z.literal("")),
  tipologia: z.string().max(40).optional().or(z.literal("")),
  formato: z.string().max(40).optional().or(z.literal("")),
  cta: z.string().max(200).optional().or(z.literal("")),
  gancio: z.string().max(300).optional().or(z.literal("")),
  messaggio: z.string().max(400).optional().or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
  editing: z.string().max(400).optional().or(z.literal("")),
});

const planSchema = z.object({
  clienteNome: z.string().trim().max(120).optional().or(z.literal("")),
  brandNome: z.string().trim().max(120).optional().or(z.literal("")),
  clienteEmail: z.string().trim().email().max(255),
  clienteTel: z.string().trim().max(40).optional().or(z.literal("")),
  profiloSocial: z.string().trim().max(120).optional().or(z.literal("")),
  dataCompilazione: z.string().max(20).optional().or(z.literal("")),
  q1: z.string().max(2000).optional().or(z.literal("")),
  q2: z.string().max(2000).optional().or(z.literal("")),
  q3: z.string().max(2000).optional().or(z.literal("")),
  q4: z.string().max(2000).optional().or(z.literal("")),
  q5: z.string().max(2000).optional().or(z.literal("")),
  q6: z.string().max(2000).optional().or(z.literal("")),
  q7: z.string().max(500).optional().or(z.literal("")),
  pinAutorevolezza: z.string().max(2000).optional().or(z.literal("")),
  pinChiSei: z.string().max(2000).optional().or(z.literal("")),
  pinTestimonianze: z.string().max(2000).optional().or(z.literal("")),
  planner: z.array(plannerRowSchema).max(7).default([]),
  briefings: z.array(briefingSchema).max(20).default([]),
  // PDF base64 generato lato client (max ~5MB)
  pdfBase64: z.string().max(7_500_000).optional(),
  pdfFilename: z.string().max(200).optional(),
});

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function enqueueTemplate(
  supabase: any,
  templateName: string,
  recipientEmail: string,
  templateData: Record<string, any>,
  idempotencyKey: string,
) {
  const template = TEMPLATES[templateName];
  if (!template) return { ok: false as const, error: `Template ${templateName} not found` };
  const effectiveRecipient = template.to || recipientEmail;
  if (!effectiveRecipient) return { ok: false as const, error: "No recipient" };

  const normalized = effectiveRecipient.toLowerCase();
  const messageId = crypto.randomUUID();

  const { data: suppressed } = await supabase
    .from("suppressed_emails")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();
  if (suppressed) {
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: "suppressed",
    });
    return { ok: true as const, suppressed: true };
  }

  const { data: existingToken } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalized)
    .maybeSingle();
  let unsubscribeToken: string;
  if (existingToken && !existingToken.used_at) {
    unsubscribeToken = existingToken.token;
  } else if (!existingToken) {
    unsubscribeToken = generateToken();
    await supabase
      .from("email_unsubscribe_tokens")
      .upsert(
        { token: unsubscribeToken, email: normalized },
        { onConflict: "email", ignoreDuplicates: true },
      );
    const { data: stored } = await supabase
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", normalized)
      .maybeSingle();
    unsubscribeToken = stored?.token ?? unsubscribeToken;
  } else {
    return { ok: true as const, suppressed: true };
  }

  const element = React.createElement(template.component, templateData);
  const html = await render(element);
  const plainText = await render(element, { plainText: true });
  const subject =
    typeof template.subject === "function"
      ? template.subject(templateData)
      : template.subject;

  await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: effectiveRecipient,
    status: "pending",
  });

  const { error: enqueueError } = await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: effectiveRecipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text: plainText,
      purpose: "transactional",
      label: templateName,
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });

  if (enqueueError) {
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: "failed",
      error_message: "Failed to enqueue email",
    });
    return { ok: false as const, error: enqueueError.message };
  }
  return { ok: true as const };
}

export const Route = createFileRoute("/api/public/content-plan-submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Require authenticated user (tool is gated to area clienti)
        const authHeader = request.headers.get("authorization") ?? "";
        if (!authHeader.startsWith("Bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.slice(7);

        const supabase: any = createClient(supabaseUrl, supabaseServiceKey);
        const { data: userData, error: userErr } = await supabase.auth.getUser(token);
        if (userErr || !userData?.user) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const user = userData.user;

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = planSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Validation failed", details: parsed.error.flatten() },
            { status: 400 },
          );
        }
        const data = parsed.data;
        const submissionId = crypto.randomUUID();

        const adminTemplateData = { ...data };
        const confirmationData = {
          clienteNome: data.clienteNome || user.user_metadata?.full_name || undefined,
          brandNome: data.brandNome || undefined,
        };

        // Send to 3 admin recipients
        const adminResults = await Promise.all(
          RECIPIENTS.map((to) =>
            enqueueTemplate(
              supabase,
              "content-plan-admin",
              to,
              adminTemplateData,
              `content-plan-admin-${submissionId}-${to}`,
            ),
          ),
        );

        const confirmRes = await enqueueTemplate(
          supabase,
          "content-plan-confirmation",
          data.clienteEmail,
          confirmationData,
          `content-plan-confirm-${submissionId}`,
        );

        return Response.json({
          success: true,
          submissionId,
          emailsQueued: {
            admin: adminResults.map((r) => r.ok),
            confirmation: confirmRes.ok,
          },
        });
      },
    },
  },
});
