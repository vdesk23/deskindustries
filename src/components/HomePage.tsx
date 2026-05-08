import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Scissors,
  Pizza,
  Dumbbell,
  Syringe,
  Flower2,
  BriefcaseBusiness,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleReviews } from "@/components/GoogleReviews";

interface MethodStep {
  letter: string;
  title: string;
  word: string;
  description: string;
}

const METHOD: MethodStep[] = [
  {
    letter: "C",
    word: "Costruire",
    title: "Posa le fondamenta",
    description:
      "Brand identity, sito web e presenza social progettati su misura per la tua attività locale.",
  },
  {
    letter: "O",
    word: "Online",
    title: "Attiva la visibilità",
    description:
      "Contenuti, advertising e SEO locale per farti trovare da chi cerca quello che offri, vicino a te.",
  },
  {
    letter: "C",
    word: "Cementificare",
    title: "Trasforma click in clienti",
    description:
      "Automazioni, CRM e funnel che portano gli utenti dal feed alla porta del tuo negozio.",
  },
  {
    letter: "O",
    word: "Offline",
    title: "Fidelizza dal vivo",
    description:
      "Strumenti per aumentare scontrino medio, prenotazioni e ritorni: l'online che cementa l'offline.",
  },
];

const SECTORS = [
  { slug: "barbieri", label: "Barbieri", Icon: Scissors },
  { slug: "tatuatori", label: "Tatuatori", Icon: Syringe },
  { slug: "pizzerie", label: "Pizzerie", Icon: Pizza },
  { slug: "centri-estetici", label: "Centri estetici", Icon: Flower2 },
  { slug: "palestre", label: "Palestre", Icon: Dumbbell },
  { slug: "studi-professionisti", label: "Studi di Professionisti", Icon: BriefcaseBusiness },
] as const;

