import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, Check, Compass, FileChartColumn, Layers3, MessagesSquare, MousePointerClick, Route as RouteIcon, ScanSearch } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card3D } from "@/components/ui/Card3D";
import { LandingForm } from "@/components/landing/LandingForm";
import { GoogleBadge } from "@/components/landing/GoogleBadge";
import { ReviewsMarquee } from "@/components/landing/ReviewsMarquee";
import { Reveal } from "@/components/landing/Reveal";
import { Aurora, PhilosophyMarquee, ThreadLine, ThreadNode, WordsIn } from "@/components/landing/Thread";
import { ECOM_BREAKDOWN_FAQ, ECOM_BREAKDOWN_QUESTIONS, ECOM_BREAKDOWN_STEPS, SalesFlowVisual } from "@/components/landing/ecom-breakdown-content";
import { useLandingUtm } from "@/components/landing/useLandingUtm";

const TITLE = "ECOM – Breakdown | Analisi gratuita vendite";
const DESC = "Scopri dove si muovono e dove si fermano le tue vendite. Report sui flussi e call di restituzione: gratis, senza impegno.";

export const Route = createFileRoute("/servizi/ecom-breakdown/a")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.deskindustries.com/servizi/ecom-breakdown/a" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Service", name: "ECOM – Breakdown", serviceType: "Analisi dei flussi di vendita per negozi fisici ed e-commerce", provider: { "@id": "https://www.deskindustries.com/#organization" }, areaServed: "IT", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" } },
          { "@type": "FAQPage", mainEntity: ECOM_BREAKDOWN_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        ],
      }),
    }],
  }),
  component: EcomBreakdownLong,
});

