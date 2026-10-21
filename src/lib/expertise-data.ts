// Browser-safe data shared by the 3D scene and the HTML panel.
export type ExpertiseArea = {
  id: string;
  title: string;
  tagline: string;
  services: string[];
  shape: "box" | "torus" | "octa" | "cone" | "ico" | "knot" | "dodeca";
};

/** Brand scene colors (mirror of --amber / --foreground tokens in styles.css). */
export const SCENE_COLORS = { amber: "#EAA210", light: "#EAF0F6", violet: "#7A5C86" };

export const EXPERTISE_AREAS: ExpertiseArea[] = [
  { id: "web", title: "Sviluppo Web/Mobile", shape: "box", tagline: "Applicazioni, siti e landing page che si trovano e convertono.", services: ["App web e mobile", "Siti web e landing page", "Ottimizzazione SEO/GEO", "Audit tecnici e di performance"] },
  { id: "auto", title: "Automazioni", shape: "torus", tagline: "Software e automazioni cloud-based, agentic-based e on-premises.", services: ["Automazioni di processo", "Agenti AI su misura", "Tecnologia Google (Firebase, Vertex AI)", "Modelli Anthropic"] },
  { id: "brand", title: "Branding", shape: "octa", tagline: "Un'identità chiara, coerente e pronta per il mercato.", services: ["Brand book", "Studio dell'archetipo del brand", "Casi studio: biglietti da visita, flyer, shop bag", "Strategie di naming e pricing"] },
  { id: "content", title: "Content Creation", shape: "cone", tagline: "Contenuti social che fermano lo scroll.", services: ["Shooting girati da noi o con il tuo materiale", "Montaggio con animazioni 2D e 3D", "Video generati e prodotti con AI"] },
  { id: "ads", title: "Advertising", shape: "ico", tagline: "Campagne Meta e Google in formula performance marketing.", services: ["Campagne Meta (Facebook, Instagram)", "Campagne Google Ads", "Ottimizzazione orientata ai risultati"] },
  { id: "ecom", title: "E-commerce", shape: "knot", tagline: "Dal lancio allo scaling del tuo negozio online.", services: ["Sviluppo e-commerce", "Ottimizzazione conversioni", "Strategie di scaling"] },
  { id: "coach", title: "Consulenze", shape: "dodeca", tagline: "Programmi di coaching costruiti sulla tua attività.", services: ["Coaching personalizzato", "Percorsi per imprenditori e team", "Affiancamento strategico"] },
];
