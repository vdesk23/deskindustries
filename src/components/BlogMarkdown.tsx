import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "@tanstack/react-router";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function textOf(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textOf).join("");
  if (children && typeof children === "object" && "props" in children)
    return textOf((children as { props: { children?: React.ReactNode } }).props.children);
  return "";
}

const components: Components = {
  h2: ({ children }) => (
    <h2
      id={slugify(textOf(children))}
      className="scroll-mt-24 mt-16 mb-6 text-3xl lg:text-4xl font-display font-medium tracking-tight text-foreground text-balance"
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-10 mb-4 text-xl lg:text-2xl font-display font-medium text-foreground">{children}</h3>
  ),
  p: ({ children, node }) => {
    // Paragraphs containing only an image become figures (avoid <figure> inside <p>)
    const only = node?.children?.length === 1 && (node.children[0] as { tagName?: string }).tagName === "img";
    if (only) return <>{children}</>;
    return <p className="my-6 text-lg leading-[1.8] text-foreground/85">{children}</p>;
  },
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="text-foreground/90">{children}</em>,
  a: ({ href = "", children }) => {
    const cls = "text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber transition-colors";
    if (href.startsWith("/") && !href.startsWith("//") && !href.includes("#")) {
      return <Link to={href} className={cls}>{children}</Link>;
    }
    const external = /^https?:\/\//.test(href);
    return (
      <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  },
  img: ({ src, alt, title }) => (
    <figure className="my-12">
      <img
        src={typeof src === "string" ? src : undefined}
        alt={alt ?? ""}
        title={title}
        loading="lazy"
        decoding="async"
        width={1600}
        height={900}
        className="w-full h-auto rounded-2xl border border-border"
      />
      {alt && <figcaption className="mt-3 text-sm text-muted-foreground text-center">{alt}</figcaption>}
    </figure>
  ),
  ul: ({ children }) => <ul className="my-6 space-y-3 pl-6 list-disc marker:text-amber text-lg leading-[1.8] text-foreground/85">{children}</ul>,
  ol: ({ children }) => <ol className="my-6 space-y-3 pl-6 list-decimal marker:text-amber text-lg leading-[1.8] text-foreground/85">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="my-10 border-l-4 border-amber bg-card/60 rounded-r-2xl px-6 py-4 text-xl font-display text-foreground [&_p]:my-2 [&_p]:text-xl">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-12 border-border" />,
};

export function extractHeadings(md: string) {
  return md
    .split("\n")
    .filter((l) => /^##\s+/.test(l))
    .map((l) => {
      const text = l.replace(/^##\s+/, "").trim();
      return { text, id: slugify(text) };
    });
}

export function readingMinutes(md: string) {
  return Math.max(1, Math.round(md.split(/\s+/).length / 200));
}

export function BlogMarkdown({ source }: { source: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{source}</ReactMarkdown>;
}
