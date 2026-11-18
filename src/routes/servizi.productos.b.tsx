import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { LandingForm } from "@/components/landing/LandingForm";
import { useLandingUtm } from "@/components/landing/useLandingUtm";
import { GoogleBadge, PRODUCTOS_QUESTIONS, Testimonials } from "@/components/landing/productos-content";
import hero from "@/assets/productos-hero.jpg";

export const Route = createFileRoute("/servizi/productos/b")({
  head: () => ({
    meta: [
      { title: "ProductOS — Prenota la call gratuita" },
      { name: "description", content: "Scopri quale prodotto digitale può lanciare il tuo negozio. Call gratuita di 30 minuti con Desk Industries." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "ProductOS — Prenota la call gratuita" },
      { property: "og:description", content: "Il prodotto digitale del tuo negozio, trovato e lanciato da Desk Industries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "preload", as: "image", href: hero }],
  }),
  component: ProductOSShort,
});

function ProductOSShort() {
  useLandingUtm();
  return (
    <div>
      <section className="relative py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <p className="text-xs font-display uppercase tracking-[0.25em] text-amber mb-4">ProductOS</p>
            <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight leading-[1.05]">
              Anche il tuo negozio può avere un <span className="italic text-amber font-normal">prodotto digitale</span>.
            </h1>
            <div className="mt-6"><GoogleBadge /></div>
            <ul className="mt-8 space-y-3">
              {["Lo troviamo noi, anche se non sei pratico di digitale", "Strategia e lancio in tre passi", "Nessun vincolo contrattuale"].map((p) => (
                <li key={p} className="flex gap-3"><Check className="size-5 text-amber shrink-0" />{p}</li>
              ))}
            </ul>
            <img src={hero} alt="Titolare di negozio con il suo prodotto digitale su tablet" width={1600} height={1008} fetchPriority="high"
              className="mt-8 rounded-3xl border border-border aspect-[16/9] object-cover object-[60%_25%] w-full" />
          </div>
          <div id="form"><LandingForm line="productos" lineLabel="ProductOS" variant="b" questions={PRODUCTOS_QUESTIONS} /></div>
        </div>
      </section>
      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8"><Testimonials count={3} /></div>
      </section>
    </div>
  );
}
