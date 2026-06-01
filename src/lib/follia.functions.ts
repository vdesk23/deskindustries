import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { TEMPLATES } from "@/lib/email-templates/registry";
import { render } from "@react-email/components";
import * as React from "react";

const RESERVED_SUBDOMAINS = new Set([
  "www", "api", "app", "admin", "account", "auth", "login", "signup",
  "dashboard", "mail", "email", "ftp", "ssh", "test", "staging", "dev",
  "preview", "follia", "deskindustries", "desk", "support", "help",
  "blog", "docs", "status", "cdn", "static", "assets", "media", "img",
  "store", "shop", "pay", "checkout", "billing",
]);

const businessTypes = ["restaurant", "retail_shop", "barbershop_salon", "professional", "other"] as const;

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  restaurant: "ristorante / bar",
  retail_shop: "negozio al dettaglio (vetrina)",
  barbershop_salon: "barbiere / salone",
  professional: "studio professionale",
  other: "altra attività locale",
};

const draftSchema = z.object({
  businessName: z.string().trim().min(2).max(80),
  businessType: z.enum(businessTypes),
  subdomain: z.string().trim().toLowerCase().min(3).max(40).regex(/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/),
  email: z.string().trim().toLowerCase().email().max(255),
  city: z.string().trim().max(80).optional().default(""),
  address: z.string().trim().max(200).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  description: z.string().trim().max(800).optional().default(""),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default("#6d28d9"),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default("#f59e0b"),
  services: z.string().trim().max(500).optional().default(""),
  openingHours: z.string().trim().max(300).optional().default(""),
  notes: z.string().trim().max(800).optional().default(""),
});

const STAFF_EMAILS = ["master@deskindustries.com", "web@deskindustries.com"];
const APP_BASE_URL = "https://deskindustries.com";

function getAdmin(): any {
  const url = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin not configured");
  return createClient(url, key);
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getUnsubscribeToken(admin: any, email: string): Promise<string> {
  const normalized = email.toLowerCase();
  const { data: existing } = await admin
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalized)
    .maybeSingle();
  if (existing && !existing.used_at) return existing.token;
  const token = generateToken();
  await admin
    .from("email_unsubscribe_tokens")
    .upsert({ token, email: normalized }, { onConflict: "email", ignoreDuplicates: true });
  const { data: stored } = await admin
    .from("email_unsubscribe_tokens")
    .select("token")
    .eq("email", normalized)
    .maybeSingle();
  return stored?.token ?? token;
}

async function enqueueEmail(args: {
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
  const subject = typeof tpl.subject === "function" ? tpl.subject(args.templateData as Record<string, unknown>) : tpl.subject;

  const admin = getAdmin();
  const messageId = crypto.randomUUID();
  const unsubscribeToken = await getUnsubscribeToken(admin, args.to);
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
      from: "Foll.IA <noreply@deskindustries.it>",
      sender_domain: "notify.deskindustries.it",
      subject,
      html,
      text: plainText,
      purpose: "transactional",
      label: args.templateName,
      idempotency_key: args.idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });
  if (error) console.error("enqueue_email failed", error);
}

function buildLovablePrompt(d: z.infer<typeof draftSchema>): string {
  const typeLabel = BUSINESS_TYPE_LABELS[d.businessType] || d.businessType;
  const lines: string[] = [];
  lines.push(`Crea un sito vetrina monopagina per "${d.businessName}", un ${typeLabel}${d.city ? ` con sede a ${d.city}` : ""}.`);
  if (d.description) lines.push(`\nIdentità dell'attività: ${d.description}`);
  if (d.services) lines.push(`\nServizi / prodotti / piatti principali: ${d.services}`);
  const contatti: string[] = [];
  if (d.address) contatti.push(`indirizzo: ${d.address}`);
  if (d.phone) contatti.push(`telefono: ${d.phone}`);
  if (d.email) contatti.push(`email: ${d.email}`);
  if (d.openingHours) contatti.push(`orari: ${d.openingHours}`);
  if (contatti.length) lines.push(`\nContatti / informazioni utili: ${contatti.join(" · ")}`);
  lines.push(`\nPalette colori: primario ${d.primaryColor}, secondario ${d.secondaryColor}.`);
  if (d.notes) lines.push(`\nNote del cliente: ${d.notes}`);
  lines.push(`\nStruttura desiderata: hero con headline + sottotitolo + CTA, sezione "Chi siamo", sezione servizi/prodotti/menù, sezione contatti con mappa e orari, footer.`);
  lines.push(`Tono di voce italiano, caldo e professionale. SEO local-business ottimizzato. Mobile-first.`);
  lines.push(`Sottodominio richiesto: ${d.subdomain}.deskinc.app`);
  return lines.join("\n");
}

