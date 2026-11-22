import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { LandingForm } from "@/components/landing/LandingForm";
import { GoogleBadge } from "@/components/landing/GoogleBadge";
import { ReviewsMarquee } from "@/components/landing/ReviewsMarquee";
import { Aurora } from "@/components/landing/Thread";
import { DIGITAL_KIT_QUESTIONS, KitVisual } from "@/components/landing/digital-kit-content";
import { useLandingUtm } from "@/components/landing/useLandingUtm";

const TITLE = "Digital Kit | Online anche se parti da zero";
const DESC = "Scheda Google, sito, social e primi passi di vendita per la tua attività. Ci pensiamo noi, senza vincoli contrattuali.";

export const Route = createFileRoute("/servizi/digital-kit/b")({
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
  component: DigitalKitShort,
});

function DigitalKitShort() {
  useLandingUtm();
  return (
    <div className="relative overflow-x-clip">
      <Aurora className="fixed opacity-60" />
      <section className="relative py-16 pt-28 lg:py-24 lg:pt-32">
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="mb-4 font-display text-xs uppercase tracking-[0.25em] text-amber">Digital Kit · Per chi parte da zero</p>
            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">La tua attività, <span className="lp-thread-text font-normal italic">finalmente online.</span></h1>
            <p className="mt-6 max-w-xl text-muted-foreground">Non serve essere esperti di digitale. Ti mettiamo online con l’essenziale, fatto bene, e ti insegniamo a gestirlo.</p>
            <div className="mt-6"><GoogleBadge /></div>
            <ul className="mt-8 space-y-3">
              {["Scheda Google, sito e social con un’unica identità", "Ci pensiamo noi alla parte tecnica", "Nessun vincolo contrattuale"].map((p) => (
                <li key={p} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-amber" />{p}</li>
              ))}
            </ul>
            <div className="mt-8 hidden lg:block"><KitVisual /></div>
          </div>
          <div id="form" className="scroll-mt-8">
            <LandingForm line="digital-kit" lineLabel="Digital Kit" variant="b" questions={DIGITAL_KIT_QUESTIONS} submitLabel="Prepara il mio Digital Kit" />
            <p className="mt-4 text-center text-xs text-muted-foreground">Call conoscitiva gratuita. Nessuna password richiesta.</p>
          </div>
        </div>
      </section>
      <section className="relative py-16"><ReviewsMarquee /></section>
    </div>
  );
}
