import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { LandingForm } from "@/components/landing/LandingForm";
import { GoogleBadge } from "@/components/landing/GoogleBadge";
import { ReviewsMarquee } from "@/components/landing/ReviewsMarquee";
import { Aurora } from "@/components/landing/Thread";
import { BRAINDING_QUESTIONS, BrandVisual } from "@/components/landing/brainding-content";
import { useLandingUtm } from "@/components/landing/useLandingUtm";

const TITLE = "BrainDing | L’identità del tuo negozio";
const DESC = "Logo, colori, shopper ed etichette coordinati per far riconoscere il tuo negozio. Senza vincoli.";

export const Route = createFileRoute("/servizi/brainding/b")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrainDingShort,
});

function BrainDingShort() {
  useLandingUtm();
  return (
    <div className="relative overflow-x-clip">
      <Aurora className="fixed opacity-60" />
      <section className="relative py-16 pt-28 lg:py-24 lg:pt-32">
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="mb-4 font-display text-xs uppercase tracking-[0.25em] text-amber">BrainDing · Identità di marca</p>
            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">Il tuo negozio, <span className="lp-thread-text font-normal italic">riconoscibile ovunque.</span></h1>
            <p className="mt-6 max-w-xl text-muted-foreground">Disegniamo logo, colori, shopper, packaging ed etichette con un unico linguaggio visivo.</p>
            <div className="mt-6"><GoogleBadge /></div>
            <ul className="mt-8 space-y-3">
              {["Logo, colori e caratteri", "Shopper, packaging ed etichette", "Nessun vincolo contrattuale"].map((p) => (
                <li key={p} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-amber" />{p}</li>
              ))}
            </ul>
            <div className="mt-8 hidden lg:block"><BrandVisual /></div>
          </div>
          <div id="form" className="scroll-mt-8">
            <LandingForm line="brainding" lineLabel="BrainDing" variant="b" questions={BRAINDING_QUESTIONS} submitLabel="Disegniamo il tuo brand" />
            <p className="mt-4 text-center text-xs text-muted-foreground">Call conoscitiva gratuita, senza impegno.</p>
          </div>
        </div>
      </section>
      <section className="relative py-16"><ReviewsMarquee /></section>
    </div>
  );
}
