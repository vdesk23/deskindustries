import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Bot,
  Cpu,
  Rocket,
  Layers,
  Zap,
  Search,
  Code2,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/hero/LeadForm";
import { SceneBackground } from "@/components/layout/SceneBackground";
import { Card3D } from "@/components/ui/Card3D";
import { GoogleReviews } from "@/components/GoogleReviews";
import { PartnersMarquee } from "@/components/PartnersMarquee";
import { ExpertiseExplorer } from "@/components/ExpertiseExplorer";

const CAPABILITIES = [
  "Strategie di marketing data-driven",
  "Soluzioni digitali Cloud e on-premises",
  "Automazioni AI-based",
  "Proprietà del codice",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function HomePage() {
  return (
    <>
      <SceneBackground />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-5 lg:px-8 pt-24 pb-24 lg:pt-36 lg:pb-40 text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 backdrop-blur-xl px-3 py-1.5 text-xs text-muted-foreground"
          >
            <span className="size-1.5 rounded-full bg-amber animate-pulse" />
             Soluzioni Digitali, Impatto Reale.
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-display font-medium leading-[0.98] tracking-tight text-balance"
          >
             Ti facciamo risparmiare <span className="italic text-amber">tempo</span> e <span className="italic text-amber">risorse</span> disegnando soluzioni digitali per la tua attività.
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
             Desk Industries aiuta le MPMI nella transizione digitale costruendo e disegnando automazioni per incrementare: vendite, marketing, logistica, gestione del personale e delle attività ripetitive
          </motion.p>

          <motion.ul
            custom={3}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto text-left"
          >
            {CAPABILITIES.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Sparkles className="size-4 text-amber mt-0.5 shrink-0" />
                {c}
              </li>
            ))}
          </motion.ul>

          <motion.div
            custom={4}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            <a href="#lead">
              <Card3D className="rounded-full" intensity={12}>
                <Button variant="hero" size="xl" className="rounded-full">
                  Richiedi una consulenza <ArrowRight />
                </Button>
              </Card3D>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-24 flex flex-wrap justify-center gap-6 lg:gap-10 text-center"
          >
            {[
               { num: "40+", label: "MPMI digitalizzate" },
               { num: "500+", label: "Flussi di automazione" },
               { num: "4000+", label: "Ore risparmiate" },
            ].map((s) => (
              <div key={s.label} className="min-w-[160px] border-t-2 border-amber pt-4 px-6">
                <div className="text-3xl lg:text-4xl font-display font-semibold">{s.num}</div>
                <div className="mt-1 text-sm text-muted-foreground leading-snug">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PARTNER & CERTIFICAZIONI */}
      <PartnersMarquee />


      {/* EXPERTISE */}
      <section className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl mb-16">
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
              Expertise
            </p>
            <h2 className="text-4xl lg:text-5xl font-display font-medium tracking-tight text-balance">
              Sette aree di competenza,{" "}
              <span className="italic text-amber font-normal">un unico partner</span>.
            </h2>
            <p className="mt-4 text-muted-foreground">Esplora le aree: clicca una forma, usa le frecce o scegli qui sotto.</p>
          </div>

          <ExpertiseExplorer />
        </div>
      </section>

      {/* RECENSIONI GOOGLE */}
      <GoogleReviews />


      {/* LEAD FORM */}
      <section id="lead" className="relative py-24 lg:py-32 scroll-mt-24">
        <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
                Iniziamo
              </p>
              <h2 className="text-4xl lg:text-5xl font-display font-medium tracking-tight text-balance">
                Raccontaci il tuo progetto.{" "}
                <span className="italic text-amber font-normal">{"\nTi rispondiamo\nentro 24h."}</span>
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Ogni richiesta viene letta da una persona reale del team. Preparerai una call con un
                senior specialist, non con un commerciale.
              </p>
              <div className="mt-10 grid gap-4">
                {[
                  { Icon: Rocket, t: "Prima call gratuita", d: "30 minuti di analisi, senza impegno." },
                  { Icon: Cpu, t: "Proposta AI-powered", d: "Un piano d'azione generato in 48h dal nostro team." },
                  { Icon: Sparkles, t: "Start rapido", d: "Si firma e si parte entro 7 giorni." },
                ].map(({ Icon, t, d }) => (
                  <div key={t} className="flex items-start gap-4">
                    <div className="size-10 rounded-lg bg-amber-soft flex items-center justify-center shrink-0">
                      <Icon className="size-5 text-amber" />
                    </div>
                    <div>
                      <p className="font-display font-semibold">{t}</p>
                      <p className="text-sm text-muted-foreground">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card3D intensity={5} className="rounded-3xl">
              <LeadForm />
            </Card3D>
          </div>
        </div>
      </section>

      {/* BLOG TEASER */}
    </>
  );
}
