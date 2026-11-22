import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { LandingForm } from "@/components/landing/LandingForm";
import { GoogleBadge } from "@/components/landing/GoogleBadge";
import { ReviewsMarquee } from "@/components/landing/ReviewsMarquee";
import { Aurora } from "@/components/landing/Thread";
import { CLICK_UP_QUESTIONS, GrowthVisual } from "@/components/landing/click-up-content";
import { useLandingUtm } from "@/components/landing/useLandingUtm";

const TITLE = "Click Up | Sblocca la crescita online";
const DESC = "Vendi già online? Troviamo la leva che blocca la crescita e la sblocchiamo insieme. Senza vincoli.";

export const Route = createFileRoute("/servizi/click-up/b")({
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
  component: ClickUpShort,
});

function ClickUpShort() {
  useLandingUtm();
  return (
    <div className="relative overflow-x-clip">
      <Aurora className="fixed opacity-60" />
      <section className="relative py-16 pt-28 lg:py-24 lg:pt-32">
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="mb-4 font-display text-xs uppercase tracking-[0.25em] text-amber">Click Up · Per chi vende già</p>
            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">Le tue vendite online, <span className="lp-thread-text font-normal italic">al livello successivo.</span></h1>
            <p className="mt-6 max-w-xl text-muted-foreground">Traffico, conversione, riacquisto e automazioni: troviamo la leva ferma e cresciamo insieme, con un modello legato ai risultati.</p>
            <div className="mt-6"><GoogleBadge /></div>
            <ul className="mt-8 space-y-3">
              {["Diagnosi delle leve di crescita", "Guadagniamo se guadagni", "Nessun vincolo contrattuale"].map((p) => (
                <li key={p} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-amber" />{p}</li>
              ))}
            </ul>
            <div className="mt-8 hidden lg:block"><GrowthVisual /></div>
          </div>
          <div id="form" className="scroll-mt-8">
            <LandingForm line="click-up" lineLabel="Click Up" variant="b" questions={CLICK_UP_QUESTIONS} submitLabel="Scopri dove puoi crescere" />
            <p className="mt-4 text-center text-xs text-muted-foreground">Call di diagnosi gratuita. Nessuna password richiesta.</p>
          </div>
        </div>
      </section>
      <section className="relative py-16"><ReviewsMarquee /></section>
    </div>
  );
}
