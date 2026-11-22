import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Service-role-only: called by the payments webhook after a first purchase.
const bodySchema = z.object({
  recipientEmail: z.string().email().max(255),
  idempotencyKey: z.string().min(1).max(200),
  templateData: z.object({
    email: z.string().max(255).optional(),
    sessionId: z.string().max(200).optional(),
    mode: z.string().max(40).optional(),
  }).default({}),
});

export const Route = createFileRoute("/lovable/email/transactional/welcome-post-purchase")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) return Response.json({ error: "Server configuration error" }, { status: 500 });
        if (request.headers.get("Authorization") !== `Bearer ${key}`) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        let body;
        try { body = bodySchema.parse(await request.json()); } catch {
          return Response.json({ error: "Invalid body" }, { status: 400 });
        }
        const db = createClient(url, key, { auth: { persistSession: false } });
        const { enqueueTemplate } = await import("@/lib/email-enqueue.server");
        const res = await enqueueTemplate(db, "welcome-post-purchase", body.recipientEmail, body.templateData, body.idempotencyKey);
        if (!res.ok) return Response.json({ error: "Send failed" }, { status: 500 });
        return Response.json({ success: true });
      },
    },
  },
});
