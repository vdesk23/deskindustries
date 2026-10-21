// Browser-safe data shared by the 3D stage and the HTML console.
export type ArtifactKind = "code" | "gear" | "prism" | "lens" | "target" | "cart" | "waves";

export type ExpertiseArea = {
  id: string;
  title: string;
  badge: string;
  tagline: string;
  services: string[];
  stack: string[];
  delivery: string;
  artifact: ArtifactKind;
};

/** Brand scene colors (mirror of --amber / --foreground tokens in styles.css). */
export const SCENE_COLORS = { amber: "#EAA210", light: "#EAF0F6", violet: "#7A5C86", dark: "#2A1F33" };

export const EXPERTISE_AREAS: ExpertiseArea[] = [
  { id: "web", title: "Sviluppo Web/Mobile", badge: "Full stack", artifact: "code", tagline: "Applicazioni, siti e landing page che si trovano e convertono.", services: ["App web e mobile", "Siti web e landing page", "Ottimizzazione SEO/GEO", "Audit tecnici e di performance"], stack: ["React", "Lovable", "Shopify", "Squarespace"], delivery: "Landing in 7 giorni, siti in 3–4 settimane" },
  { id: "auto", title: "Automazioni", badge: "AI-powered", artifact: "gear", tagline: "Software e automazioni cloud-based, agentic-based e on-premises.", services: ["Automazioni di processo", "Agenti AI su misura", "Tecnologia Google (Firebase, Vertex AI)", "Modelli Anthropic"], stack: ["Firebase", "Vertex AI", "Anthropic", "n8n"], delivery: "Primo flusso attivo in 2 settimane" },
  { id: "brand", title: "Branding", badge: "Identità", artifact: "prism", tagline: "Un'identità chiara, coerente e pronta per il mercato.", services: ["Brand book", "Studio dell'archetipo del brand", "Biglietti da visita, flyer, shop bag", "Strategie di naming e pricing"], stack: ["Brand book", "Naming", "Pricing", "Print"], delivery: "Brand book in 3 settimane" },
  { id: "content", title: "Content Creation", badge: "Video & social", artifact: "lens", tagline: "Contenuti social che fermano lo scroll.", services: ["Shooting girati da noi o con il tuo materiale", "Montaggio con animazioni 2D e 3D", "Video generati e prodotti con AI"], stack: ["Shooting", "Motion 2D/3D", "Video AI"], delivery: "Piano editoriale mensile" },
  { id: "ads", title: "Advertising", badge: "Performance", artifact: "target", tagline: "Campagne Meta e Google in formula performance marketing.", services: ["Campagne Meta (Facebook, Instagram)", "Campagne Google Ads", "Ottimizzazione orientata ai risultati"], stack: ["Meta Ads", "Google Ads", "Analytics"], delivery: "Campagne online in 5 giorni" },
  { id: "ecom", title: "E-commerce", badge: "Scaling", artifact: "cart", tagline: "Dal lancio allo scaling del tuo negozio online.", services: ["Sviluppo e-commerce", "Ottimizzazione conversioni", "Strategie di scaling"], stack: ["Shopify", "Pagamenti", "Logistica"], delivery: "Negozio online in 4 settimane" },
  { id: "coach", title: "Consulenze", badge: "1-to-1", artifact: "waves", tagline: "Programmi di coaching costruiti sulla tua attività.", services: ["Coaching personalizzato", "Percorsi per imprenditori e team", "Affiancamento strategico"], stack: ["Analisi", "Roadmap", "Affiancamento"], delivery: "Percorsi da 4 a 12 settimane" },
];
