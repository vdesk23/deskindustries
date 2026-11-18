import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { extractUtm, pickVariant, variantStorageKey } from "@/lib/landing-splitter";

export const Route = createFileRoute("/servizi/ecom-breakdown/")({
  head: () => ({
    meta: [
      { title: "ECOM – Breakdown | Analisi gratuita vendite" },
      { name: "description", content: "Analizziamo i tuoi flussi di vendita e ti consegniamo un report con una call di restituzione. Gratuito e senza impegno." },
      { property: "og:title", content: "ECOM – Breakdown | Analisi gratuita vendite" },
      { property: "og:description", content: "Report sui flussi di vendita e call per leggere priorità e opportunità." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.deskindustries.com/servizi/ecom-breakdown/a" }],
  }),
  component: Splitter,
});

function Splitter() {
  const navigate = useNavigate();
  useEffect(() => {
    const key = variantStorageKey("ecom-breakdown");
    let stored: string | null = null;
    try { stored = localStorage.getItem(key); } catch { /* private mode */ }
    const v = pickVariant(stored);
    try { localStorage.setItem(key, v); } catch { /* ignore */ }
    const utm = extractUtm(window.location.search);
    try { if (Object.keys(utm).length) sessionStorage.setItem("lp_utm", JSON.stringify(utm)); } catch { /* ignore */ }
    navigate({ to: v === "a" ? "/servizi/ecom-breakdown/a" : "/servizi/ecom-breakdown/b", replace: true });
  }, [navigate]);
  return <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">Caricamento…</div>;
}
