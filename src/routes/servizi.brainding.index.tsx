import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { extractUtm, pickVariant, variantStorageKey } from "@/lib/landing-splitter";

export const Route = createFileRoute("/servizi/brainding/")({
  head: () => ({
    meta: [
      { title: "BrainDing | Branding per negozi e attività" },
      { name: "description", content: "Logo, colori, shopper, packaging ed etichette: l’identità del tuo negozio, coordinata e riconoscibile. Senza vincoli." },
      { property: "og:title", content: "BrainDing | Branding per negozi e attività" },
      { property: "og:description", content: "Un’identità visiva che fa riconoscere il tuo negozio ovunque." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.deskindustries.com/servizi/brainding/a" }],
  }),
  component: Splitter,
});

function Splitter() {
  const navigate = useNavigate();
  useEffect(() => {
    const key = variantStorageKey("brainding");
    let stored: string | null = null;
    try { stored = localStorage.getItem(key); } catch { /* private mode */ }
    const v = pickVariant(stored);
    try { localStorage.setItem(key, v); } catch { /* ignore */ }
    const utm = extractUtm(window.location.search);
    try { if (Object.keys(utm).length) sessionStorage.setItem("lp_utm", JSON.stringify(utm)); } catch { /* ignore */ }
    navigate({ to: v === "a" ? "/servizi/brainding/a" : "/servizi/brainding/b", replace: true });
  }, [navigate]);
  return <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">Caricamento…</div>;
}
