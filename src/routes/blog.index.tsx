import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar } from "lucide-react";
import { listPublishedPosts } from "@/lib/blog.functions";

export const Route = createFileRoute("/blog/")({
  loader: () => listPublishedPosts(),
  head: () => ({
    meta: [
      { title: "Blog — Desk Industries" },
      {
        name: "description",
        content:
          "Case study, news e insight sulla digitalizzazione delle PMI dal gruppo Desk Industries.",
      },
      { property: "og:title", content: "Blog — Desk Industries" },
      {
        property: "og:description",
        content: "Case study, news e insight sulla digitalizzazione delle PMI.",
      },
    ],
  }),
  component: BlogIndexPage,
});

const CATEGORY_LABELS: Record<string, string> = {
  "case-study": "Case study",
  news: "News",
  insight: "Insight",
};

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

function BlogIndexPage() {
  const posts = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20 lg:py-28">
      <div className="max-w-3xl mb-16">
        <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">Blog</p>
        <h1 className="text-5xl lg:text-7xl font-display font-medium tracking-tight text-balance">
          Case study, news e{" "}
          <span className="italic text-amber font-normal">insight</span>.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Progetti reali, risultati misurabili e riflessioni sulla digitalizzazione delle PMI.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-3xl border border-border bg-surface-elevated p-12 text-center text-muted-foreground">
          Presto pubblicheremo qui i nostri primi articoli.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Link
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group block h-full rounded-2xl border border-border bg-surface-elevated overflow-hidden hover:border-amber transition-colors"
              >
                <div className="aspect-[16/10] bg-surface overflow-hidden">
                  {p.cover_url ? (
                    <img
                      src={p.cover_url}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-amber opacity-30" />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="uppercase tracking-widest text-amber">
                      {CATEGORY_LABELS[p.category] ?? p.category}
                    </span>
                    {p.published_at && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" /> {formatDate(p.published_at)}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="text-xl font-display font-semibold leading-tight group-hover:text-amber transition-colors">
                    {p.title}
                  </h2>
                  {p.excerpt && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>
                  )}
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm text-amber">
                    Leggi <ArrowUpRight className="size-4" />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
