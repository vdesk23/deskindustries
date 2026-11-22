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
import { DIGITAL_KIT_FAQ, DIGITAL_KIT_INCLUDES, DIGITAL_KIT_QUESTIONS, DIGITAL_KIT_STEPS, KitVisual } from "@/components/landing/digital-kit-content";
import { useLandingUtm } from "@/components/landing/useLandingUtm";

const TITLE = "Digital Kit | Porta online la tua attività";
const DESC = "Parti da zero? Scheda Google, sito, social e primi passi di vendita pronti per la tua attività. Senza vincoli contrattuali.";

export const Route = createFileRoute("/servizi/digital-kit/a")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.deskindustries.com/servizi/digital-kit/a" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Service", name: "Digital Kit", serviceType: "Presenza online per attività locali che partono da zero", provider: { "@id": "https://www.deskindustries.com/#organization" }, areaServed: "IT" },
          { "@type": "FAQPage", mainEntity: DIGITAL_KIT_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        ],
      }),
    }],
  }),
  component: DigitalKitLong,
});

function DigitalKitLong() {
  useLandingUtm();
  return (
    <div className="relative overflow-x-clip">
      <Aurora className="fixed opacity-70" />
      <section className="relative flex min-h-[92vh] items-center overflow-hidden pb-20 pt-32">
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-6">
            <p className="mb-4 font-display text-xs uppercase tracking-[0.25em] text-amber">Digital Kit · Per chi parte da zero</p>
            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
              <WordsIn text="La tua attività merita" />
              <span className="lp-word lp-thread-text font-normal italic" style={{ animationDelay: "420ms" }}>di esistere anche online.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">Pensi che il digitale sia roba per grandi aziende? Oggi i clienti ti cercano su Google prima di entrare in negozio. Con il Digital Kit ti mettiamo online in modo semplice: scheda Google, sito, social e primi passi di vendita. Senza vincoli.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Card3D intensity={10}><a href="#form"><Button variant="amber" size="lg" className="rounded-full">Prepara il mio Digital Kit <ArrowRight className="size-4" /></Button></a></Card3D>
              <a href="#metodo" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">Come funziona <ArrowDown className="size-4" /></a>
            </div>
            <div className="mt-8"><GoogleBadge /></div>
          </div>
          <Reveal delay={180} className="lg:col-span-6"><KitVisual /></Reveal>
        </div>
      </section>

      <PhilosophyMarquee items={["Zero vincoli", "Paghi a consumo", "Anche se parti da zero", "Un’unica identità", "Su misura, day by day"]} />

      <div className="relative">
        <ThreadLine />
        <section className="relative py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-12 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <ThreadNode n="01" label="Il blocco" />
                <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">“Il digitale <span className="font-normal italic text-amber">non fa per me.</span>”</h2>
              </div>
              <p className="self-end text-muted-foreground lg:col-span-5">Lo pensano in tanti, ed è comprensibile: nessuno ti ha mai spiegato da dove iniziare. Ma essere online oggi non è un lusso, è il modo in cui i clienti decidono dove andare.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { Icon: Search, t: "Se non ti trovano, non esisti", d: "Un cliente cerca “negozio vicino a me”, vede i concorrenti con foto e recensioni e sceglie loro. Non perché siano migliori: perché si vedono.", k: "Il cliente sceglie chi trova" },
                { Icon: MousePointerClick, t: "Sembra tutto troppo tecnico", d: "Domini, hosting, profili, impostazioni: sembra serva un esperto per ogni cosa. Così rimandi, e intanto il tempo passa.", k: "Ci pensiamo noi alla parte tecnica" },
                { Icon: Wallet, t: "Paura di spendere troppo", d: "Agenzie con canoni annuali e pacchetti pieni di cose inutili. Ti serve l’essenziale, fatto bene, senza legarti per anni.", k: "Solo ciò che ti serve, zero vincoli" },
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
              <ThreadNode n="02" label="Cosa contiene" />
              <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">L’essenziale per esserci, <span className="font-normal italic text-amber">fatto bene.</span></h2>
              <p className="mt-6 text-muted-foreground">Quattro pezzi collegati tra loro, con la stessa identità. Niente strumenti superflui: partiamo da cosa ti serve davvero e ti insegniamo a gestirlo.</p>
              <a href="#form" className="mt-8 inline-block"><Button variant="amber" className="rounded-full">Voglio il mio kit <ArrowRight className="size-4" /></Button></a>
            </Reveal>
            <div className="grid gap-4">
              {DIGITAL_KIT_INCLUDES.map(({ Icon, t, d }, i) => (
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
                <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl"><span className="lp-thread-text font-normal italic">Kit Start.</span> Tre passaggi e sei online.</h2>
              </div>
              <p className="self-end text-muted-foreground lg:col-span-5">Partiamo da ciò che hai, anche se online non c’è ancora nulla. Tu ci racconti la tua attività, al resto pensiamo noi.</p>
            </div>
            <Reveal className="mb-6 hidden lg:block"><div className="lp-draw h-px w-full" /></Reveal>
            <div className="grid gap-6 lg:grid-cols-3">
              {DIGITAL_KIT_STEPS.map((s, i) => {
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
                <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">Chi è partito <span className="font-normal italic text-amber">con noi.</span></h2>
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
              <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">Non devi sapere nulla di digitale. <span className="font-normal italic text-amber">Ci pensiamo noi.</span></h2>
              <p className="mt-6 text-muted-foreground">Tre domande per capire da dove parti e cosa ti serve per primo. Ti richiamiamo per definire il kit e inviarti il preventivo.</p>
              <ul className="mt-8 space-y-3">
                {["Call conoscitiva gratuita", "Preventivo chiaro, senza sorprese", "Nessun vincolo contrattuale"].map((p) => <li key={p} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-amber" />{p}</li>)}
              </ul>
            </div>
            <LandingForm line="digital-kit" lineLabel="Digital Kit" variant="a" questions={DIGITAL_KIT_QUESTIONS} submitLabel="Prepara il mio Digital Kit" />
          </div>
        </section>

        <section className="relative py-24 lg:py-32">
          <div className="mx-auto max-w-3xl px-5 lg:px-8">
            <ThreadNode n="06" label="Domande frequenti" />
            <h2 className="mb-8 font-display text-3xl font-medium tracking-tight sm:text-4xl">Prima di iniziare, <span className="font-normal italic text-amber">facciamo chiarezza.</span></h2>
            <Accordion type="single" collapsible className="rounded-3xl border border-border bg-surface-elevated/50 px-6 backdrop-blur-xl">
              {DIGITAL_KIT_FAQ.map((f, i) => (
                <AccordionItem key={f.q} value={`f${i}`}>
                  <AccordionTrigger className="text-left font-display">{f.q}</AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-10 text-center"><Card3D intensity={10} className="inline-block"><a href="#form"><Button variant="amber" size="lg" className="rounded-full">Prepara il mio Digital Kit <ArrowRight className="size-4" /></Button></a></Card3D></div>
          </div>
        </section>
      </div>
    </div>
  );
}
