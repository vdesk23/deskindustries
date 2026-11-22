import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { extractUtm, pickVariant, variantStorageKey } from "@/lib/landing-splitter";

export const Route = createFileRoute("/servizi/o-commerce/")({
  head: () => ({
    meta: [
      { title: "O-Commerce | Omnicanalità per franchising" },
      { name: "description", content: "Negozi, sito e marketplace in un unico sistema: scorte, ordini e affiliati coordinati. Senza vincoli contrattuali." },
      { property: "og:title", content: "O-Commerce | Omnicanalità per franchising" },
      { property: "og:description", content: "Gestisci catena e franchising come un’unica rete, online e offline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.deskindustries.com/servizi/o-commerce/a" }],
  }),
  component: Splitter,
});

function Splitter() {
  const navigate = useNavigate();
  useEffect(() => {
    const key = variantStorageKey("o-commerce");
    let stored: string | null = null;
    try { stored = localStorage.getItem(key); } catch { /* private mode */ }
    const v = pickVariant(stored);
    try { localStorage.setItem(key, v); } catch { /* ignore */ }
    const utm = extractUtm(window.location.search);
    try { if (Object.keys(utm).length) sessionStorage.setItem("lp_utm", JSON.stringify(utm)); } catch { /* ignore */ }
    navigate({ to: v === "a" ? "/servizi/o-commerce/a" : "/servizi/o-commerce/b", replace: true });
  }, [navigate]);
  return <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">Caricamento…</div>;
}
