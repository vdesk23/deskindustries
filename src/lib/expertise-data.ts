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
  { id: "web", title: "Sviluppo Web/Mobile", badge: "Full stack", artifact: "code", tagline: "Store online, app e landing page sincronizzati con il tuo punto vendita.", services: ["App ordini e Click & Collect", "Siti, store e landing page", "SEO locale ed e-commerce, GEO", "Audit tecnici e di performance"], stack: ["React", "Lovable", "Shopify", "Squarespace"], delivery: "Siti web in 7 giorni, consegna delle app da 30 a 90 gironi" },
  { id: "auto", title: "Automazioni", badge: "AI-powered", artifact: "gear", tagline: "Inventario, ordini e logistica sincronizzati, senza errori manuali.", services: ["Sync giacenze tra cassa, magazzino e store online", "Agenti AI per ordini, spedizioni e resi", "Tecnologia Google (Firebase, Vertex AI)", "Modelli Anthropic"], stack: ["Firebase", "Vertex AI", "Anthropic", "n8n"], delivery: "Primo flusso attivo in 2 settimane" },
  { id: "brand", title: "Branding", badge: "Identità", artifact: "prism", tagline: "Un'identità riconoscibile dalla vetrina al pacco consegnato a casa.", services: ["Brand book per store e franchising", "Studio dell'archetipo del brand", "Packaging, shop bag, etichette e flyer", "Strategie di naming e pricing"], stack: ["Brand book", "Naming", "Pricing", "Print"], delivery: "Brand book in 3 settimane" },
  { id: "content", title: "Content Creation", badge: "Video & social", artifact: "lens", tagline: "Foto e video che valorizzano prodotti e negozio e fermano lo scroll.", services: ["Shooting nel tuo punto vendita o con il tuo materiale", "Montaggio con animazioni 2D e 3D", "Video generati e prodotti con AI"], stack: ["Shooting", "Motion 2D/3D", "Video AI"], delivery: "Primo video online in 10 giorni" },
  { id: "ads", title: "Advertising", badge: "Performance", artifact: "target", tagline: "Clienti in negozio e ordini sullo store online, in formula performance.", services: ["Campagne drive-to-store Meta e Google", "Campagne performance per l'e-commerce", "Ottimizzazione orientata ai risultati"], stack: ["Meta Ads", "Google Ads", "Analytics"], delivery: "Campagne online in 5 giorni" },
  { id: "ecom", title: "E-commerce", badge: "Scaling", artifact: "cart", tagline: "Dalla vendita locale allo scaling nazionale del tuo store.", services: ["Sviluppo e-commerce Shopify e custom", "Ottimizzazione conversioni e recupero carrelli", "Strategie di scaling per catene e franchising"], stack: ["Shopify", "Pagamenti", "Logistica"], delivery: "A partire da 14 giorni" },
  { id: "coach", title: "Consulenze", badge: "1-to-1", artifact: "waves", tagline: "Affiancamento per titolari e retail manager che passano al digitale.", services: ["Audit retail-to-digital", "Formazione del personale di negozio", "Roadmap per diversificazione e franchising"], stack: ["Analisi", "Roadmap", "Affiancamento"], delivery: "Percorsi da 4 a 12 settimane" },
];
