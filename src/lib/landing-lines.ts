export type LandingLineId = "productos" | "digital-kit" | "click-up" | "agenz-ai" | "o-commerce" | "brainding" | "ecom-breakdown";

export interface LandingLine {
  id: LandingLineId;
  name: string;
  tagline: string;
  tier: string;
  /** Present only when the landing is live. Points to the indexed long-form variant. */
  path?: "/servizi/productos/a";
}

export const LANDING_LINES: LandingLine[] = [
  { id: "productos", name: "ProductOS", tagline: "Il prodotto digitale del tuo negozio, trovato e lanciato da noi.", tier: "Setup + royalties", path: "/servizi/productos/a" },
  { id: "digital-kit", name: "Digital Kit", tagline: "Per chi parte da zero e vuole andare online.", tier: "Entry" },
  { id: "click-up", name: "Click Up", tagline: "Per scalare l'attività che già vende.", tier: "Crescita + royalties" },
  { id: "agenz-ai", name: "Agenz.AI", tagline: "Shooting, promo e video realizzati con l'AI.", tier: "Creatività" },
  { id: "o-commerce", name: "O-Commerce", tagline: "Vendita omnicanale per franchising.", tier: "Enterprise" },
  { id: "brainding", name: "BrainDing", tagline: "Logo, colori, shopper e identità del negozio.", tier: "Branding" },
  { id: "ecom-breakdown", name: "ECOM Breakdown", tagline: "Analisi gratuita dei tuoi flussi di vendita.", tier: "Gratis" },
];
