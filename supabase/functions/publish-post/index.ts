// Edge Function: publish-post
// Accepts POST requests protected by an API key (header: x-api-key or Authorization: Bearer <key>)
// Inserts a row into public.blog_posts.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-api-key, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const expected = Deno.env.get("PUBLISH_POST_API_KEY");
  if (!expected) return json(500, { error: "Server misconfigured" });

  const provided =
    req.headers.get("x-api-key") ??
    (req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "");

  // constant-time-ish compare
  const a = new TextEncoder().encode(provided);
  const b = new TextEncoder().encode(expected);
  let ok = a.length === b.length;
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  ok = ok && diff === 0;
  if (!ok) return json(401, { error: "Unauthorized" });

  let payload: Record<string, any>;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const {
    title,
    slug,
    content_html,
    content_markdown,
    excerpt,
    meta_description,
    cover_image,
    category,
    tags,
    author,
    status,
    published_at,
  } = payload ?? {};

  if (typeof title !== "string" || title.trim().length < 2) {
    return json(400, { error: "`title` is required" });
  }
  if (content_markdown != null && typeof content_markdown !== "string") {
    return json(400, { error: "`content_markdown` must be a string" });
  }
  if (content_html != null && typeof content_html !== "string") {
    return json(400, { error: "`content_html` must be a string" });
  }

  const finalSlug = (typeof slug === "string" && slug.trim() ? slug : slugify(title)).toLowerCase();
  if (!/^[a-z0-9-]+$/.test(finalSlug)) {
    return json(400, { error: "`slug` must contain only lowercase letters, numbers and hyphens" });
  }

  const isPublished = status
    ? String(status).toLowerCase() === "published"
    : true;

  const nowIso = new Date().toISOString();
  const publishedAtIso = isPublished
    ? (published_at ? new Date(published_at).toISOString() : nowIso)
    : null;

  const row = {
    slug: finalSlug,
    title: title.trim(),
    excerpt: typeof excerpt === "string" ? excerpt : null,
    // schema stores markdown; prefer markdown, else fall back to html
    content_md: (content_markdown ?? content_html ?? "") as string,
    // extra fields kept for callers that send them; ignored if columns absent
    meta_description: typeof meta_description === "string" ? meta_description : null,
    cover_url: typeof cover_image === "string" ? cover_image : null,
    category: typeof category === "string" && category ? category : "insight",
    tags: Array.isArray(tags) ? tags.filter((t) => typeof t === "string").slice(0, 20) : [],
    author_name: typeof author === "string" && author ? author : "Desk Industries",
    published: isPublished,
    published_at: publishedAtIso,
  };

  // Drop keys the table doesn't have (defensive if schema differs)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const insert = async (r: Record<string, any>) =>
    supabase.from("blog_posts").insert(r).select("id, slug").single();

  let { data, error } = await insert(row);
  if (error && /column .* does not exist/i.test(error.message)) {
    const { meta_description: _m, ...safe } = row;
    ({ data, error } = await insert(safe));
  }

  if (error) {
    return json(error.code === "23505" ? 409 : 500, {
      error: error.message,
      code: error.code,
    });
  }

  return json(201, { ok: true, id: data!.id, slug: data!.slug });
});
