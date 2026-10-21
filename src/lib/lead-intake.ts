import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40),
  business: z.string().trim().max(120),
  sector: z.string().trim().min(1).max(60),
});

export const registrationSchema = contactSchema.extend({
  action: z.literal("register"),
  continuation: z.string().max(1000).optional(),
});

export const quoteRequestSchema = z.object({
  action: z.literal("quote"),
  continuation: z.string().min(1).max(1000),
  serviceCodes: z.array(z.string().trim().min(1).max(60)).min(1).max(30),
  lookingFor: z.string().trim().min(5).max(500),
});

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