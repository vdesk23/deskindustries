import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sparkles, Zap, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/progetti")({
  head: () => ({
    meta: [
      { title: "I nostri progetti — Foll.IA e l'ecosistema Desk Industries" },
      {
        name: "description",
        content:
          "Non solo agenzia: Desk Industries sviluppa prodotti e progetti per spingere i confini del marketing locale. Scopri Foll.IA e il nostro ecosistema.",
      },
      { property: "og:title", content: "Progetti — Desk Industries" },
      {
        property: "og:description",
        content: "L'ecosistema Desk Industries: prodotti e progetti per il marketing locale.",
      },
    ],
  }),
  component: ProgettiPage,
});

const SECONDARY_PROJECTS = [
  {
    name: "Desk Tools",
    status: "In sviluppo",
    tagline: "La cassetta degli attrezzi delle attività locali.",
    description:
      "Una suite di micro-tool gratuiti pensata per chi gestisce un'attività: generatore di QR menu, calcolatore margini, template post, e molto altro.",
    Icon: Layers,
  },
  {
    name: "COCO Lab",
    status: "Coming soon",
    tagline: "Il laboratorio del metodo COCO.",
    description:
      "Casi studio, playbook scaricabili e mini-corsi gratuiti per imparare a portare clienti reali nel proprio negozio.",
    Icon: Zap,
  },
];

function ProgettiPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grain pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
            I nostri progetti
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-display font-medium leading-[0.95] tracking-tight text-balance max-w-5xl">
            Non solo agenzia.{" "}
            <span className="italic text-amber font-normal">Un ecosistema.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg lg:text-xl text-muted-foreground leading-relaxed">
            Sviluppiamo internamente tool e strumenti pensati per aiutare le attività locali a
            crescere online. Ogni progetto nasce da un bisogno concreto dei nostri clienti e
            diventa un prodotto che chiunque può utilizzare.
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative p-10 lg:p-16 rounded-3xl border border-border bg-gradient-to-br from-surface-elevated via-surface-elevated to-background overflow-hidden"
          >
            <div className="absolute top-0 right-0 size-96 bg-amber/10 rounded-full blur-3xl" />
            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/10 text-amber text-xs font-display font-semibold mb-6">
                  <Sparkles className="size-3" />
                  Progetto in evidenza
                </div>
                <div className="text-6xl lg:text-7xl font-display font-medium tracking-tight">
                  Foll.<span className="text-amber">IA</span>
                </div>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  Il website builder AI per le attività locali: genera un sito web professionale
                  e completo semplicemente compilando un breve form. Niente codice, niente
                  template anonimi, solo un sito che parla davvero della tua attività.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="https://follia.ai" target="_blank" rel="noopener noreferrer">
                    <Button variant="amber" size="lg">
                      Visita Foll.IA <ArrowUpRight />
                    </Button>
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Contenuti AI", desc: "Genera caption, reel e post coerenti col tuo brand." },
                  { title: "Analisi automatica", desc: "Capisci cosa funziona e cosa no, senza dashboard complesse." },
                  { title: "Ecosistema Desk", desc: "Integrato nativamente con i nostri pacchetti COCO." },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="p-5 rounded-2xl bg-background/50 backdrop-blur border border-border"
                  >
                    <h3 className="font-display font-semibold text-base mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 lg:py-28 border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
              Altri progetti
            </p>
            <h2 className="text-3xl lg:text-5xl font-display font-medium tracking-tight text-balance">
              Cosa stiamo costruendo
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {SECONDARY_PROJECTS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-8 rounded-3xl border border-border bg-background hover:border-amber/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="size-12 rounded-xl bg-amber-soft flex items-center justify-center">
                    <p.Icon className="size-5 text-amber" />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground border border-border rounded-full px-3 py-1">
                    {p.status}
                  </span>
                </div>
                <h3 className="text-2xl font-display font-semibold mb-2">{p.name}</h3>
                <p className="text-amber/80 text-sm mb-3">{p.tagline}</p>
                <p className="text-muted-foreground leading-relaxed text-sm">{p.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 lg:py-32 border-t border-border">
        <div className="mx-auto max-w-4xl px-5 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-display font-medium tracking-tight text-balance">
            Hai un'idea da{" "}
            <span className="italic text-amber font-normal">costruire insieme</span>?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Collaboriamo con brand, creator e startup che vogliono lasciare il segno nel locale.
          </p>
          <div className="mt-10">
            <Link to="/contatti">
              <Button variant="hero" size="xl">
                Parliamone <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
