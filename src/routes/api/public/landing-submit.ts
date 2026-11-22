import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { LANDING_LINES } from "@/lib/landing-lines";

const lineIds = LANDING_LINES.map((l) => l.id) as [string, ...string[]];
const utmSchema = z.record(z.string().max(40), z.string().max(200)).default({});

const contactSchema = z.object({
  action: z.literal("contact"),
  line: z.enum(lineIds),
  variant: z.enum(["a", "b"]).optional(),
  contactId: z.string().uuid().optional(),
  contactToken: z.string().max(128).optional(),
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email().max(255),
  privacy: z.literal(true),
  utm: utmSchema,
});

const requestSchema = z.object({
  action: z.literal("request"),
  line: z.enum(lineIds),
  contactId: z.string().uuid(),
  contactToken: z.string().max(128),
  answers: z.record(z.string().max(60), z.string().max(200)),
  preferredSlot: z.string().trim().max(120).optional().default(""),
  notes: z.string().trim().max(1000).optional().default(""),
});

async function signContact(id: string, secret: string) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(`landing-contact:${id}`));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const Route = createFileRoute("/api/public/landing-submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) return Response.json({ error: "Configurazione mancante" }, { status: 500 });
        let body: unknown;
        try { body = await request.json(); } catch { return Response.json({ error: "Richiesta non valida" }, { status: 400 }); }
        const db = createClient(url, key, { auth: { persistSession: false } });
        const { enqueueTemplate } = await import("@/lib/email-enqueue.server");
        const action = (body as { action?: string })?.action;

        if (action === "contact") {
          const p = contactSchema.safeParse(body);
          if (!p.success) return Response.json({ error: "Controlla i dati inseriti" }, { status: 400 });
          const d = p.data;
          const row = { line: d.line, variant: d.variant ?? null, first_name: d.firstName, last_name: d.lastName, phone: d.phone, email: d.email, utm: d.utm };
          let id = d.contactId;
          if (id && (!d.contactToken || d.contactToken !== (await signContact(id, key)))) id = undefined;
          if (id) {
            const { data, error } = await db.from("landing_contacts").update(row).eq("id", id).eq("line", d.line).select("id").maybeSingle();
            if (error || !data) id = undefined;
          }
          if (!id) {
            const { data, error } = await db.from("landing_contacts").insert(row).select("id").single();
            if (error || !data) return Response.json({ error: "Salvataggio non riuscito" }, { status: 500 });
            id = data.id;
          }
          await enqueueTemplate(db, "landing-lead-staff", "master@deskindustries.com",
            { stage: "contact", line: d.line, variant: d.variant, firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone, utm: d.utm },
            `landing-contact-${id}-${d.email.toLowerCase()}`).catch(() => null);
          return Response.json({ contactId: id, contactToken: await signContact(id as string, key) });
        }

        if (action === "request") {
          const p = requestSchema.safeParse(body);
          if (!p.success) return Response.json({ error: "Controlla i dati inseriti" }, { status: 400 });
          const d = p.data;
          if (d.contactToken !== (await signContact(d.contactId, key))) {
            return Response.json({ error: "Contatto non trovato, ricompila il primo step" }, { status: 404 });
          }
          const { data: c } = await db.from("landing_contacts").select("*").eq("id", d.contactId).eq("line", d.line).maybeSingle();
          if (!c) return Response.json({ error: "Contatto non trovato, ricompila il primo step" }, { status: 404 });
          const { data: r, error } = await db.from("landing_requests")
            .insert({ contact_id: c.id, line: d.line, answers: d.answers, preferred_slot: d.preferredSlot, notes: d.notes })
            .select("id").single();
          if (error || !r) return Response.json({ error: "Salvataggio non riuscito" }, { status: 500 });
          await enqueueTemplate(db, "landing-lead-staff", "master@deskindustries.com",
            { stage: "hot", line: d.line, variant: c.variant, firstName: c.first_name, lastName: c.last_name, email: c.email, phone: c.phone, answers: d.answers, preferredSlot: d.preferredSlot, notes: d.notes, utm: c.utm },
            `landing-hot-${r.id}`).catch(() => null);
          return Response.json({ ok: true, firstName: c.first_name });
        }
        return Response.json({ error: "Azione non valida" }, { status: 400 });
      },
    },
  },
});
