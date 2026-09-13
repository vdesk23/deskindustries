import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
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

const PROJECTS = [
  {
    name: "BancoPlus",
    tag: "BRAND",
    desc: "Suite di servizi digitali per l'automazione di farmacie",
    accent: "from-amber to-amber/60",
  },
  {
    name: "Magnus Agency",
    tag: "Marketing",
    desc: "Il braccio marketing del gruppo: contenuti, ads, brand strategy per MPMI.",
    accent: "from-purple-400 to-amber",
  },
  {
    name: "Arkeo",
    tag: "R&D",
    desc: "Studio interno di prodotti software: MVP no-code, automazioni AI, SaaS proprietari.",
    accent: "from-cyan-400 to-amber",
  },
];

const EXPERTISE = [
  { Icon: Bot, label: "Agenti AI", desc: "Team AI custom su Claude, GPT, workflows LangGraph." },
  { Icon: Code2, label: "No-code / Low-code", desc: "Bubble, Webflow, Lovable, Supabase, Airtable." },
  { Icon: Zap, label: "Automazioni", desc: "n8n, Make, Zapier orchestrati con logica AI." },
  { Icon: Palette, label: "Brand & Design", desc: "Identità, sistemi visivi, prodotti UX-first." },
  { Icon: Search, label: "SEO & AIO", desc: "Ottimizzazione per Google, ChatGPT, Perplexity." },
  { Icon: Layers, label: "Web & Mobile", desc: "TanStack, Next, PWA, app native su misura." },
];

const CAPABILITIES = [
  "Automatizza la raccolta di recensioni",
  "Costi di sviluppo a consumo",
  "Incassa ed emetti fatture in automatico",
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
            Gruppo di digitalizzazione · AI-native
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-display font-medium leading-[0.98] tracking-tight text-balance"
          >
             Ti facciamo risparmiare tempo e risorse disegnando automazioni per la tua attività.
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

      {/* IL GRUPPO */}
      <section className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-end mb-16">
            <div className="lg:col-span-7">
              <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
                Il gruppo
              </p>
              <h2 className="text-4xl lg:text-6xl font-display font-medium tracking-tight text-balance">
                 Digitalizza, Comunica, Scala.
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-lg text-muted-foreground">
                 Desk Industries racchiude un gruppo di aziende e brand interni ed esterni per la digitalizzazione a 360° della propria attività.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {PROJECTS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card3D className="group h-full p-8 rounded-3xl bg-surface-elevated/50 backdrop-blur-xl border border-border overflow-hidden">
                  <div className={`absolute -top-16 -right-16 size-48 rounded-full bg-gradient-to-br ${p.accent} opacity-30 blur-3xl`} />
                  <div className="relative">
                    <p className="text-xs uppercase tracking-widest text-amber mb-4">{p.tag}</p>
                    <h3 className="text-3xl font-display font-semibold mb-4">{p.name}</h3>
                    <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
                    <div className="mt-8 inline-flex items-center gap-1.5 text-sm text-foreground">
                      Scopri <ArrowUpRight className="size-4 text-amber" />
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERTISE */}
      <section className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl mb-16">
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
              Expertise
            </p>
            <h2 className="text-4xl lg:text-5xl font-display font-medium tracking-tight text-balance">
              Sei aree di competenza,{" "}
              <span className="italic text-amber font-normal">un solo team orchestrato</span>.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXPERTISE.map(({ Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <Card3D intensity={6} className="p-6 rounded-2xl border border-border bg-surface-elevated/50 backdrop-blur-xl h-full">
                  <div className="size-12 rounded-xl bg-amber-soft flex items-center justify-center mb-5">
                    <Icon className="size-5 text-amber" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
                <span className="italic text-amber font-normal">Ti rispondiamo entro 24h.</span>
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
