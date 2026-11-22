import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, Check, Layers3, MousePointerClick, Rocket, ScanSearch, Search, Wallet } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card3D } from "@/components/ui/Card3D";
import { LandingForm } from "@/components/landing/LandingForm";
import { GoogleBadge } from "@/components/landing/GoogleBadge";
import { ReviewsMarquee } from "@/components/landing/ReviewsMarquee";
import { Reveal } from "@/components/landing/Reveal";
import { Aurora, PhilosophyMarquee, ThreadLine, ThreadNode, WordsIn } from "@/components/landing/Thread";
import { O_COMMERCE_FAQ, O_COMMERCE_PILLARS, O_COMMERCE_QUESTIONS, O_COMMERCE_STEPS, OmniVisual } from "@/components/landing/o-commerce-content";
import { useLandingUtm } from "@/components/landing/useLandingUtm";

const TITLE = "O-Commerce | Omnicanalità per franchising";
const DESC = "Catene e franchising: cassa, magazzino, sito e marketplace uniti in un unico sistema. Scorte, ordini e affiliati coordinati, senza vincoli.";

export const Route = createFileRoute("/servizi/o-commerce/a")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.deskindustries.com/servizi/o-commerce/a" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Service", name: "O-Commerce", serviceType: "Vendita omnicanale per catene retail e franchising", provider: { "@id": "https://www.deskindustries.com/#organization" }, areaServed: "IT" },
          { "@type": "FAQPage", mainEntity: O_COMMERCE_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        ],
      }),
    }],
  }),
  component: OCommerceLong,
});

