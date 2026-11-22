export type LandingLineId = "productos" | "digital-kit" | "click-up" | "agenz-ai" | "o-commerce" | "brainding" | "ecom-breakdown";

export interface LandingLine {
  id: LandingLineId;
  name: string;
  tagline: string;
  tier: string;
  /** Present only when the landing is live. Points to the indexed long-form variant. */
  path?: "/servizi/productos/a" | "/servizi/ecom-breakdown/a" | "/servizi/digital-kit/a" | "/servizi/click-up/a" | "/servizi/agenz-ai/a" | "/servizi/o-commerce/a";
}

export const LANDING_LINES: LandingLine[] = [
  { id: "productos", name: "ProductOS", tagline: "Il prodotto digitale del tuo negozio, trovato e lanciato da noi.", tier: "Setup + royalties", path: "/servizi/productos/a" },
  { id: "digital-kit", name: "Digital Kit", tagline: "Per chi parte da zero e vuole andare online.", tier: "Entry", path: "/servizi/digital-kit/a" },
  { id: "click-up", name: "Click Up", tagline: "Per scalare l'attività che già vende.", tier: "Crescita + royalties", path: "/servizi/click-up/a" },
  { id: "agenz-ai", name: "Agenz.AI", tagline: "Shooting, promo e video realizzati con l'AI.", tier: "Creatività", path: "/servizi/agenz-ai/a" },
  { id: "o-commerce", name: "O-Commerce", tagline: "Vendita omnicanale per franchising.", tier: "Enterprise", path: "/servizi/o-commerce/a" },
  { id: "brainding", name: "BrainDing", tagline: "Logo, colori, shopper e identità del negozio.", tier: "Branding" },
  { id: "ecom-breakdown", name: "ECOM – Breakdown", tagline: "Report sui flussi di vendita e call di restituzione, gratuiti.", tier: "Gratis", path: "/servizi/ecom-breakdown/a" },
];
