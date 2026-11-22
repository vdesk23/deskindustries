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
import { AGENZ_AI_FAQ, AGENZ_AI_OUTPUTS, AGENZ_AI_QUESTIONS, AGENZ_AI_STEPS, StudioVisual } from "@/components/landing/agenz-ai-content";
import { useLandingUtm } from "@/components/landing/useLandingUtm";

const TITLE = "Agenz.AI | Foto e video prodotto con l’AI";
const DESC = "Shooting, video promo e creatività iper-realistici creati con l’AI dalle foto dei tuoi prodotti. Niente set, niente giornate perse, zero vincoli.";

export const Route = createFileRoute("/servizi/agenz-ai/a")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.deskindustries.com/servizi/agenz-ai/a" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Service", name: "Agenz.AI", serviceType: "Produzione di foto, video e creatività con intelligenza artificiale per negozi", provider: { "@id": "https://www.deskindustries.com/#organization" }, areaServed: "IT" },
          { "@type": "FAQPage", mainEntity: AGENZ_AI_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        ],
      }),
    }],
  }),
  component: AgenzAiLong,
});

function AgenzAiLong() {
  useLandingUtm();
  return (
    <div className="relative overflow-x-clip">
      <Aurora className="fixed opacity-70" />
      <section className="relative flex min-h-[92vh] items-center overflow-hidden pb-20 pt-32">
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-6">
            <p className="mb-4 font-display text-xs uppercase tracking-[0.25em] text-amber">Agenz.AI · Creatività con l’AI</p>
            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
              <WordsIn text="Contenuti da grande brand," />
              <span className="lp-word lp-thread-text font-normal italic" style={{ animationDelay: "420ms" }}>senza un giorno di set.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Pensi che foto e video professionali siano solo per chi ha budget da agenzia? Con l’AI trasformiamo le foto dei tuoi prodotti in shooting, promo e video iper-realistici. Tu continui a lavorare in negozio.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Card3D intensity={10}><a href="#form"><Button variant="amber" size="lg" className="rounded-full">Richiedi i tuoi contenuti AI <ArrowRight className="size-4" /></Button></a></Card3D>
              <a href="#metodo" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">Come funziona <ArrowDown className="size-4" /></a>
            </div>
            <div className="mt-8"><GoogleBadge /></div>
          </div>
          <Reveal delay={180} className="lg:col-span-6"><StudioVisual /></Reveal>
        </div>
      </section>

      <PhilosophyMarquee items={["Zero vincoli", "Paghi a consumo", "Zero set", "Contenuti fedeli al prodotto", "Su misura, day by day"]} />

      <div className="relative">
        <ThreadLine />
        <section className="relative py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-12 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <ThreadNode n="01" label="Il blocco" />
                <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">“I contenuti belli <span className="font-normal italic text-amber">costano troppo.</span>”</h2>
              </div>
              <p className="self-end text-muted-foreground lg:col-span-5">Fino a ieri era vero: fotografo, location, modelli, post-produzione. Oggi l’AI cambia le regole, e un negozio locale può comunicare con la stessa qualità di un grande marchio.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { Icon: Search, t: "Una giornata di set ferma tutto", d: "Organizzare uno shooting vuol dire chiudere, spostare merce, coordinare persone. E poi aspettare settimane per il risultato.", k: "Il tempo è il costo nascosto" },
                { Icon: MousePointerClick, t: "Le foto del telefono non bastano", d: "Il prodotto è bello dal vivo, ma online sembra anonimo. E sui social chi ha immagini curate si prende l’attenzione.", k: "Online si compra con gli occhi" },
                { Icon: Wallet, t: "Servono sempre contenuti nuovi", d: "Saldi, stagioni, nuovi arrivi, pubblicità: ogni mese ne servono altri. Rifare uno shooting ogni volta non è sostenibile.", k: "Il ritmo dei social non aspetta" },
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
              <ThreadNode n="02" label="Cosa creiamo" />
              <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">Il tuo studio creativo, <span className="font-normal italic text-amber">sempre aperto.</span></h2>
              <p className="mt-6 text-muted-foreground">Partiamo dalle foto reali dei tuoi prodotti e creiamo contenuti per ogni canale. Ogni immagine viene rifinita a mano perché resti fedele a ciò che vendi.</p>
              <a href="#form" className="mt-8 inline-block"><Button variant="amber" className="rounded-full">Voglio i miei contenuti <ArrowRight className="size-4" /></Button></a>
            </Reveal>
            <div className="grid gap-4">
              {AGENZ_AI_OUTPUTS.map(({ Icon, t, d }, i) => (
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
                <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl"><span className="lp-thread-text font-normal italic">AI Studio Flow.</span> Brief, generazione, consegna.</h2>
              </div>
              <p className="self-end text-muted-foreground lg:col-span-5">Niente set, niente attese di settimane. Tu ci dai il prodotto, noi ti restituiamo contenuti pronti da pubblicare.</p>
            </div>
            <Reveal className="mb-6 hidden lg:block"><div className="lp-draw h-px w-full" /></Reveal>
            <div className="grid gap-6 lg:grid-cols-3">
              {AGENZ_AI_STEPS.map((s, i) => {
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
              <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">Raccontaci cosa vendi. <span className="font-normal italic text-amber">Al resto pensa l’AI.</span></h2>
              <p className="mt-6 text-muted-foreground">Tre domande su contenuti, abitudini e frequenza. Ti richiamiamo per definire lo stile e inviarti il preventivo.</p>
              <ul className="mt-8 space-y-3">
                {["Call conoscitiva gratuita", "Contenuti fedeli al prodotto reale", "Nessun vincolo contrattuale"].map((p) => <li key={p} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-amber" />{p}</li>)}
              </ul>
            </div>
            <LandingForm line="agenz-ai" lineLabel="Agenz.AI" variant="a" questions={AGENZ_AI_QUESTIONS} submitLabel="Richiedi i tuoi contenuti AI" />
          </div>
        </section>

        <section className="relative py-24 lg:py-32">
          <div className="mx-auto max-w-3xl px-5 lg:px-8">
            <ThreadNode n="06" label="Domande frequenti" />
            <h2 className="mb-8 font-display text-3xl font-medium tracking-tight sm:text-4xl">Prima di iniziare, <span className="font-normal italic text-amber">facciamo chiarezza.</span></h2>
            <Accordion type="single" collapsible className="rounded-3xl border border-border bg-surface-elevated/50 px-6 backdrop-blur-xl">
              {AGENZ_AI_FAQ.map((f, i) => (
                <AccordionItem key={f.q} value={`f${i}`}>
                  <AccordionTrigger className="text-left font-display">{f.q}</AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-10 text-center"><Card3D intensity={10} className="inline-block"><a href="#form"><Button variant="amber" size="lg" className="rounded-full">Richiedi i tuoi contenuti AI <ArrowRight className="size-4" /></Button></a></Card3D></div>
          </div>
        </section>
      </div>
    </div>
  );
}