export const createFolliaDraft = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => draftSchema.parse(input))
  .handler(async ({ data }) => {
    if (RESERVED_SUBDOMAINS.has(data.subdomain)) {
      return { ok: false as const, error: "Questo sottodominio è riservato, scegline un altro." };
    }

    const supabase = getAdmin();

    const { data: existing } = await supabase
      .from("follia_sites")
      .select("id")
      .eq("subdomain", data.subdomain)
      .maybeSingle();
    if (existing) {
      return { ok: false as const, error: "Questo sottodominio è già in uso." };
    }

    const prompt = buildLovablePrompt(data);
    const businessData = {
      name: data.businessName,
      city: data.city,
      primary_color: data.primaryColor,
      secondary_color: data.secondaryColor,
      description: data.description,
      services: data.services,
      notes: data.notes,
      lovable_prompt: prompt,
    };
    const config = {
      opening_hours: data.openingHours,
      address: data.address,
      phone: data.phone,
      email: data.email,
    };

    const { data: site, error: insertErr } = await supabase
      .from("follia_sites")
      .insert({
        lead_email: data.email,
        subdomain: data.subdomain,
        business_type: data.businessType,
        business_data: businessData,
        config,
        status: "draft",
        request_status: "new",
      })
      .select("id")
      .single();

    if (insertErr || !site) {
      console.error("Insert error", insertErr);
      return { ok: false as const, error: "Impossibile salvare la richiesta. Riprova." };
    }

    // Fire-and-forget emails (don't block submit on email failure)
    const adminUrl = `${APP_BASE_URL}/admin/sites/${site.id}`;
    const accountUrl = `${APP_BASE_URL}/auth?mode=signup&email=${encodeURIComponent(data.email)}&redirect=${encodeURIComponent("/account")}`;

    try {
      const staffData = {
        businessName: data.businessName,
        businessType: BUSINESS_TYPE_LABELS[data.businessType] || data.businessType,
        subdomain: data.subdomain,
        email: data.email,
        city: data.city,
        address: data.address,
        phone: data.phone,
        description: data.description,
        services: data.services,
        openingHours: data.openingHours,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        notes: data.notes,
        prompt,
        adminUrl,
      };
      await Promise.all([
        ...STAFF_EMAILS.map((staff) =>
          enqueueEmail({
            templateName: "follia-new-request-staff",
            to: staff,
            idempotencyKey: `follia-request-${site.id}-${staff}`,
            templateData: staffData,
          }),
        ),
        enqueueEmail({
          templateName: "follia-request-received",
          to: data.email,
          idempotencyKey: `follia-request-customer-${site.id}`,
          templateData: { businessName: data.businessName, accountUrl },
        }),
      ]);
    } catch (e) {
      console.error("Failed to enqueue follia request emails", e);
    }

    return { ok: true as const, siteId: site.id };
  });



export const checkFolliaSubdomain = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ subdomain: z.string().trim().toLowerCase().min(3).max(40) }).parse(input),
  )
  .handler(async ({ data }) => {
    if (!/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(data.subdomain)) {
      return { available: false, reason: "Formato non valido (solo lettere, numeri, trattini, 3-40 caratteri)." };
    }
    if (RESERVED_SUBDOMAINS.has(data.subdomain)) {
      return { available: false, reason: "Sottodominio riservato." };
    }
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: existing } = await supabase
      .from("follia_sites")
      .select("id")
      .eq("subdomain", data.subdomain)
      .maybeSingle();
    return { available: !existing, reason: existing ? "Già in uso." : undefined };
  });

