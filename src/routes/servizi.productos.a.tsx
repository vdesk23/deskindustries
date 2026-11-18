import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, Check, Clock3, Compass, Lightbulb, MapPin, Rocket, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card3D } from "@/components/ui/Card3D";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LandingForm } from "@/components/landing/LandingForm";
import { ReviewsMarquee } from "@/components/landing/ReviewsMarquee";
import { Reveal } from "@/components/landing/Reveal";
import { Aurora, PhilosophyMarquee, ThreadLine, ThreadNode, WordsIn } from "@/components/landing/Thread";
import { useLandingUtm } from "@/components/landing/useLandingUtm";
import { GoogleBadge, METHOD_NAME, METHOD_STEPS, PRODUCTOS_FAQ, PRODUCTOS_QUESTIONS } from "@/components/landing/productos-content";
import hero from "@/assets/productos-hero.jpg";

const TITLE = "ProductOS — Il prodotto digitale del tuo negozio";
const DESC = "Pensi che il tuo negozio non possa avere un prodotto digitale? Lo troviamo noi, creiamo la strategia e lo lanciamo. Prima call gratuita.";

export const Route = createFileRoute("/servizi/productos/a")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://www.deskindustries.com/servizi/productos/a" },
      { rel: "preload", as: "image", href: hero },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Service", name: "ProductOS", serviceType: "Creazione di prodotti digitali per negozi fisici", provider: { "@id": "https://www.deskindustries.com/#organization" }, areaServed: "IT" },
          { "@type": "FAQPage", mainEntity: PRODUCTOS_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        ],
      }),
    }],
  }),
  component: ProductOSLong,
});

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-display uppercase tracking-[0.25em] text-amber mb-4">{children}</p>
);

