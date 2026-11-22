import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { LandingForm } from "@/components/landing/LandingForm";
import { GoogleBadge } from "@/components/landing/GoogleBadge";
import { ReviewsMarquee } from "@/components/landing/ReviewsMarquee";
import { Aurora } from "@/components/landing/Thread";
import { O_COMMERCE_QUESTIONS, OmniVisual } from "@/components/landing/o-commerce-content";
import { useLandingUtm } from "@/components/landing/useLandingUtm";

const TITLE = "O-Commerce | Negozi e online, una sola rete";
const DESC = "Cassa, magazzino, sito e affiliati in un unico sistema per catene e franchising. Senza vincoli.";

export const Route = createFileRoute("/servizi/o-commerce/b")({
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
  component: OCommerceShort,
});

function OCommerceShort() {
  useLandingUtm();
  return (
    <div className="relative overflow-x-clip">
      <Aurora className="fixed opacity-60" />
      <section className="relative py-16 pt-28 lg:py-24 lg:pt-32">
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="mb-4 font-display text-xs uppercase tracking-[0.25em] text-amber">O-Commerce · Per catene e franchising</p>
            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">Tutti i tuoi negozi, <span className="lp-thread-text font-normal italic">un’unica regia.</span></h1>
            <p className="mt-6 max-w-xl text-muted-foreground">Colleghiamo punti vendita, sito e marketplace: scorte, ordini e promozioni coordinati da un solo posto.</p>
            <div className="mt-6"><GoogleBadge /></div>
            <ul className="mt-8 space-y-3">
              {["Scorte e ordini in tempo reale", "Sede e affiliati coordinati", "Nessun vincolo contrattuale"].map((p) => (
                <li key={p} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-amber" />{p}</li>
              ))}
            </ul>
            <div className="mt-8 hidden lg:block"><OmniVisual /></div>
          </div>
          <div id="form" className="scroll-mt-8">
            <LandingForm line="o-commerce" lineLabel="O-Commerce" variant="b" questions={O_COMMERCE_QUESTIONS} submitLabel="Parla con un consulente" />
            <p className="mt-4 text-center text-xs text-muted-foreground">Call di mappatura gratuita. Nessuna password richiesta.</p>
          </div>
        </div>
      </section>
      <section className="relative py-16"><ReviewsMarquee /></section>
    </div>
  );
}
