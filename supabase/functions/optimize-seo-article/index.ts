import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_INPUT_CHARS = 30000;

const SYSTEM_PROMPT = `Sei un esperto di SEO e AIO (AI Optimization) per articoli di blog in italiano.
Il tuo compito: prendere un articolo grezzo e restituire una versione ottimizzata per motori di ricerca e AI generative, mantenendo voce, stile e contenuto dell'autore.

Linee guida:
- Mantieni la lingua originale (italiano se non diversamente indicato).
- Struttura con H1 (1 solo), H2, H3 chiari e keyword-rich ma naturali.
- Frasi brevi, paragrafi scorrevoli, leggibilità Flesch alta.
- Inserisci entità semantiche, sinonimi e correlate per AIO.
- Liste puntate dove utile (LLM friendly).
- FAQ finale se l'argomento lo permette.
- Non inventare dati, fatti, citazioni o link.
- Mantieni la formattazione Markdown.

Output JSON STRETTO con questi campi:
{
  "optimized_markdown": string,
  "meta_description": string (max 155 caratteri, accattivante, con keyword principale),
  "slug": string (kebab-case, max 60 caratteri, no stopword),
  "permalink_suggestion": string (es. "/blog/<slug>"),
  "alt_ideas": [{ "context": string, "alt": string }] (3-6 idee ALT per possibili immagini),
  "changes": [{ "type": "struttura"|"titoli"|"keyword"|"leggibilità"|"semantica"|"altro", "before": string, "after": string, "reason": string }] (almeno 5 modifiche significative)
}

Restituisci SOLO il JSON, nessun testo prima o dopo.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonError("Unauthorized", 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) return jsonError("Unauthorized", 401);
    const userId = userData.user.id;

    const body = await req.json();
    const article: string = (body?.article ?? "").toString();
    const keyword: string = (body?.keyword ?? "").toString().slice(0, 100);
    const tone: string = (body?.tone ?? "").toString().slice(0, 50);

    if (!article.trim()) return jsonError("Articolo mancante", 400);
    if (article.length > MAX_INPUT_CHARS) {
      return jsonError(`Articolo troppo lungo (max ${MAX_INPUT_CHARS} caratteri)`, 400);
    }

    // Quota check
    const { data: quota, error: qErr } = await supabase.rpc("get_seo_quota", { _user_id: userId });
    if (qErr) throw qErr;
    const q = quota as {
      unlimited: boolean;
      plan: string;
      limit: number;
      used_this_month: number;
      extra_credits: number;
    };

    let creditIdToConsume: string | null = null;
    let isExtra = false;

    if (!q.unlimited) {
      if (q.used_this_month >= q.limit) {
        if (q.extra_credits > 0) {
          // Reserve one extra credit
          const { data: credit } = await supabase
            .from("seo_optimizer_extra_credits")
            .select("id")
            .eq("user_id", userId)
            .is("consumed_at", null)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();
          if (!credit) return jsonError("Quota esaurita", 402);
          creditIdToConsume = credit.id;
          isExtra = true;
        } else {
          return new Response(
            JSON.stringify({
              error: "quota_exceeded",
              message: "Hai esaurito la quota mensile. Acquista un articolo extra o passa al piano superiore.",
              quota: q,
            }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      }
    }

    // Call Lovable AI Gateway
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY missing");

    const userPrompt = [
      keyword ? `Keyword principale: ${keyword}` : null,
      tone ? `Tono di voce: ${tone}` : null,
      "Articolo da ottimizzare:\n\n" + article,
    ]
      .filter(Boolean)
      .join("\n");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      if (aiRes.status === 429) return jsonError("Troppi tentativi, riprova tra poco.", 429);
      if (aiRes.status === 402) return jsonError("Crediti AI esauriti. Contatta l'amministratore.", 402);
      console.error("AI gateway error:", aiRes.status, text);
      return jsonError("Errore servizio AI", 502);
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "{}";
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // try to extract JSON block
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : {};
    }

    const optimized = String(parsed.optimized_markdown ?? "").trim();
    if (!optimized) return jsonError("Risposta AI invalida", 502);

    // Consume credit / log usage
    if (creditIdToConsume) {
      await supabase
        .from("seo_optimizer_extra_credits")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", creditIdToConsume)
        .is("consumed_at", null);
    }

    const title = optimized
      .split("\n")
      .find((l) => l.trim().startsWith("#"))
      ?.replace(/^#+\s*/, "")
      .slice(0, 200) || null;
    const preview = optimized.replace(/[#*`>_\-]/g, "").trim().slice(0, 180);

    await supabase.from("seo_optimizer_usage").insert({
      user_id: userId,
      is_extra: isExtra,
      extra_credit_id: creditIdToConsume,
      input_chars: article.length,
      output_chars: optimized.length,
      title,
      preview,
    });

    // Updated quota for the client
    const { data: newQuota } = await supabase.rpc("get_seo_quota", { _user_id: userId });

    return new Response(
      JSON.stringify({
        result: {
          optimized_markdown: optimized,
          meta_description: String(parsed.meta_description ?? ""),
          slug: String(parsed.slug ?? ""),
          permalink_suggestion: String(parsed.permalink_suggestion ?? ""),
          alt_ideas: Array.isArray(parsed.alt_ideas) ? parsed.alt_ideas : [],
          changes: Array.isArray(parsed.changes) ? parsed.changes : [],
        },
        quota: newQuota,
        consumed_extra: isExtra,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("optimize-seo-article error:", e);
    return jsonError((e as Error).message || "Errore interno", 500);
  }

  function jsonError(message: string, status: number) {
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
