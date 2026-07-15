import { Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
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

const AgentsScene = lazy(() =>
  import("@/components/hero/AgentsScene").then((m) => ({ default: m.AgentsScene })),
);

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  if (!m) return null;
  return <>{children}</>;
}

const PROJECTS = [
  {
    name: "Foll.IA",
    tag: "Prodotto Arkeo",
    desc: "Website builder AI per attività locali: siti generati da un form guidato.",
    accent: "from-amber to-amber/60",
  },
  {
    name: "Magnus Agency",
    tag: "Marketing",
    desc: "Il braccio marketing del gruppo: contenuti, ads, brand strategy per PMI.",
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
  "Team ibrido umani + agenti AI",
  "Progetti chiavi in mano in 4-6 settimane",
  "Metodo iterativo con demo settimanali",
  "Ownership del codice: nessun lock-in",
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
      {/* HERO with 3D */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grain pointer-events-none opacity-40" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT: copy + form */}
            <div>
              <motion.div
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/60 backdrop-blur px-3 py-1.5 text-xs text-muted-foreground"
              >
                <span className="size-1.5 rounded-full bg-amber animate-pulse" />
                Gruppo di digitalizzazione · AI-native
              </motion.div>

              <motion.h1
                custom={1}
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-display font-medium leading-[0.98] tracking-tight text-balance"
              >
                Digitalizziamo le PMI con{" "}
                <span className="italic text-amber font-normal">team umani</span> e{" "}
                <span className="italic text-amber font-normal">agenti AI</span>.
              </motion.h1>

              <motion.p
                custom={2}
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl"
              >
                Desk Industries è un gruppo di specialisti e agenti AI che progettano soluzioni
                digitali su misura. Marketing con <span className="text-foreground">Magnus</span>,
                prodotti proprietari con <span className="text-foreground">Arkeo</span>.
              </motion.p>

              <motion.ul
                custom={3}
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl"
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
                className="mt-10 flex flex-wrap items-center gap-3"
              >
                <a href="#lead">
                  <Button variant="hero" size="xl">
                    Richiedi una consulenza <ArrowRight />
                  </Button>
                </a>
                <Link to="/progetti">
                  <Button variant="outline" size="xl">
                    I nostri progetti
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* RIGHT: 3D scene */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[420px] lg:h-[560px] rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-surface-elevated to-background"
            >
              <ClientOnly>
                <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">Caricamento scena...</div>}>
                  <AgentsScene />
                </Suspense>
              </ClientOnly>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs text-muted-foreground pointer-events-none">
                <span>Team AI · orchestrato</span>
                <span>7 agenti attivi</span>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10"
          >
            {[
              { num: "40+", label: "PMI digitalizzate" },
              { num: "3", label: "Brand del gruppo" },
              { num: "34M+", label: "Impression generate nel 2025" },
              { num: "24h", label: "Tempo medio di risposta" },
            ].map((s) => (
              <div key={s.label} className="border-l-2 border-amber pl-4">
                <div className="text-3xl lg:text-4xl font-display font-semibold">{s.num}</div>
                <div className="mt-1 text-sm text-muted-foreground leading-snug">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* IL GRUPPO */}
      <section className="relative py-24 lg:py-32 border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-end mb-16">
            <div className="lg:col-span-7">
              <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
                Il gruppo
              </p>
              <h2 className="text-4xl lg:text-6xl font-display font-medium tracking-tight text-balance">
                Un ecosistema di brand,{" "}
                <span className="italic text-amber font-normal">un solo obiettivo</span>.
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-lg text-muted-foreground">
                Desk Industries è la holding. Ogni brand copre una verticale specifica, così le PMI
                accedono a competenze specialistiche senza cambiare interlocutore.
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
                className="group relative p-8 rounded-3xl bg-surface-elevated border border-border hover:border-amber transition-colors overflow-hidden"
              >
                <div className={`absolute -top-16 -right-16 size-48 rounded-full bg-gradient-to-br ${p.accent} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity`} />
                <div className="relative">
                  <p className="text-xs uppercase tracking-widest text-amber mb-4">{p.tag}</p>
                  <h3 className="text-3xl font-display font-semibold mb-4">{p.name}</h3>
                  <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
                  <div className="mt-8 inline-flex items-center gap-1.5 text-sm text-foreground">
                    Scopri <ArrowUpRight className="size-4 text-amber" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERTISE */}
      <section className="relative py-24 lg:py-32 border-t border-border">
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
                className="p-6 rounded-2xl border border-border bg-surface-elevated hover:border-amber/50 transition-colors"
              >
                <div className="size-12 rounded-xl bg-amber-soft flex items-center justify-center mb-5">
                  <Icon className="size-5 text-amber" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LEAD FORM */}
      <section id="lead" className="relative py-24 lg:py-32 border-t border-border bg-surface scroll-mt-24">
        <div className="absolute inset-0 bg-gradient-hero opacity-60 pointer-events-none" />
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
                  { Icon: Sparkles, t: "Start rapido", d: "Se firmiamo, si parte entro 7 giorni." },
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

            <LeadForm />
          </div>
        </div>
      </section>

      {/* BLOG TEASER */}
      <section className="relative py-24 lg:py-32 border-t border-border">
        <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
          <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">Blog</p>
          <h2 className="text-4xl lg:text-6xl font-display font-medium tracking-tight text-balance">
            Case study, news,{" "}
            <span className="italic text-amber font-normal">insight</span>.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Progetti reali del gruppo e riflessioni su AI, digitalizzazione e strumenti no-code.
          </p>
          <div className="mt-10">
            <Link to="/blog">
              <Button variant="outline" size="xl">
                Vai al blog <ArrowUpRight />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
