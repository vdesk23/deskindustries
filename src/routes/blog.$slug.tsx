import { draftBeforeLoad, draftHead } from "@/lib/draft-route";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Calendar } from "lucide-react";
import { getPostBySlug } from "@/lib/blog.functions";

export const Route = createFileRoute("/blog/$slug")({
  beforeLoad: draftBeforeLoad,
  head: () => draftHead,
  loader: async ({ params }) => {
    const post = await getPostBySlug({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Articolo non trovato — Desk Industries" }, { name: "robots", content: "noindex" }] };
    }
    const desc = loaderData.excerpt ?? `${loaderData.title} — Desk Industries`;
    const url = `https://deskindustries.lovable.app/blog/${params.slug}`;
    return {
      meta: [
        { title: `${loaderData.title} — Blog Desk Industries` },
        { name: "description", content: desc },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(loaderData.cover_url
          ? [
              { property: "og:image", content: loaderData.cover_url },
              { name: "twitter:image", content: loaderData.cover_url },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: loaderData.title,
            description: desc,
            image: loaderData.cover_url ?? undefined,
            author: { "@type": "Person", name: loaderData.author_name ?? "Desk Industries" },
            publisher: {
              "@type": "Organization",
              name: "Desk Industries",
            },
            datePublished: loaderData.published_at ?? undefined,
            dateModified: loaderData.updated_at ?? loaderData.published_at ?? undefined,
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  component: BlogPostPage,
  notFoundComponent: BlogNotFound,
  errorComponent: BlogError,
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

function BlogPostPage() {
  const data = Route.useLoaderData();
  if (!data) return null;

  return (
    <article className="mx-auto max-w-3xl px-5 lg:px-8 py-16 lg:py-24">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-amber transition-colors mb-10"
      >
        <ArrowLeft className="size-4" /> Tutti gli articoli
      </Link>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-5">
        <span className="uppercase tracking-widest text-amber">
          {CATEGORY_LABELS[data.category] ?? data.category}
        </span>
        {data.published_at && (
          <>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3" /> {formatDate(data.published_at)}
            </span>
          </>
        )}
        <span>·</span>
        <span>{data.author_name}</span>
      </div>

      <h1 className="text-4xl lg:text-6xl font-display font-medium leading-[1.05] tracking-tight text-balance">
        {data.title}
      </h1>
      {data.excerpt && (
        <p className="mt-6 text-xl text-muted-foreground leading-relaxed">{data.excerpt}</p>
      )}

      {data.cover_url && (
        <div className="mt-10 rounded-2xl overflow-hidden border border-border aspect-[16/9]">
          <img src={data.cover_url} alt={data.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="mt-12 prose prose-invert prose-amber max-w-none blog-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content_md}</ReactMarkdown>
      </div>

      {data.tags.length > 0 && (
        <div className="mt-12 flex flex-wrap gap-2">
          {data.tags.map((t: string) => (
            <span
              key={t}
              className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

function BlogNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">404</p>
      <h1 className="text-4xl font-display font-semibold">Articolo non trovato</h1>
      <p className="mt-4 text-muted-foreground">
        L'articolo che stai cercando non esiste o non è più pubblico.
      </p>
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 mt-8 text-amber hover:brightness-110"
      >
        <ArrowLeft className="size-4" /> Torna al blog
      </Link>
    </div>
  );
}

function BlogError({ error }: { error: Error }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-2xl font-display font-semibold">Errore nel caricamento</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  );
}