function OCommerceLong() {
  useLandingUtm();
  return (
    <div className="relative overflow-x-clip">
      <Aurora className="fixed opacity-70" />
      <section className="relative flex min-h-[92vh] items-center overflow-hidden pb-20 pt-32">
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-6">
            <p className="mb-4 font-display text-xs uppercase tracking-[0.25em] text-amber">O-Commerce · Per catene e franchising</p>
            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
              <WordsIn text="Tutti i tuoi negozi," />
              <span className="lp-word lp-thread-text font-normal italic" style={{ animationDelay: "420ms" }}>un’unica regia.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Pensi che unire negozi e online sia un progetto da multinazionale? Colleghiamo cassa, magazzino, sito e marketplace in un unico sistema, così sede e punti vendita lavorano come una sola rete.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Card3D intensity={10}><a href="#form"><Button variant="amber" size="lg" className="rounded-full">Parla con un consulente <ArrowRight className="size-4" /></Button></a></Card3D>
              <a href="#metodo" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">Come funziona <ArrowDown className="size-4" /></a>
            </div>
            <div className="mt-8"><GoogleBadge /></div>
          </div>
          <Reveal delay={180} className="lg:col-span-6"><OmniVisual /></Reveal>
        </div>
      </section>

      <PhilosophyMarquee items={["Zero vincoli", "Paghi a consumo", "Una sola regia", "Negozi e online uniti", "Su misura, day by day"]} />

      <div className="relative">
        <ThreadLine />
        <section className="relative py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-12 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <ThreadNode n="01" label="Il blocco" />
                <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">“Ogni negozio <span className="font-normal italic text-amber">va per conto suo.</span>”</h2>
              </div>
              <p className="self-end text-muted-foreground lg:col-span-5">Succede quando la rete cresce più in fretta degli strumenti. Non è un problema di persone: è che negozi, sito e magazzino non sono mai stati pensati per parlarsi.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { Icon: Search, t: "Le scorte non tornano mai", d: "Un prodotto risulta disponibile online ma è finito in negozio, o fermo in un punto vendita dove non si vende. Ogni errore è una vendita persa.", k: "Il magazzino è un’ipotesi" },
                { Icon: MousePointerClick, t: "Online e negozio sono rivali", d: "Il cliente compra sul sito ma non può ritirare in negozio, o viceversa. I canali si fanno concorrenza invece di aiutarsi.", k: "Il cliente vede un solo marchio" },
                { Icon: Wallet, t: "La sede non vede la rete", d: "Report a mano, file inviati via email, affiliati con promozioni diverse. Decidere senza dati aggiornati diventa la normalità.", k: "Senza visione unica, si guida al buio" },
              ].map(({ Icon, t, d, k }, i) => (
                <Reveal key={t} delay={i * 80}>
                  <Card3D intensity={5} className="lp-glow-card h-full rounded-3xl border border-border bg-surface-elevated/50 p-8 backdrop-blur-xl">
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-amber/25 bg-amber-soft"><Icon className="size-6 text-amber" /></div>
                    <h3 className="mt-6 font-display text-xl font-medium tracking-tight">{t}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d}</p>
                    <p className="mt-6 border-t border-border pt-4 font-display text-xs uppercase tracking-[0.18em] text-amber/80">{k}</p>
                  </Card3D>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-24 lg:py-32">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
            <Reveal>
              <ThreadNode n="02" label="Cosa uniamo" />
              <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">Una rete che lavora <span className="font-normal italic text-amber">come un solo negozio.</span></h2>
              <p className="mt-6 text-muted-foreground">Partiamo dagli strumenti che usi già e li colleghiamo dove serve. L’obiettivo è uno: dare alla sede una visione unica e ai clienti un’esperienza coerente ovunque comprino.</p>
              <a href="#form" className="mt-8 inline-block"><Button variant="amber" className="rounded-full">Unisci la mia rete <ArrowRight className="size-4" /></Button></a>
            </Reveal>
            <div className="grid gap-4">
              {O_COMMERCE_PILLARS.map(({ Icon, t, d }, i) => (
                <Reveal key={t} delay={i * 80}>
                  <div className="lp-glow-card flex gap-5 rounded-3xl border border-border bg-surface-elevated/50 p-6 backdrop-blur-xl">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-soft"><Icon className="size-5 text-amber" /></span>
                    <div><h3 className="font-display text-lg font-medium">{t}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p></div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="metodo" className="relative scroll-mt-10 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-12 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <ThreadNode n="03" label="Il metodo" />
                <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl"><span className="lp-thread-text font-normal italic">Omni Loop.</span> Mappatura, integrazione, regia.</h2>
              </div>
              <p className="self-end text-muted-foreground lg:col-span-5">Niente rivoluzioni in un giorno: attiviamo la rete per gradi, senza fermare i negozi.</p>
            </div>
            <Reveal className="mb-6 hidden lg:block"><div className="lp-draw h-px w-full" /></Reveal>
            <div className="grid gap-6 lg:grid-cols-3">
              {O_COMMERCE_STEPS.map((s, i) => {
                const Icon = [ScanSearch, Layers3, Rocket][i];
                return (
                  <Reveal key={s.t} delay={i * 100}>
                    <Card3D intensity={6} className="lp-glow-card h-full rounded-3xl border border-border bg-surface-elevated/50 p-8 backdrop-blur-xl">
                      <div className="flex items-center justify-between"><Icon className="size-6 text-amber" /><span className="lp-thread-text font-display text-4xl">{s.n}</span></div>
                      <h3 className="mt-6 font-display text-2xl font-medium tracking-tight">{s.t}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                    </Card3D>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-12 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <ThreadNode n="04" label="La fiducia" />
                <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">Chi lavora <span className="font-normal italic text-amber">con noi.</span></h2>
              </div>
              <p className="self-end text-muted-foreground lg:col-span-5">Le recensioni raccontano l’esperienza con Desk Industries: ascolto, competenza e un modo di lavorare costruito intorno alle attività.</p>
            </div>
          </div>
          <ReviewsMarquee />
        </section>

        <section id="form" className="relative scroll-mt-10 py-24 lg:py-32">
          <div className="mx-auto grid max-w-7xl items-start gap-12 px-5 lg:grid-cols-2 lg:px-8">
            <div>
              <ThreadNode n="05" label="Iniziamo" />
              <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">Raccontaci la tua rete. <span className="font-normal italic text-amber">La uniamo noi.</span></h2>
              <p className="mt-6 text-muted-foreground">Tre domande su punti vendita, modello di rete e priorità. Ti richiamiamo per una prima mappatura e poi ti inviamo il preventivo.</p>
              <ul className="mt-8 space-y-3">
                {["Call di mappatura gratuita", "Partiamo dai tuoi strumenti", "Nessun vincolo contrattuale"].map((p) => <li key={p} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-amber" />{p}</li>)}
              </ul>
            </div>
            <LandingForm line="o-commerce" lineLabel="O-Commerce" variant="a" questions={O_COMMERCE_QUESTIONS} submitLabel="Parla con un consulente" />
          </div>
        </section>

        <section className="relative py-24 lg:py-32">
          <div className="mx-auto max-w-3xl px-5 lg:px-8">
            <ThreadNode n="06" label="Domande frequenti" />
            <h2 className="mb-8 font-display text-3xl font-medium tracking-tight sm:text-4xl">Prima di iniziare, <span className="font-normal italic text-amber">facciamo chiarezza.</span></h2>
            <Accordion type="single" collapsible className="rounded-3xl border border-border bg-surface-elevated/50 px-6 backdrop-blur-xl">
              {O_COMMERCE_FAQ.map((f, i) => (
                <AccordionItem key={f.q} value={`f${i}`}>
                  <AccordionTrigger className="text-left font-display">{f.q}</AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-10 text-center"><Card3D intensity={10} className="inline-block"><a href="#form"><Button variant="amber" size="lg" className="rounded-full">Parla con un consulente <ArrowRight className="size-4" /></Button></a></Card3D></div>
          </div>
        </section>
      </div>
    </div>
  );
}
