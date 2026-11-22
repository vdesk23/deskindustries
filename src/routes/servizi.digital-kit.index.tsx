import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { extractUtm, pickVariant, variantStorageKey } from "@/lib/landing-splitter";

export const Route = createFileRoute("/servizi/digital-kit/")({
  head: () => ({
    meta: [
      { title: "Digital Kit | Porta online il tuo negozio" },
      { name: "description", content: "Parti da zero? Scheda Google, sito, social e primi passi di vendita, pronti e senza vincoli contrattuali." },
      { property: "og:title", content: "Digital Kit | Porta online il tuo negozio" },
      { property: "og:description", content: "Tutto ciò che serve per mettere online la tua attività, anche se parti da zero." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.deskindustries.com/servizi/digital-kit/a" }],
  }),
  component: Splitter,
});

function Splitter() {
  const navigate = useNavigate();
  useEffect(() => {
    const key = variantStorageKey("digital-kit");
    let stored: string | null = null;
    try { stored = localStorage.getItem(key); } catch { /* private mode */ }
    const v = pickVariant(stored);
    try { localStorage.setItem(key, v); } catch { /* ignore */ }
    const utm = extractUtm(window.location.search);
    try { if (Object.keys(utm).length) sessionStorage.setItem("lp_utm", JSON.stringify(utm)); } catch { /* ignore */ }
    navigate({ to: v === "a" ? "/servizi/digital-kit/a" : "/servizi/digital-kit/b", replace: true });
  }, [navigate]);
  return <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">Caricamento…</div>;
}
