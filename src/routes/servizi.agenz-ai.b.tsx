import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { LandingForm } from "@/components/landing/LandingForm";
import { GoogleBadge } from "@/components/landing/GoogleBadge";
import { ReviewsMarquee } from "@/components/landing/ReviewsMarquee";
import { Aurora } from "@/components/landing/Thread";
import { AGENZ_AI_QUESTIONS, StudioVisual } from "@/components/landing/agenz-ai-content";
import { useLandingUtm } from "@/components/landing/useLandingUtm";

const TITLE = "Agenz.AI | Contenuti AI per il tuo negozio";
const DESC = "Foto, video e creatività iper-realistici con l’AI, partendo dai tuoi prodotti. Zero set, zero vincoli.";

export const Route = createFileRoute("/servizi/agenz-ai/b")({
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
  component: AgenzAiShort,
});

function AgenzAiShort() {
  useLandingUtm();
  return (
    <div className="relative overflow-x-clip">
      <Aurora className="fixed opacity-60" />
      <section className="relative py-16 pt-28 lg:py-24 lg:pt-32">
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="mb-4 font-display text-xs uppercase tracking-[0.25em] text-amber">Agenz.AI · Creatività con l’AI</p>
            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">Shooting e video, <span className="lp-thread-text font-normal italic">senza un giorno di set.</span></h1>
            <p className="mt-6 max-w-xl text-muted-foreground">Ci mandi le foto dei prodotti, noi creiamo con l’AI contenuti professionali per social, sito e pubblicità.</p>
            <div className="mt-6"><GoogleBadge /></div>
            <ul className="mt-8 space-y-3">
              {["Foto, video e creatività ads", "Fedeli al prodotto reale", "Nessun vincolo contrattuale"].map((p) => (
                <li key={p} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-amber" />{p}</li>
              ))}
            </ul>
            <div className="mt-8 hidden lg:block"><StudioVisual /></div>
          </div>
          <div id="form" className="scroll-mt-8">
            <LandingForm line="agenz-ai" lineLabel="Agenz.AI" variant="b" questions={AGENZ_AI_QUESTIONS} submitLabel="Richiedi i tuoi contenuti AI" />
            <p className="mt-4 text-center text-xs text-muted-foreground">Call conoscitiva gratuita. Nessuna password richiesta.</p>
          </div>
        </div>
      </section>
      <section className="relative py-16"><ReviewsMarquee /></section>
    </div>
  );
}
