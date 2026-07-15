import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";

export type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
export type BlogCategory = "case-study" | "news" | "insight";

function serverPublic() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

/* ---------- PUBLIC READS ---------- */

export const listPublishedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverPublic();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, cover_url, category, tags, author_name, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const supabase = serverPublic();
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return post;
  });

/* ---------- ADMIN ---------- */

export const listAllPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("id, slug, title, category, published, published_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getPostForEdit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: post, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!post) throw new Error("Post non trovato");
    return post;
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/, "Solo minuscole, numeri, trattini"),
  title: z.string().trim().min(2).max(200),
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  cover_url: z.string().trim().max(1000).optional().or(z.literal("")),
  content_md: z.string().max(200000),
  category: z.string().trim().min(1).max(40),
  tags: z.array(z.string().trim().max(40)).max(20).default([]),
  author_name: z.string().trim().min(1).max(120).default("Desk Industries"),
  published: z.boolean().default(false),
});

export const upsertPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => upsertSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const row = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt || null,
      cover_url: data.cover_url || null,
      content_md: data.content_md,
      category: data.category,
      tags: data.tags,
      author_name: data.author_name,
      published: data.published,
      published_at: data.published ? now : null,
    };
    if (data.id) {
      const { data: existing } = await supabaseAdmin
        .from("blog_posts")
        .select("published, published_at")
        .eq("id", data.id)
        .maybeSingle();
      // preserve original published_at if already published
      const published_at = data.published
        ? existing?.published_at || now
        : null;
      const { data: updated, error } = await supabaseAdmin
        .from("blog_posts")
        .update({ ...row, published_at })
        .eq("id", data.id)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { id: updated.id };
    } else {
      const { data: inserted, error } = await supabaseAdmin
        .from("blog_posts")
        .insert(row)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { id: inserted.id };
    }
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const uploadCoverImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { filename: string; contentBase64: string; contentType: string }) =>
    z.object({
      filename: z.string().min(1).max(200),
      contentBase64: z.string().min(1),
      contentType: z.string().min(1).max(100),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bytes = Uint8Array.from(atob(data.contentBase64), (c) => c.charCodeAt(0));
    const safeName = data.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${Date.now()}-${safeName}`;
    const { error } = await supabaseAdmin.storage
      .from("blog-covers")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (error) throw new Error(error.message);
    const { data: pub } = supabaseAdmin.storage.from("blog-covers").getPublicUrl(path);
    return { url: pub.publicUrl };
  });
