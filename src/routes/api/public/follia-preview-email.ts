import * as React from "react";
import { render } from "@react-email/components";
import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { TEMPLATES } from "@/lib/email-templates/registry";

const SITE_NAME = "Desk Industries";
const SENDER_DOMAIN = "notify.deskindustries.com";
const FROM_DOMAIN = "deskindustries.com";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  businessName: z.string().trim().min(1).max(120),
  previewUrl: z.string().trim().url().max(800),
  siteId: z.string().trim().uuid(),
});

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const Route = createFileRoute("/api/public/follia-preview-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }
        // Restrict to service-role callers only. This endpoint is invoked
        // server-side from createFolliaDraft using the service role key —
        // it must not be reachable by anonymous clients (anyone could
        // otherwise abuse our mail infrastructure to spam arbitrary
        // recipients or craft phishing emails with controlled previewUrl).
        const authHeader = request.headers.get("authorization")?.replace("Bearer ", "").trim();
        if (!authHeader || authHeader !== supabaseServiceKey) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        let body: unknown;
        try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
        const parsed = bodySchema.safeParse(body);
        if (!parsed.success) return Response.json({ error: "Validation failed" }, { status: 400 });
        const data = parsed.data;


        const supabase: any = createClient(supabaseUrl, supabaseServiceKey);
        const template = TEMPLATES["follia-preview-ready"];
        if (!template) return Response.json({ error: "Template missing" }, { status: 500 });

        const normalized = data.email.toLowerCase();
        const messageId = crypto.randomUUID();

        const { data: suppressed } = await supabase
          .from("suppressed_emails")
          .select("id")
          .eq("email", normalized)
          .maybeSingle();
        if (suppressed) {
          await supabase.from("email_send_log").insert({
            message_id: messageId,
            template_name: "follia-preview-ready",
            recipient_email: data.email,
            status: "suppressed",
          });
          return Response.json({ ok: true, suppressed: true });
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
            .upsert({ token: unsubscribeToken, email: normalized }, { onConflict: "email", ignoreDuplicates: true });
          const { data: stored } = await supabase
            .from("email_unsubscribe_tokens")
            .select("token")
            .eq("email", normalized)
            .maybeSingle();
          unsubscribeToken = stored?.token ?? unsubscribeToken;
        } else {
          return Response.json({ ok: true, suppressed: true });
        }

        const element = React.createElement(template.component, { businessName: data.businessName, previewUrl: data.previewUrl });
        const html = await render(element);
        const plainText = await render(element, { plainText: true });
        const subject = typeof template.subject === "function"
          ? template.subject({ businessName: data.businessName })
          : template.subject;

        await supabase.from("email_send_log").insert({
          message_id: messageId,
          template_name: "follia-preview-ready",
          recipient_email: data.email,
          status: "pending",
        });

        const { error: enqueueError } = await supabase.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          payload: {
            message_id: messageId,
            to: data.email,
            from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
            sender_domain: SENDER_DOMAIN,
            subject,
            html,
            text: plainText,
            purpose: "transactional",
            label: "follia-preview-ready",
            idempotency_key: `follia-preview-${data.siteId}`,
            unsubscribe_token: unsubscribeToken,
            queued_at: new Date().toISOString(),
          },
        });

        if (enqueueError) {
          await supabase.from("email_send_log").insert({
            message_id: messageId,
            template_name: "follia-preview-ready",
            recipient_email: data.email,
            status: "failed",
            error_message: enqueueError.message,
          });
          return Response.json({ error: enqueueError.message }, { status: 500 });
        }
        return Response.json({ ok: true });
      },
    },
  },
});