const SERVICES = [
  {
    name: "Coco Web",
    tagline: "Siti, SEO/AIO, compliance, automazioni, ecommerce e suite Google.",
    features: ["Creazione sito", "SEO/AIO", "Compliance legale", "GA4, GSC, GTM e GMB"],
    highlighted: true,
  },
  {
    name: "Coco Social",
    tagline: "Pubblicazioni, contenuti, format, branding, registrazioni e ricerca di mercato.",
    features: ["Pubblicazioni", "Creazione contenuti", "Format e branding", "Ricerca di mercato"],
    highlighted: false,
  },
  {
    name: "CoCoaching",
    tagline: "5 ore di coaching: 4 con il team Desk Inc e 1 strategica con Valerio.",
    features: ["5 ore totali", "Team Desk Inc", "Sessione founder", "Piano d’azione"],
    highlighted: false,
  },
  {
    name: "CoCoaching Executive",
    tagline: "10 ore con Valerio per digitalizzare l’attività e affiancare il team interno.",
    features: ["10 ore founder", "Strategia digitale", "Affiancamento team", "Roadmap executive"],
    highlighted: false,
  },
] as const;

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
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grain pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-20 pb-28 lg:pt-32 lg:pb-40">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/60 backdrop-blur px-3 py-1.5 text-xs text-muted-foreground"
          >
            <span className="size-1.5 rounded-full bg-amber animate-pulse" />
            Agenzia di marketing per attività locali
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-6 max-w-5xl text-5xl sm:text-6xl lg:text-8xl font-display font-medium leading-[0.95] tracking-tight text-balance"
          >
            Diamo voce online alle{" "}
            <span className="italic text-amber font-normal">attività locali</span>.
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-8 max-w-2xl text-lg lg:text-xl text-muted-foreground leading-relaxed"
          >
            Costruiamo strategie digitali trasparenti e sostenibili che portano clienti reali nel
            tuo negozio. Il nostro metodo si chiama{" "}
            <span className="text-foreground font-medium">COCO</span>.
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Link to="/pacchetti">
              <Button variant="hero" size="xl">
                Esplora i servizi COCO <ArrowRight />
              </Button>
            </Link>
            <Link to="/metodo-coco">
              <Button variant="outline" size="xl">
                Il metodo COCO
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mt-20 grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-12 max-w-3xl"
          >
            {[
              { num: "34.5M", label: "Visualizzazioni generate nel 2025" },
              { num: "820", label: "Contenuti prodotti nel 2025" },
              { num: "35+", label: "Clienti soddisfatti" },
            ].map((s) => (
              <div key={s.label} className="border-l-2 border-amber pl-4">
                <div className="text-3xl lg:text-4xl font-display font-semibold text-foreground">
                  {s.num}
                </div>
                <div className="mt-1 text-sm text-muted-foreground leading-snug">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* METODO COCO */}
      <section className="relative py-24 lg:py-32 border-t border-border">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-end mb-16">
            <div className="lg:col-span-7">
              <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
                Il metodo
              </p>
              <h2 className="text-4xl lg:text-6xl font-display font-medium tracking-tight text-balance">
                <span className="text-amber">C</span>ostruire{" "}
                <span className="text-amber">O</span>nline per{" "}
                <span className="text-amber">C</span>ementificare{" "}
                <span className="text-amber">O</span>ffline
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Quattro fasi pensate per le attività che hanno una saracinesca da alzare ogni
                mattina. Niente fuffa, solo risultati misurabili.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {METHOD.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group relative p-7 rounded-2xl bg-surface-elevated border border-border hover:border-amber/50 transition-colors"
              >
                <div className="flex items-baseline justify-between mb-8">
                  <span className="text-7xl font-display font-medium text-amber leading-none">
                    {step.letter}
                  </span>
                  <span className="text-xs text-muted-foreground">0{i + 1}</span>
                </div>
                <p className="text-xs uppercase tracking-widest text-amber/80 mb-2">
                  {step.word}
                </p>
                <h3 className="text-xl font-display font-semibold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/metodo-coco">
              <Button variant="ghost">
                Approfondisci il metodo <ArrowUpRight />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SETTORI */}
      <section className="relative py-24 lg:py-32 border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl mb-16">
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
              A chi ci rivolgiamo
            </p>
            <h2 className="text-4xl lg:text-5xl font-display font-medium tracking-tight text-balance">
              Strategie su misura per la tua{" "}
              <span className="italic text-amber font-normal">categoria</span>.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {SECTORS.map(({ slug, label, Icon }, i) => (
              <motion.div
                key={slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <Link
                  to="/settori/$slug"
                  params={{ slug }}
                  className="group block p-6 rounded-2xl border border-border hover:border-amber bg-background hover:bg-surface-elevated transition-all duration-300 h-full"
                >
                  <div className="size-12 rounded-xl bg-amber-soft flex items-center justify-center mb-5 group-hover:bg-amber transition-colors">
                    <Icon className="size-5 text-amber group-hover:text-amber-foreground transition-colors" />
                  </div>
                  <h3 className="font-display font-semibold text-base">{label}</h3>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-amber transition-colors">
                    Vedi soluzioni <ArrowRight className="size-3" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* RECENSIONI GOOGLE */}
      <GoogleReviews />

      {/* PACCHETTI */}
      <section className="relative py-24 lg:py-32 border-t border-border">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
              Servizi COCO
            </p>
            <h2 className="text-4xl lg:text-5xl font-display font-medium tracking-tight text-balance">
              Quattro aree modulari.{" "}
              <span className="italic text-amber font-normal">Una proposta su misura.</span>
            </h2>
            <p className="mt-5 text-muted-foreground">
              Coco Web, Coco Social, CoCoaching e CoCoaching Executive si declinano sul tuo settore e sulla struttura della tua azienda.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto">
            {SERVICES.map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`relative p-8 lg:p-10 rounded-3xl border ${
                  plan.highlighted
                    ? "border-amber bg-gradient-to-br from-surface-elevated to-surface shadow-amber"
                    : "border-border bg-surface-elevated"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-8 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber text-amber-foreground text-xs font-display font-semibold">
                    <Sparkles className="size-3" /> Consigliato
                  </div>
                )}
                <h3 className="text-2xl font-display font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check className="size-4 text-amber mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contatti" className="block mt-10">
                  <Button
                    variant={plan.highlighted ? "amber" : "outline"}
                    className="w-full"
                    size="lg"
                  >
                    Richiedi informazioni <ArrowRight />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGETTI / FOLL.IA */}
      <section className="relative py-24 lg:py-32 border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
                I nostri progetti
              </p>
              <h2 className="text-4xl lg:text-5xl font-display font-medium tracking-tight">
                Non solo agenzia.{" "}
                <span className="italic text-amber font-normal">Un ecosistema.</span>
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                Sviluppiamo internamente tool e strumenti per aiutare le attività locali a
                crescere online. Il primo è <span className="text-foreground font-medium">Foll.IA</span>:
                un website builder che genera siti web professionali per le attività locali
                semplicemente compilando un breve form.
              </p>
              <Link to="/progetti" className="inline-block mt-8">
                <Button variant="outline" size="lg">
                  Esplora i progetti <ArrowUpRight />
                </Button>
              </Link>
            </div>

            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="relative p-10 lg:p-14 rounded-3xl border border-border bg-gradient-to-br from-surface-elevated via-surface-elevated to-background overflow-hidden"
              >
                <div className="absolute top-0 right-0 size-64 bg-amber/10 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="text-xs uppercase tracking-widest text-amber mb-3">
                    Progetto in evidenza
                  </div>
                  <div className="text-5xl lg:text-6xl font-display font-medium tracking-tight">
                    Foll.<span className="text-amber">IA</span>
                  </div>
                  <p className="mt-5 text-muted-foreground max-w-md">
                    L'intelligenza artificiale al servizio dei creator e delle attività locali.
                    Un nuovo modo di gestire i contenuti.
                  </p>
                  <div className="mt-8 inline-flex items-center gap-2 text-sm text-foreground font-medium">
                    Scopri Foll.IA
                    <ArrowUpRight className="size-4 text-amber" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="relative py-24 lg:py-40 border-t border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-5 lg:px-8 text-center">
          <h2 className="text-5xl lg:text-7xl font-display font-medium tracking-tight text-balance">
            Pronto a far parlare di te,{" "}
            <span className="italic text-amber font-normal">offline?</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Una call gratuita di 30 minuti per capire come il metodo COCO può funzionare per la
            tua attività.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/contatti">
              <Button variant="hero" size="xl">
                Prenota la tua call <ArrowRight />
              </Button>
            </Link>
            <Link to="/pacchetti">
              <Button variant="outline" size="xl">
                Esplora i servizi COCO
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
