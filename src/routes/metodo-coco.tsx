import { draftBeforeLoad, draftHead } from "@/lib/draft-route";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Hammer, Megaphone, Magnet, Heart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/metodo-coco")({
  beforeLoad: draftBeforeLoad,
  head: () => draftHead,
  head: () => ({
    meta: [
      { title: "Metodo COCO — Desk Industries" },
      {
        name: "description",
        content:
          "Il metodo COCO di Desk Industries: 4 fasi per portare clienti reali nel tuo negozio. Costruire, Online, Cementificare, Offline.",
      },
      { property: "og:title", content: "Il Metodo COCO — Desk Industries" },
      {
        property: "og:description",
        content: "Quattro fasi pensate per attività locali con una saracinesca da alzare ogni mattina.",
      },
    ],
    links: [{ rel: "canonical", href: "https://deskindustries.lovable.app/metodo-coco" }],
  }),
  component: MetodoPage,
});

const PHASES = [
  {
    letter: "C",
    word: "Costruire",
    Icon: Hammer,
    title: "Posa le fondamenta digitali",
    description:
      "Tutto parte da basi solide. Brand identity coerente, sito web veloce e ottimizzato, presenza Google My Business curata e suite di strumenti professionali (Workspace, Analytics, Search Console).",
    bullets: [
      "Sito web responsive e ottimizzato SEO",
      "Configurazione completa Google Workspace",
      "Brand identity e materiali coordinati",
      "Tracciamento eventi e conversioni",
    ],
    duration: "Settimane 1–3",
  },
  {
    letter: "O",
    word: "Online",
    Icon: Megaphone,
    title: "Attiva la visibilità",
    description:
      "Il negozio è pronto, ora deve farsi vedere. Pubblichiamo contenuti regolari, attiviamo SEO locale e advertising mirato per intercettare chi sta già cercando ciò che offri.",
    bullets: [
      "Calendario editoriale social",
      "SEO locale e Google My Business",
      "Campagne advertising geolocalizzate",
      "Email marketing e newsletter",
    ],
    duration: "Settimane 2–6",
  },
  {
    letter: "C",
    word: "Cementificare",
    Icon: Magnet,
    title: "Trasforma click in clienti",
    description:
      "Una visualizzazione non è un cliente. Costruiamo funnel, automazioni e CRM che accompagnano l'utente dal feed alla porta del tuo negozio, riducendo gli attriti.",
    bullets: [
      "Automazioni WhatsApp e prenotazioni",
      "Landing page e funnel di conversione",
      "Lead nurturing automatizzato",
      "Integrazione CRM e gestionale",
    ],
    duration: "Settimane 4–8",
  },
  {
    letter: "O",
    word: "Offline",
    Icon: Heart,
    title: "Fidelizza dal vivo",
    description:
      "Il vero risultato si misura allo scontrino. Forniamo gli strumenti per aumentare scontrino medio, prenotazioni ricorrenti e passaparola. L'online che cementa l'offline.",
    bullets: [
      "Programmi fedeltà digitali",
      "Recensioni e reputazione locale",
      "Upsell e cross-sell sul punto vendita",
      "Report mensili sui risultati reali",
    ],
    duration: "Mese 2 in poi",
  },
];

function MetodoPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grain pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
            Il metodo
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-display font-medium leading-[0.95] tracking-tight text-balance max-w-5xl">
            <span className="text-amber">C</span>ostruire{" "}
            <span className="text-amber">O</span>nline per{" "}
            <span className="text-amber">C</span>ementificare{" "}
            <span className="text-amber">O</span>ffline
          </h1>
          <p className="mt-8 max-w-2xl text-lg lg:text-xl text-muted-foreground leading-relaxed">
            Non è solo un acronimo. È un metodo testato per portare clienti reali —
            quelli che entrano dalla porta — nel tuo negozio.
          </p>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="space-y-24 lg:space-y-32">
            {PHASES.map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start"
              >
                <div className="lg:col-span-5">
                  <div className="sticky top-28">
                    <div className="flex items-baseline gap-6 mb-6">
                      <span className="text-[10rem] lg:text-[12rem] font-display font-medium text-amber leading-none">
                        {phase.letter}
                      </span>
                      <span className="text-sm text-muted-foreground">Fase 0{i + 1}</span>
                    </div>
                    <p className="text-xs uppercase tracking-widest text-amber/80 mb-2">
                      {phase.word}
                    </p>
                    <h2 className="text-3xl lg:text-5xl font-display font-medium tracking-tight text-balance">
                      {phase.title}
                    </h2>
                  </div>
                </div>

                <div className="lg:col-span-7 lg:pt-8">
                  <div className="p-8 lg:p-10 rounded-3xl bg-surface-elevated border border-border">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="size-12 rounded-xl bg-amber-soft flex items-center justify-center">
                        <phase.Icon className="size-5 text-amber" />
                      </div>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        {phase.duration}
                      </span>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                      {phase.description}
                    </p>
                    <ul className="space-y-3">
                      {phase.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3">
                          <Check className="size-5 text-amber mt-0.5 shrink-0" />
                          <span className="text-foreground">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 lg:py-32 border-t border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-display font-medium tracking-tight text-balance">
            Pronto ad attivare il{" "}
            <span className="italic text-amber font-normal">metodo COCO</span>{" "}
            per la tua attività?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Scopri quale area COCO fa per te o prenota una call gratuita.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/pacchetti">
              <Button variant="hero" size="xl">
                Esplora i servizi COCO <ArrowRight />
              </Button>
            </Link>
            <Link to="/contatti">
              <Button variant="outline" size="xl">
                Prenota una call
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