function ProductOSLong() {
  useLandingUtm();
  return (
    <div className="relative overflow-x-clip">
      <Aurora className="fixed -z-0 opacity-70" />
      {/* 1. Hook */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden">
        <img src={hero} alt="Titolare di un negozio con un tablet che mostra il suo prodotto digitale" width={1600} height={1008}
          fetchPriority="high" className="lp-kenburns absolute inset-0 h-full w-full object-cover object-[60%_25%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
        <Aurora className="mix-blend-screen opacity-60" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pb-20 pt-40 w-full">
          <div className="max-w-2xl">
            <Eyebrow>ProductOS · Desk Industries</Eyebrow>
            <h1 className="font-display text-4xl sm:text-6xl font-medium tracking-tight leading-[1.05]">
              <WordsIn text="Il tuo negozio ha già un" /><span className="lp-word italic lp-thread-text font-normal" style={{ animationDelay: "420ms" }}>prodotto digitale.</span>{" "}<WordsIn text="Noi lo troviamo." start={560} />
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Non serve essere esperti di digitale. Partiamo da ciò che sai fare meglio e lo trasformiamo in un prodotto che vende anche quando il negozio è chiuso.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Card3D intensity={10}><a href="#form"><Button variant="amber" size="lg" className="rounded-full">Prenota la call gratuita <ArrowRight className="size-4" /></Button></a></Card3D>
              <a href="#metodo" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">Come funziona <ArrowDown className="size-4" /></a>
            </div>
            <div className="mt-8"><GoogleBadge /></div>
          </div>
        </div>
      </section>

      <PhilosophyMarquee items={["Zero vincoli", "Paghi a consumo", "Su misura, day by day", "Dal negozio al digitale", "Guadagniamo se guadagni"]} />

      <div className="relative">
      <ThreadLine />
      {/* 2. Agitazione */}
      <section className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 mb-12">
            <div className="lg:col-span-7">
              <ThreadNode n="01" label="Il blocco" />
              <h2 className="font-display text-3xl sm:text-5xl font-medium tracking-tight">“Il digitale <span className="italic text-amber font-normal">non fa per me</span>.”</h2>
            </div>
            <p className="lg:col-span-5 text-muted-foreground self-end">
              È la frase che sentiamo più spesso. Non è colpa tua: nessuno ti ha mai mostrato cosa può diventare digitale nel tuo lavoro. Intanto, però, il negozio resta legato a tre limiti.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { Icon: TrendingDown, t: "Margini sempre più stretti", d: "Affitto, personale e fornitori crescono ogni anno. Il prezzo dei tuoi prodotti non può salire alla stessa velocità: ciò che resta non basta a reinvestire.", k: "Vendi di più, guadagni uguale" },
              { Icon: MapPin, t: "Clienti solo di zona", d: "Chi non passa davanti alla vetrina non sa che esisti. I social danno visibilità a intermittenza, ma non ti portano chi cerca te e non ti trova.", k: "Il bacino finisce lì" },
              { Icon: Clock3, t: "Ricavi legati agli orari", d: "Quando abbassi la saracinesca smetti di guadagnare. Ferie, chiusure e serate vuote sono fatturato che non torna indietro.", k: "Il negozio non lavora di notte" },
            ].map(({ Icon, t, d, k }, i) => (
              <Reveal key={t} delay={i * 80}>
                <Card3D intensity={5} className="lp-glow-card h-full rounded-3xl border border-border bg-surface-elevated/50 backdrop-blur-xl p-8">
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-amber/25 bg-amber-soft">
                    <Icon className="size-6 text-amber" />
                  </div>
                  <h3 className="mt-6 font-display text-xl font-medium tracking-tight">{t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d}</p>
                  <p className="mt-6 border-t border-border pt-4 text-xs font-display uppercase tracking-[0.18em] text-amber/80">{k}</p>
                </Card3D>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Soluzione */}
      <section className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 grid gap-12 lg:grid-cols-2 items-center">
          <Reveal>
            <ThreadNode n="02" label="La soluzione" />
            <h2 className="font-display text-3xl sm:text-5xl font-medium tracking-tight">Dal bancone a un <span className="italic text-amber font-normal">secondo fatturato</span>.</h2>
            <p className="mt-6 text-muted-foreground">Troviamo noi il prodotto digitale adatto al tuo negozio e costruiamo la strategia per venderlo.</p>
            <ul className="mt-8 space-y-4">
              {[
                "Analizziamo il tuo know-how e i tuoi clienti per capire cosa può diventare digitale.",
                "Scegliamo il prodotto giusto: corso, app, abbonamento o kit digitale.",
                "Lo lanciamo e lo facciamo crescere insieme a te.",
              ].map((p) => <li key={p} className="flex gap-3"><Check className="size-5 text-amber shrink-0 mt-0.5" /><span>{p}</span></li>)}
            </ul>
            <a href="#form" className="inline-block mt-8"><Button variant="amber" className="rounded-full">Scopri il tuo prodotto <ArrowRight className="size-4" /></Button></a>
          </Reveal>
          <Reveal delay={100}>
            <div className="grid grid-cols-2 gap-4">
              {[["Corsi e masterclass", "Insegna ciò che sai fare"], ["App fedeltà", "Clienti che tornano"], ["Abbonamenti", "Ricavi ricorrenti"], ["Kit digitali", "Guide, template, ricette"]].map(([t, d]) => (
                <div key={t} className="lp-glow-card rounded-2xl transition-transform duration-500 hover:-translate-y-1 border border-border bg-surface-elevated/50 backdrop-blur-xl p-5">
                  <p className="font-display font-medium">{t}</p><p className="text-xs text-muted-foreground mt-1">{d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. Metodo */}
      <section id="metodo" className="relative py-24 lg:py-32 scroll-mt-10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 mb-12">
            <div className="lg:col-span-7">
              <ThreadNode n="03" label="Il metodo" />
              <h2 className="font-display text-3xl sm:text-5xl font-medium tracking-tight"><span className="italic text-amber font-normal">{METHOD_NAME}</span>: tre passi, nessun salto nel vuoto.</h2>
            </div>
            <p className="lg:col-span-5 text-muted-foreground self-end">Un setup iniziale e una piccola quota sui ricavi del prodotto: guadagniamo quando guadagni anche tu.</p>
          </div>
          <Reveal className="hidden lg:block mb-6"><div className="lp-draw h-px w-full" /></Reveal>
          <div className="grid gap-6 lg:grid-cols-3">
            {METHOD_STEPS.map((s, i) => {
              const Icon = [Compass, Lightbulb, Rocket][i];
              return (
                <Reveal key={s.t} delay={i * 100}>
                  <Card3D intensity={6} className="lp-glow-card h-full rounded-3xl border border-border bg-surface-elevated/50 backdrop-blur-xl p-8">
                    <div className="flex items-center justify-between"><Icon className="size-6 text-amber" /><span className="font-display text-4xl lp-thread-text">{s.n}</span></div>
                    <h3 className="mt-6 font-display text-2xl font-medium tracking-tight">{s.t}</h3>
                    <p className="mt-3 text-sm text-muted-foreground">{s.d}</p>
                  </Card3D>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Prove */}
      <section className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 mb-12">
            <div className="lg:col-span-7">
              <ThreadNode n="04" label="Chi l'ha già fatto" />
              <h2 className="font-display text-3xl sm:text-5xl font-medium tracking-tight">Prodotti digitali <span className="italic text-amber font-normal">già nati</span> con noi.</h2>
            </div>
            <p className="lg:col-span-5 text-muted-foreground self-end">Con CONSUS abbiamo trasformato un metodo di lavoro in un software gestionale. Lo stesso approccio lo applichiamo ai negozi.</p>
          </div>
          <ReviewsMarquee />
        </div>
      </section>

      {/* 6. Modulo */}
      <section id="form" className="relative py-24 lg:py-32 scroll-mt-10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 grid gap-12 lg:grid-cols-2 items-start">
          <div>
            <ThreadNode n="05" label="Prima call gratuita" />
            <h2 className="font-display text-3xl sm:text-5xl font-medium tracking-tight">Scopri il <span className="italic text-amber font-normal">prodotto digitale</span> del tuo negozio.</h2>
            <p className="mt-6 text-muted-foreground">Tre domande, due minuti. Ti richiamiamo noi per una call gratuita di 30 minuti.</p>
          </div>
          <LandingForm line="productos" lineLabel="ProductOS" variant="a" questions={PRODUCTOS_QUESTIONS} />
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <ThreadNode n="06" label="Domande frequenti" />
          <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight mb-8">Hai ancora <span className="italic text-amber font-normal">dubbi</span>?</h2>
          <Accordion type="single" collapsible className="rounded-3xl border border-border bg-surface-elevated/50 backdrop-blur-xl px-6">
            {PRODUCTOS_FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`f${i}`}>
                <AccordionTrigger className="font-display text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-10 text-center">
            <Card3D intensity={10} className="inline-block"><a href="#form"><Button variant="amber" size="lg" className="rounded-full">Prenota la call gratuita <ArrowRight className="size-4" /></Button></a></Card3D>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
