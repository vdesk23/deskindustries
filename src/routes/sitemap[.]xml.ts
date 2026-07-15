import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listPublishedPosts } from "@/lib/blog.functions";

const BASE_URL = "https://deskindustries.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const STATIC_ROUTES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/chi-siamo", changefreq: "monthly", priority: "0.8" },
  { path: "/metodo-coco", changefreq: "monthly", priority: "0.8" },
  { path: "/pacchetti", changefreq: "monthly", priority: "0.9" },
  { path: "/settori", changefreq: "monthly", priority: "0.8" },
  { path: "/progetti", changefreq: "monthly", priority: "0.7" },
  { path: "/follia", changefreq: "monthly", priority: "0.7" },
  { path: "/contatti", changefreq: "monthly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/tools/ottimizzatore-seo", changefreq: "monthly", priority: "0.6" },
  { path: "/tools/piano-contenuti", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/termini", changefreq: "yearly", priority: "0.3" },
];

const SECTOR_SLUGS = [
  "barbieri",
  "ristoranti",
  "palestre",
  "estetica",
  "fioristi",
  "professionisti",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [...STATIC_ROUTES];

        for (const slug of SECTOR_SLUGS) {
          entries.push({ path: `/settori/${slug}`, changefreq: "monthly", priority: "0.7" });
        }

        try {
          const posts = await listPublishedPosts();
          for (const p of posts as Array<{ slug: string; published_at: string | null; updated_at?: string | null }>) {
            entries.push({
              path: `/blog/${p.slug}`,
              lastmod: (p.updated_at ?? p.published_at ?? undefined)?.slice(0, 10),
              changefreq: "monthly",
              priority: "0.6",
            });
          }
        } catch (e) {
          console.error("sitemap: failed to load blog posts", e);
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
