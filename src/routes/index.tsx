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
      { property: "og:url", content: "https://www.deskindustries.com/" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Desk Industries — E-commerce e digitale per negozi fisici" },
      {
        name: "description",
        content:
          "Portiamo il tuo negozio fisico online: e-commerce, sync cassa e magazzino, agenti AI, advertising drive-to-store e branding. Zero vincoli, paghi a consumo.",
      },
      { property: "og:title", content: "Desk Industries — E-commerce e digitale per negozi fisici" },
      {
        property: "og:description",
        content:
          "Dal negozio fisico all'e-commerce scalabile: inventario, logistica, vendite e branding. Zero vincoli contrattuali.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.deskindustries.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "@id": "https://www.deskindustries.com/#business",
          name: "Desk Industries",
          legalName: "Desk Industries SRLS",
          url: "https://www.deskindustries.com",
          parentOrganization: { "@id": "https://www.deskindustries.com/#organization" },
          description:
            "Agenzia digitale per attività locali con negozi fisici e reti in franchising: e-commerce, sincronizzazione cassa e magazzino, agenti AI, advertising drive-to-store, branding e content. Nessun vincolo contrattuale, pagamento a consumo settimanale o mensile.",
          areaServed: { "@type": "Country", name: "Italia" },
          address: { "@type": "PostalAddress", addressCountry: "IT" },
          knowsAbout: ["E-commerce", "Shopify", "Omnicanalità retail", "Gestione inventario", "Agenti AI", "Advertising drive-to-store", "Branding e packaging", "SEO locale"],
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Servizi retail-to-digital",
            itemListElement: ["Sviluppo e-commerce e app Click & Collect", "Sync cassa, magazzino e store online", "Agenti AI per ordini, spedizioni e resi", "Campagne Meta e Google drive-to-store", "Branding e packaging per store e franchising", "Content creation in negozio", "Consulenza retail-to-digital"].map((n) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n } })),
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
