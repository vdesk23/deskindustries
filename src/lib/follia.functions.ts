import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const RESERVED_SUBDOMAINS = new Set([
  "www", "api", "app", "admin", "account", "auth", "login", "signup",
  "dashboard", "mail", "email", "ftp", "ssh", "test", "staging", "dev",
  "preview", "follia", "deskindustries", "desk", "support", "help",
  "blog", "docs", "status", "cdn", "static", "assets", "media", "img",
  "store", "shop", "pay", "checkout", "billing",
]);

const businessTypes = ["restaurant", "retail_shop", "barbershop_salon", "professional", "other"] as const;

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

const SYSTEM_PROMPT = `Sei un copywriter italiano specializzato in landing page locali. Ricevi i dati grezzi di un'attività e produci i contenuti di un sito vetrina elegante e persuasivo, ottimizzato SEO local-business.

Restituisci SOLO JSON valido con questa struttura:
{
  "hero_title": string (max 60 caratteri, accattivante, con nome dell'attività),
  "hero_subtitle": string (max 130 caratteri, beneficio principale),
  "hero_cta": string (es. "Prenota un tavolo", max 24 caratteri),
  "about_title": string (max 50 caratteri),
  "about_body": string (200-400 caratteri, racconta l'attività in modo caldo),
  "features": [{ "icon": "sparkles"|"star"|"heart"|"award"|"clock"|"map", "title": string (max 40), "description": string (max 120) }] (esattamente 3 elementi),
  "services_intro": string (max 200 caratteri, introduce la lista di servizi/prodotti/menù),
  "seo_meta_title": string (max 60 caratteri, con keyword locale),
  "seo_meta_description": string (max 155 caratteri),
  "seed_items": [{ "name": string, "description": string (max 120), "price_display": string }] (3-6 voci di esempio coerenti col tipo di attività: piatti se ristorante, prodotti se negozio, servizi se salone/professional)
}

Tono: caldo, professionale, italiano corretto, senza emoji nei titoli. Mai inventare dati di contatto.`;

async function generateContent(payload: z.infer<typeof draftSchema>): Promise<Record<string, unknown>> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!lovableKey) throw new Error("LOVABLE_API_KEY missing");

  const businessTypeLabel: Record<string, string> = {
    restaurant: "ristorante",
    retail_shop: "negozio al dettaglio (vetrina, non e-commerce)",
    barbershop_salon: "barbiere / salone di bellezza",
    professional: "studio professionale",
    other: "altra attività locale",
  };

  const userPrompt = `Tipo attività: ${businessTypeLabel[payload.businessType]}
Nome: ${payload.businessName}
Città: ${payload.city || "non specificata"}
Indirizzo: ${payload.address || "non specificato"}
Telefono: ${payload.phone || "non specificato"}
Descrizione fornita dal cliente: ${payload.description || "—"}
Servizi/prodotti chiave: ${payload.services || "—"}
Orari indicativi: ${payload.openingHours || "—"}
Note: ${payload.notes || "—"}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("AI gateway error", res.status, txt);
    throw new Error("AI generation failed");
  }
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");
  return JSON.parse(content);
}

async function sendPreviewEmail(email: string, businessName: string, siteId: string, baseUrl: string) {
  try {
    const previewUrl = `${baseUrl}/auth?mode=signup&redirect=${encodeURIComponent(`/account/sites/${siteId}`)}&email=${encodeURIComponent(email)}`;
    await fetch(`${baseUrl}/api/public/follia-preview-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, businessName, previewUrl, siteId }),
    });
  } catch (e) {
    console.error("Failed to enqueue preview email", e);
  }
}

export const createFolliaDraft = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => draftSchema.parse(input))
  .handler(async ({ data }) => {
    if (RESERVED_SUBDOMAINS.has(data.subdomain)) {
      return { ok: false as const, error: "Questo sottodominio è riservato, scegline un altro." };
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: existing } = await supabase
      .from("follia_sites")
      .select("id")
      .eq("subdomain", data.subdomain)
      .maybeSingle();
    if (existing) {
      return { ok: false as const, error: "Questo sottodominio è già in uso." };
    }

    let generated: Record<string, unknown>;
    try {
      generated = await generateContent(data);
    } catch (e) {
      console.error(e);
      return { ok: false as const, error: "Generazione contenuti non riuscita. Riprova tra poco." };
    }

    const businessData = {
      name: data.businessName,
      city: data.city,
      primary_color: data.primaryColor,
      secondary_color: data.secondaryColor,
      generated,
    };
    const config = {
      show_map: true,
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
      })
      .select("id")
      .single();

    if (insertErr || !site) {
      console.error("Insert error", insertErr);
      return { ok: false as const, error: "Impossibile salvare il sito. Riprova." };
    }

    // seed items based on type
    const seedItems = (generated.seed_items as Array<{ name: string; description: string; price_display: string }>) || [];
    if (data.businessType === "restaurant" && seedItems.length) {
      await supabase.from("follia_menu_items").insert(
        seedItems.map((it, i) => ({
          site_id: site.id,
          category: "Menù",
          name: it.name,
          description: it.description,
          price_cents: null,
          position: i,
        })),
      );
    } else if (data.businessType === "retail_shop" && seedItems.length) {
      await supabase.from("follia_products").insert(
        seedItems.map((it, i) => ({
          site_id: site.id,
          name: it.name,
          description: it.description,
          price_display: it.price_display,
          position: i,
        })),
      );
    } else if ((data.businessType === "barbershop_salon" || data.businessType === "professional") && seedItems.length) {
      await supabase.from("follia_services").insert(
        seedItems.map((it, i) => ({
          site_id: site.id,
          name: it.name,
          description: it.description,
          price_cents: null,
          position: i,
        })),
      );
    }

    // fire-and-forget email
    const origin = process.env.PUBLIC_SITE_URL || "https://deskindustries.com";
    sendPreviewEmail(data.email, data.businessName, site.id, origin).catch(() => {});

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

async function fetchTextFromUrl(url: string, maxChars = 30000): Promise<{ ok: boolean; text?: string; title?: string; error?: string }> {
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return { ok: false, error: "protocol" };
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