// ---------------------------------------------------------------------------
// Prefill from URLs: vecchio sito, sito di ispirazione, Google My Business
// ---------------------------------------------------------------------------

const prefillSchema = z.object({
  oldSiteUrl: z.string().trim().max(500).url().optional().or(z.literal("")),
  inspirationUrl: z.string().trim().max(500).url().optional().or(z.literal("")),
  gmbUrl: z.string().trim().max(500).url().optional().or(z.literal("")),
});

function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h === "ip6-localhost" || h === "ip6-loopback") return true;
  if (h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) return true;
  // IPv4 literal
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [parseInt(m[1], 10), parseInt(m[2], 10)];
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local incl. AWS IMDS
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // multicast / reserved
  }
  // IPv6 literals — block loopback, link-local, ULA, and any v6
  if (h.includes(":")) {
    if (h === "::1" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) return true;
    // Be conservative: block all bare IPv6 literals (we never need them for prefill targets)
    return true;
  }
  return false;
}

async function fetchTextFromUrl(url: string, maxChars = 30000): Promise<{ ok: boolean; text?: string; title?: string; error?: string }> {
  let parsed: URL;
  try {
    parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) return { ok: false, error: "protocol" };
    if (isBlockedHost(parsed.hostname)) return { ok: false, error: "blocked_host" };
    // Only allow standard web ports to avoid hitting internal admin ports
    if (parsed.port && parsed.port !== "80" && parsed.port !== "443") return { ok: false, error: "blocked_port" };
  } catch {
    return { ok: false, error: "invalid_url" };
  }

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6500);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FolliaPrefill/1.0; +https://deskindustries.com)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
      },
    });
    if (!res.ok) return { ok: false, error: `status_${res.status}` };
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/") && !ct.includes("html") && !ct.includes("xml")) {
      return { ok: false, error: "not_html" };
    }
    let html = await res.text();
    if (html.length > 400000) html = html.slice(0, 400000);
    const titleMatch = html.match(/<title[^>]*>([^<]{1,300})<\/title>/i);
    const title = titleMatch?.[1]?.trim();
    // strip script/style/svg/noscript
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return { ok: true, text: cleaned.slice(0, maxChars), title };
  } catch (e: any) {
    return { ok: false, error: e?.name === "AbortError" ? "timeout" : "fetch_error" };
  } finally {
    clearTimeout(t);
  }
}

const PREFILL_SYSTEM_PROMPT = `Sei un assistente che estrae i dati di un'attività locale italiana da pagine web grezze. Ricevi fino a 3 fonti:
- "old_site": il sito web attuale dell'attività (fonte primaria per nome, contatti, descrizione, servizi)
- "inspiration": un sito che l'utente vuole come riferimento di STILE (NON copiare contenuti: estrai solo palette colori e tono di voce)
- "gmb": pagina Google Maps/My Business (fonte primaria per indirizzo, telefono, orari, città)

Restituisci SOLO JSON valido con esattamente questa struttura, usando null per i campi che non riesci a determinare con ragionevole certezza:
{
  "business_type_guess": "restaurant" | "retail_shop" | "barbershop_salon" | "professional" | "other" | null,
  "business_name": string | null,
  "city": string | null,
  "address": string | null,
  "phone": string | null,
  "description": string | null,        // 1-3 frasi, italiano
  "services": string | null,            // lista discorsiva di servizi/prodotti/piatti, max 300 char
  "opening_hours": string | null,       // formato libero leggibile, es. "Lun-Ven 9-19, Sab 9-13"
  "primary_color": string | null,       // hex #rrggbb estratto da 'inspiration' se presente, altrimenti da 'old_site'
  "secondary_color": string | null,
  "tone_notes": string | null,          // max 200 char, derivato SOLO da 'inspiration'
  "subdomain_suggestion": string | null // solo a-z 0-9 e trattini, 3-30 char, basato sul nome
}

Regole critiche:
- Non inventare numeri di telefono, indirizzi o orari: se non li trovi, usa null.
- Non copiare frasi intere dal sito di ispirazione nei campi description/services.
- I colori devono essere hex validi #rrggbb.`;

