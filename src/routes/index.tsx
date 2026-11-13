import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/HomePage";
import { listPublishedPosts } from "@/lib/blog.functions";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const posts = await listPublishedPosts();
      return posts.slice(0, 3);
    } catch {
      return [];
    }
  },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Desk Industries — Gruppo di digitalizzazione per PMI" },
      {
        name: "description",
        content:
          "Gruppo di digitalizzazione per PMI: agenti AI e specialisti per marketing, prodotti proprietari (Arkeo) e automazioni no-code.",
      },
      { property: "og:title", content: "Desk Industries — Gruppo di digitalizzazione per PMI" },
      {
        property: "og:description",
        content: "Team di agenti AI + specialisti per digitalizzare la tua azienda.",
      },
    ],
    links: [{ rel: "canonical", href: "https://deskindustries.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": "https://deskindustries.lovable.app/#localbusiness",
          name: "Desk Industries",
          legalName: "Desk Industries SRLS",
          url: "https://deskindustries.lovable.app",
          description:
            "Gruppo di digitalizzazione per PMI: marketing con metodo COCO, prodotti proprietari e automazioni.",
          areaServed: "IT",
          address: {
            "@type": "PostalAddress",
            addressCountry: "IT",
          },
        }),
      },
    ],
  }),
  component: HomeRoute,
});

function HomeRoute() {
  const latestPosts = Route.useLoaderData();
  return <HomePage latestPosts={latestPosts} />;
}
