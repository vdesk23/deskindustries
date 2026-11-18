import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { extractUtm, pickVariant, variantStorageKey } from "@/lib/landing-splitter";

export const Route = createFileRoute("/servizi/productos/")({
  head: () => ({
    meta: [
      { title: "ProductOS — Il prodotto digitale del tuo negozio" },
      { name: "description", content: "Troviamo il prodotto digitale giusto per il tuo negozio fisico, costruiamo la strategia e lo lanciamo. Prima call gratuita." },
      { property: "og:title", content: "ProductOS — Il prodotto digitale del tuo negozio" },
      { property: "og:description", content: "Troviamo, progettiamo e lanciamo il prodotto digitale del tuo negozio fisico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.deskindustries.com/servizi/productos/a" }],
  }),
  component: Splitter,
});

function Splitter() {
  const navigate = useNavigate();
  useEffect(() => {
    const key = variantStorageKey("productos");
    let stored: string | null = null;
    try { stored = localStorage.getItem(key); } catch { /* private mode */ }
    const v = pickVariant(stored);
    try { localStorage.setItem(key, v); } catch { /* ignore */ }
    const utm = extractUtm(window.location.search);
    try { if (Object.keys(utm).length) sessionStorage.setItem("lp_utm", JSON.stringify(utm)); } catch { /* ignore */ }
    navigate({ to: v === "a" ? "/servizi/productos/a" : "/servizi/productos/b", replace: true });
  }, [navigate]);
  return <div className="min-h-[60vh] grid place-items-center text-muted-foreground text-sm">Caricamento…</div>;
}
