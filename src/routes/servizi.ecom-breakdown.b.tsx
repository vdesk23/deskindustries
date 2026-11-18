import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { LandingForm } from "@/components/landing/LandingForm";
import { GoogleBadge } from "@/components/landing/GoogleBadge";
import { ReviewsMarquee } from "@/components/landing/ReviewsMarquee";
import { Aurora } from "@/components/landing/Thread";
import { ECOM_BREAKDOWN_QUESTIONS, SalesFlowVisual } from "@/components/landing/ecom-breakdown-content";
import { useLandingUtm } from "@/components/landing/useLandingUtm";

const TITLE = "ECOM – Breakdown | Parti da dove sei";
const DESC = "Che tu sia ancora offline o venda già online, ricevi un report e una call per capire opportunità e priorità. Gratis.";

export const Route = createFileRoute("/servizi/ecom-breakdown/b")({
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
  component: EcomBreakdownShort,
});

function EcomBreakdownShort() {
  useLandingUtm();
  return (
    <div className="relative overflow-x-clip">
      <Aurora className="fixed opacity-60" />
      <section className="relative py-16 pt-28 lg:py-24 lg:pt-32">
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="mb-4 font-display text-xs uppercase tracking-[0.25em] text-amber">ECOM – Breakdown · Gratuito</p>
            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">Scopri cosa può ottenere <span className="lp-thread-text font-normal italic">la tua attività online.</span></h1>
            <p className="mt-6 max-w-xl text-muted-foreground">Non sei ancora online o vuoi vendere di più? Partiamo dalla tua situazione e ti consegniamo un report chiaro, da leggere insieme in call.</p>
            <div className="mt-6"><GoogleBadge /></div>
            <ul className="mt-8 space-y-3">
              {["Analisi adatta anche a chi parte da zero", "Opportunità e priorità nel report", "Call di restituzione inclusa, senza impegno"].map((p) => (
                <li key={p} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-amber" />{p}</li>
              ))}
            </ul>
            <div className="mt-8 hidden lg:block"><SalesFlowVisual compact /></div>
          </div>
          <div id="form" className="scroll-mt-8">
            <LandingForm line="ecom-breakdown" lineLabel="ECOM – Breakdown" variant="b" questions={ECOM_BREAKDOWN_QUESTIONS} submitLabel="Richiedi il Breakdown gratuito" />
            <p className="mt-4 text-center text-xs text-muted-foreground">Nessun pagamento. Nessuna password o dato dei clienti richiesto.</p>
          </div>
        </div>
      </section>
      <section className="relative py-16"><ReviewsMarquee /></section>
    </div>
  );
}