async function callAiPrefill(payload: {
  oldSite?: { title?: string; text: string };
  inspiration?: { title?: string; text: string };
  gmb?: { title?: string; text: string };
}): Promise<Record<string, unknown> | null> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!lovableKey) return null;

  const parts: string[] = [];
  if (payload.oldSite) parts.push(`=== old_site ===\nTITLE: ${payload.oldSite.title || ""}\n${payload.oldSite.text}`);
  if (payload.inspiration) parts.push(`=== inspiration ===\nTITLE: ${payload.inspiration.title || ""}\n${payload.inspiration.text}`);
  if (payload.gmb) parts.push(`=== gmb ===\nTITLE: ${payload.gmb.title || ""}\n${payload.gmb.text}`);
  if (!parts.length) return null;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: PREFILL_SYSTEM_PROMPT },
        { role: "user", content: parts.join("\n\n") },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    console.error("Prefill AI error", res.status, await res.text().catch(() => ""));
    return null;
  }
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) return null;
  try { return JSON.parse(content); } catch { return null; }
}

export const prefillFolliaFromUrls = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => prefillSchema.parse(input))
  .handler(async ({ data }) => {
    const oldSiteUrl = data.oldSiteUrl?.trim() || "";
    const inspirationUrl = data.inspirationUrl?.trim() || "";
    const gmbUrl = data.gmbUrl?.trim() || "";

    if (!oldSiteUrl && !inspirationUrl && !gmbUrl) {
      return { ok: true as const, data: {}, sources: [] as Array<{ url: string; kind: string; ok: boolean; error?: string }> };
    }

    const tasks: Array<Promise<{ kind: "old_site" | "inspiration" | "gmb"; url: string; res: Awaited<ReturnType<typeof fetchTextFromUrl>> }>> = [];
    if (oldSiteUrl) tasks.push(fetchTextFromUrl(oldSiteUrl).then((res) => ({ kind: "old_site", url: oldSiteUrl, res })));
    if (inspirationUrl) tasks.push(fetchTextFromUrl(inspirationUrl).then((res) => ({ kind: "inspiration", url: inspirationUrl, res })));
    if (gmbUrl) tasks.push(fetchTextFromUrl(gmbUrl, 15000).then((res) => ({ kind: "gmb", url: gmbUrl, res })));

    const results = await Promise.all(tasks);
    const sources = results.map((r) => ({ url: r.url, kind: r.kind, ok: r.res.ok, error: r.res.error }));

    const payload: Parameters<typeof callAiPrefill>[0] = {};
    for (const r of results) {
      if (!r.res.ok || !r.res.text) continue;
      payload[r.kind === "old_site" ? "oldSite" : r.kind === "inspiration" ? "inspiration" : "gmb"] = {
        title: r.res.title,
        text: r.res.text,
      };
    }

    const aiData = await callAiPrefill(payload);
    if (!aiData) {
      return { ok: true as const, data: {}, sources };
    }

    // sanitize / whitelist fields
    const allowedTypes = new Set(["restaurant", "retail_shop", "barbershop_salon", "professional", "other"]);
    const hex = (v: unknown) => (typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v.toLowerCase() : null);
    const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
    const sub = (v: unknown) => {
      if (typeof v !== "string") return null;
      const s = v.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "").slice(0, 30);
      return s.length >= 3 ? s : null;
    };
    const cleaned = {
      business_type_guess: typeof aiData.business_type_guess === "string" && allowedTypes.has(aiData.business_type_guess) ? aiData.business_type_guess : null,
      business_name: str(aiData.business_name, 80),
      city: str(aiData.city, 80),
      address: str(aiData.address, 200),
      phone: str(aiData.phone, 40),
      description: str(aiData.description, 800),
      services: str(aiData.services, 500),
      opening_hours: str(aiData.opening_hours, 300),
      primary_color: hex(aiData.primary_color),
      secondary_color: hex(aiData.secondary_color),
      tone_notes: str(aiData.tone_notes, 200),
      subdomain_suggestion: sub(aiData.subdomain_suggestion),
    };

    return { ok: true as const, data: cleaned, sources };
  });
