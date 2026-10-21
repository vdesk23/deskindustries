import { createServerFn } from "@tanstack/react-start";

export type CatalogService = { code: string; name: string; category: string };

/** Public: service names from the Sibill catalog (via CONSUS). Never includes prices. */
export const listServiceCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ services: CatalogService[]; live: boolean }> => {
    try {
      const { fetchConsusCatalog } = await import("./consus.server");
      const services = await fetchConsusCatalog();
      return { services, live: services.length > 0 };
    } catch (e) {
      console.error("[catalog] fallback", e instanceof Error ? e.message : e);
      return { services: [], live: false };
    }
  },
);
