import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { enqueueTemplate } from "@/lib/email-enqueue.server";


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

        // Upload PDF to private storage and create signed URL
        let pdfUrl: string | undefined;
        let pdfFilename: string | undefined;
        if (data.pdfBase64) {
          try {
            const binary = Uint8Array.from(atob(data.pdfBase64), (c) =>
              c.charCodeAt(0),
            );
            const MAX_PDF_BYTES = 10 * 1024 * 1024;
            const isPdf =
              binary.byteLength > 4 &&
              binary[0] === 0x25 &&
              binary[1] === 0x50 &&
              binary[2] === 0x44 &&
              binary[3] === 0x46;
            if (!isPdf || binary.byteLength > MAX_PDF_BYTES) {
              return Response.json(
                { error: "Invalid PDF file" },
                { status: 400 },
              );
            }
            const rawName =
              data.pdfFilename || `piano-contenuti_${submissionId}.pdf`;
            const safeName =
              rawName.replace(/[^\w.\-]+/g, "_").replace(/\.[^.]*$/, "").slice(0, 80) +
              ".pdf";
            pdfFilename = safeName;
            const storagePath = `${new Date().toISOString().slice(0, 10)}/${submissionId}_${safeName}`;
            const { error: upErr } = await supabase.storage
              .from("content-plans")
              .upload(storagePath, binary, {
                contentType: "application/pdf",
                upsert: false,
              });
            if (upErr) {
              console.error("PDF upload failed", upErr);
            } else {
              const { data: signed, error: signErr } = await supabase.storage
                .from("content-plans")
                .createSignedUrl(storagePath, PDF_EXPIRES_SECONDS, {
                  download: safeName,
                });
              if (signErr) {
                console.error("Signed URL failed", signErr);
              } else {
                pdfUrl = signed?.signedUrl;
              }
            }
          } catch (err) {
            console.error("PDF processing failed", err);
          }
        }

        const { pdfBase64: _omit, ...planData } = data;
        const adminTemplateData = {
          ...planData,
          pdfUrl,
          pdfFilename,
          pdfExpiresInDays: 30,
        };
        const confirmationData = {
          clienteNome: data.clienteNome || user.user_metadata?.full_name || undefined,
          brandNome: data.brandNome || undefined,
        };

        // Send to admin recipients
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