function EcomBreakdownLong() {
  useLandingUtm();
  return (
    <div className="relative overflow-x-clip">
      <Aurora className="fixed opacity-70" />
      <section className="relative flex min-h-[92vh] items-center overflow-hidden pb-20 pt-32">
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-6">
            <p className="mb-4 font-display text-xs uppercase tracking-[0.25em] text-amber">ECOM – Breakdown · Analisi gratuita</p>
            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
              <WordsIn text="Scopri dove le tue vendite" />
              <span className="lp-word lp-thread-text font-normal italic" style={{ animationDelay: "420ms" }}>perdono direzione.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Analizziamo come clienti, ordini e canali si collegano. Ricevi un report chiaro e una call per trasformare ciò che vedi in priorità, senza costi e senza impegno.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Card3D intensity={10}><a href="#form"><Button variant="amber" size="lg" className="rounded-full">Richiedi il Breakdown gratuito <ArrowRight className="size-4" /></Button></a></Card3D>
              <a href="#metodo" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">Come funziona <ArrowDown className="size-4" /></a>
            </div>
            <div className="mt-8"><GoogleBadge /></div>
          </div>
          <Reveal delay={180} className="lg:col-span-6"><SalesFlowVisual /></Reveal>
        </div>
      </section>

      <PhilosophyMarquee items={["Zero costi", "Nessun impegno", "Report + call inclusi", "Dati che diventano decisioni", "Un solo flusso, tutta la vendita"]} />

      <div className="relative">
        <ThreadLine />
        <section className="relative py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-12 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <ThreadNode n="01" label="Il blocco" />
                <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">Le vendite si muovono. <span className="font-normal italic text-amber">Tu vedi dove?</span></h2>
              </div>
              <p className="self-end text-muted-foreground lg:col-span-5">Tra negozio, sito, social e marketplace ogni passaggio lascia una traccia. Il problema non è avere dati: è non riuscire a leggerli come un unico percorso.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { Icon: Layers3, t: "Ogni canale parla da solo", d: "Il negozio misura gli scontrini, il sito gli ordini, i social le interazioni. Manca il quadro che mostra come un canale aiuta — o frena — gli altri.", k: "Tanti numeri, nessuna visione" },
                { Icon: MousePointerClick, t: "Il cliente sparisce nel percorso", d: "Visita, richiesta, carrello, acquisto e consegna sembrano eventi separati. Così è difficile capire dove l’interesse si trasforma in vendita e dove si perde.", k: "Il passaggio critico resta invisibile" },
                { Icon: Compass, t: "Le decisioni arrivano a sensazione", d: "Campagne, stock e assistenza richiedono investimenti. Senza leggere il flusso completo, rischi di correggere ciò che è visibile invece di ciò che conta.", k: "Prima capire, poi investire" },
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
              <ThreadNode n="02" label="Cosa ricevi" />
              <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">Non un altro elenco di numeri. <span className="font-normal italic text-amber">Una mappa per decidere.</span></h2>
              <p className="mt-6 text-muted-foreground">Il Breakdown scompone il tuo modo di vendere e lo rimette in ordine. Alla fine non resti solo con un documento: sai come leggerlo.</p>
              <a href="#form" className="mt-8 inline-block"><Button variant="amber" className="rounded-full">Richiedi la tua analisi <ArrowRight className="size-4" /></Button></a>
            </Reveal>
            <div className="grid gap-4">
              {[
                { Icon: RouteIcon, t: "Mappa dei flussi", d: "Canali e passaggi collegati, dal primo contatto alla relazione dopo l’acquisto." },
                { Icon: FileChartColumn, t: "Report con priorità", d: "Punti da osservare e opportunità emerse, presentati con un linguaggio comprensibile." },
                { Icon: MessagesSquare, t: "Call di restituzione", d: "Un confronto per chiarire il report e ragionare sulle decisioni possibili." },
              ].map(({ Icon, t, d }, i) => (
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
                <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl"><span className="lp-thread-text font-normal italic">Breakdown.</span> Tre passaggi, una direzione.</h2>
              </div>
              <p className="self-end text-muted-foreground lg:col-span-5">Partiamo da ciò che accade davvero nella tua attività. Niente modelli preconfezionati e nessuna credenziale richiesta nel modulo.</p>
            </div>
            <Reveal className="mb-6 hidden lg:block"><div className="lp-draw h-px w-full" /></Reveal>
            <div className="grid gap-6 lg:grid-cols-3">
              {ECOM_BREAKDOWN_STEPS.map((s, i) => {
                const Icon = [ScanSearch, Layers3, MessagesSquare][i];
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
                <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">La chiarezza è il primo <span className="font-normal italic text-amber">risultato.</span></h2>
              </div>
              <p className="self-end text-muted-foreground lg:col-span-5">Le recensioni raccontano l’esperienza con Desk Industries: ascolto, competenza e un modo di lavorare costruito intorno alle attività.</p>
            </div>
          </div>
          <ReviewsMarquee />
        </section>

        <section id="form" className="relative scroll-mt-10 py-24 lg:py-32">
          <div className="mx-auto grid max-w-7xl items-start gap-12 px-5 lg:grid-cols-2 lg:px-8">
            <div>
              <ThreadNode n="05" label="Richiesta gratuita" />
              <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">Metti a fuoco le tue vendite. <span className="font-normal italic text-amber">Partiamo da qui.</span></h2>
              <p className="mt-6 text-muted-foreground">Raccontaci come vendi oggi. Riceverai il report sui flussi e una call per leggere insieme priorità e opportunità.</p>
              <ul className="mt-8 space-y-3">
                {["Report e call gratuiti", "Nessun metodo di pagamento", "Nessun obbligo di acquisto"].map((p) => <li key={p} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-amber" />{p}</li>)}
              </ul>
            </div>
            <LandingForm line="ecom-breakdown" lineLabel="ECOM – Breakdown" variant="a" questions={ECOM_BREAKDOWN_QUESTIONS} submitLabel="Richiedi il Breakdown gratuito" />
          </div>
        </section>

        <section className="relative py-24 lg:py-32">
          <div className="mx-auto max-w-3xl px-5 lg:px-8">
            <ThreadNode n="06" label="Domande frequenti" />
            <h2 className="mb-8 font-display text-3xl font-medium tracking-tight sm:text-4xl">Prima di iniziare, <span className="font-normal italic text-amber">facciamo chiarezza.</span></h2>
            <Accordion type="single" collapsible className="rounded-3xl border border-border bg-surface-elevated/50 px-6 backdrop-blur-xl">
              {ECOM_BREAKDOWN_FAQ.map((f, i) => (
                <AccordionItem key={f.q} value={`f${i}`}>
                  <AccordionTrigger className="text-left font-display">{f.q}</AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-10 text-center"><Card3D intensity={10} className="inline-block"><a href="#form"><Button variant="amber" size="lg" className="rounded-full">Richiedi il Breakdown gratuito <ArrowRight className="size-4" /></Button></a></Card3D></div>
          </div>
        </section>
      </div>
    </div>
  );
}
