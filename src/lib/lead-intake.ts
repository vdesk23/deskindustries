import { z } from "zod";

export const STORE_CATEGORIES = [
  "Moda, calzature e accessori",
  "Food, enoteche e gastronomie",
  "Bellezza, cosmesi e parafarmacie",
  "Gioiellerie, ottica e artigianato",
  "Casa, arredo e oggettistica",
  "Sport, outdoor e tempo libero",
  "Catena retail o franchising",
  "Altro negozio fisico",
] as const;

export const STORE_SITUATIONS = [
  "Ho solo il negozio fisico e voglio aprire il canale online",
  "Ho un e-commerce e voglio sincronizzarlo con cassa e magazzino",
  "Ho un e-commerce attivo e voglio scalare vendite e branding",
  "Gestisco più punti vendita o una rete in franchising",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40),
  business: z.string().trim().max(120).default(""),
  sector: z.string().trim().min(1).max(60).default("Da definire"),
});

export const registrationSchema = contactSchema.extend({
  action: z.literal("register"),
  continuation: z.string().max(1000).optional(),
});

export const quoteRequestSchema = z.object({
  action: z.literal("quote"),
  continuation: z.string().min(1).max(1000),
  sector: z.enum(STORE_CATEGORIES),
  situation: z.enum(STORE_SITUATIONS),
  serviceCodes: z.array(z.string().trim().min(1).max(60)).min(1).max(30),
  lookingFor: z.string().trim().max(500).default(""),
  company: z.object({
    business: z.string().trim().min(2).max(120),
    vatNumber: z.string().trim().regex(/^(IT)?[0-9]{11}$/i, "Partita IVA non valida"),
    address: z.string().trim().min(3).max(160),
    city: z.string().trim().min(2).max(80),
  }),
});

/** Summary sent to CONSUS so the salesperson sees the full store context. */
export function quoteBrief(q: { situation: string; lookingFor: string; company: { business: string; vatNumber: string; address: string; city: string } }) {
  return [
    `Situazione: ${q.situation}`,
    `Società: ${q.company.business} — P.IVA ${q.company.vatNumber} — ${q.company.address}, ${q.company.city}`,
    q.lookingFor ? `Obiettivo: ${q.lookingFor}` : "",
  ].filter(Boolean).join("\n");
}

export type ServiceOption = { code: string; name: string; category: string };

export function serviceCategory(service: ServiceOption): string {
  if (service.category.trim() && service.category !== "Servizi") return service.category;
  const text = `${service.code} ${service.name}`.toLowerCase();
  if (/ecommerce|e-commerce|shopify|negozio online/.test(text)) return "E-commerce";
  if (/advertising|ads|campagn|pubblicit/.test(text)) return "Advertising";
  if (/automat|automaz|agent|firebase|vertex|workflow|soluzioni ai|cloud/.test(text)) return "Automazioni";
  if (/brand|naming|archetip|logo/.test(text)) return "Branding";
  if (/video|shoot|content|contenut|editorial|animaz|social|copy|blog|multipost/.test(text)) return "Content Creation";
  if (/consulen|coach|strateg/.test(text)) return "Consulenze";
  if (/web|app|landing|seo|geo|audit|sito|siti/.test(text)) return "Sviluppo Web / Mobile";
  return "Altri servizi";
}

export function groupServices(services: ServiceOption[]) {
  const groups = new Map<string, ServiceOption[]>();
  for (const service of services) {
    const category = serviceCategory(service);
    groups.set(category, [...(groups.get(category) ?? []), service]);
  }
  return [...groups.entries()];
}

export function resolveServices(codes: string[], catalog: ServiceOption[]) {
  return [...new Set(codes)].map((code) => {
    const service = catalog.find((item) => item.code === code);
    if (!service) throw new Error("Il catalogo è cambiato: seleziona nuovamente i servizi.");
    return service;
  });
}