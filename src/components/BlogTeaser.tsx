import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Calendar } from "lucide-react";
import { Card3D } from "@/components/ui/Card3D";
import { Button } from "@/components/ui/button";
import type { BlogListItem } from "@/lib/blog.functions";

const CATEGORY_LABELS: Record<string, string> = {
  "case-study": "Case study",
  news: "News",
  insight: "Insight",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function BlogTeaser({ posts }: { posts: BlogListItem[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 mb-16 items-end">
          <div className="lg:col-span-7">
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">Blog</p>
            <h2 className="text-4xl lg:text-5xl font-display font-medium tracking-tight text-balance">
              Le ultime dal <span className="italic text-amber font-normal">blog</span>.
            </h2>
          </div>
          <p className="lg:col-span-5 text-muted-foreground leading-relaxed">
            Progetti reali, risultati misurabili e riflessioni sulla digitalizzazione delle PMI.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <motion.article
              key={p.id}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <Card3D intensity={6} className="rounded-3xl h-full">
                <Link
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group block h-full rounded-3xl overflow-hidden border border-border bg-surface-elevated/50 backdrop-blur-xl hover:border-amber transition-colors"
                >
                  <div className="aspect-[16/10] bg-surface overflow-hidden">
                    {p.cover_url ? (
                      <img
                        src={p.cover_url}
                        alt={p.title}
                        width={640}
                        height={400}
                        loading="lazy"
                        decoding="async"
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
                    <h3 className="text-xl font-display font-semibold leading-tight group-hover:text-amber transition-colors">
                      {p.title}
                    </h3>
                    {p.excerpt && (
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>
                    )}
                    <div className="mt-5 inline-flex items-center gap-1.5 text-sm text-amber">
                      Leggi <ArrowUpRight className="size-4" />
                    </div>
                  </div>
                </Link>
              </Card3D>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link to="/blog">
            <Card3D className="rounded-full" intensity={12}>
              <Button variant="hero" size="xl" className="rounded-full">
                Leggi tutto <ArrowRight />
              </Button>
            </Card3D>
          </Link>
        </div>
      </div>
    </section>
  );
}
