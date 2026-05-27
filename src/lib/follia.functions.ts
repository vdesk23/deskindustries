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
