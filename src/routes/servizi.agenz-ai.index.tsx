import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { extractUtm, pickVariant, variantStorageKey } from "@/lib/landing-splitter";

export const Route = createFileRoute("/servizi/agenz-ai/")({
  head: () => ({
    meta: [
      { title: "Agenz.AI | Foto e video prodotto con l’AI" },
      { name: "description", content: "Shooting, promo, video e creatività iper-realistici realizzati con l’AI. Nessuna giornata di riprese, nessun vincolo." },
      { property: "og:title", content: "Agenz.AI | Foto e video prodotto con l’AI" },
      { property: "og:description", content: "Contenuti professionali per il tuo negozio, senza set e senza fermare l’attività." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.deskindustries.com/servizi/agenz-ai/a" }],
  }),
  component: Splitter,
});

function Splitter() {
  const navigate = useNavigate();
  useEffect(() => {
    const key = variantStorageKey("agenz-ai");
    let stored: string | null = null;
    try { stored = localStorage.getItem(key); } catch { /* private mode */ }
    const v = pickVariant(stored);
    try { localStorage.setItem(key, v); } catch { /* ignore */ }
    const utm = extractUtm(window.location.search);
    try { if (Object.keys(utm).length) sessionStorage.setItem("lp_utm", JSON.stringify(utm)); } catch { /* ignore */ }
    navigate({ to: v === "a" ? "/servizi/agenz-ai/a" : "/servizi/agenz-ai/b", replace: true });
  }, [navigate]);
  return <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">Caricamento…</div>;
}
