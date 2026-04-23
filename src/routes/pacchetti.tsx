import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Check, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pacchetti")({
  head: () => ({
    meta: [
      { title: "Servizi COCO — Web, Social e Coaching | Desk Industries" },
      {
        name: "description",
        content:
          "Scopri le aree COCO di Desk Industries: Coco Web, Coco Social, CoCoaching e CoCoaching Executive. Richiedi informazioni per una proposta su misura.",
      },
      { property: "og:title", content: "Servizi COCO — Desk Industries" },
      {
        property: "og:description",
        content: "Aree servizio COCO per web, social e coaching digitale. Preventivi su richiesta.",
      },
    ],
  }),
  component: PacchettiPage,
});

const SERVICES = [
  {
    name: "Coco Web",
    tagline: "La componente web della tua presenza digitale",
    description:
      "Siti, sistemi e infrastruttura digitale per farti trovare, convertire e lavorare meglio.",
    features: [
      "Creazione e gestione sito web",
      "Ottimizzazione SEO/AIO per motori di ricerca e risposte AI",
      "Compliance legale con supporto di uno studio legale di Roma",
      "Automazioni operative e commerciali",
      "Gestione ecommerce e flussi di vendita online",
      "Collegamento a GA4, Search Console, Tag Manager e Google My Business",
    ],
    highlighted: true,
  },
  {
    name: "Coco Social",
    tagline: "Contenuti, format e posizionamento social",
    description:
      "Un sistema editoriale pensato per raccontare la tua attività con costanza, metodo e identità.",
    features: [
      "Pubblicazioni social continuative",
      "Creazione contenuti foto, video e copy",
      "Ideazione format proprietari",
      "Branding e direzione creativa",
      "Registrazioni e produzione in sede o da remoto",
      "Ricerca di mercato e analisi competitor",
    ],
    highlighted: false,
  },
  {
    name: "CoCoaching",
    tagline: "5 ore per sbloccare metodo, priorità e azione",
    description:
      "Un bundle operativo per imprenditori e team che vogliono mettere ordine nella crescita digitale.",
    features: [
      "5 ore complessive di coaching",
      "4 ore con il team Desk Inc",
      "1 ora strategica con Valerio Cattedra, founder",
      "Analisi dei canali digitali esistenti",
      "Priorità operative e piano d'azione",
      "Indicazioni pratiche per il team interno",
    ],
    highlighted: false,
  },
  {
    name: "CoCoaching Executive",
    tagline: "Strategia digitale fianco a fianco con il founder",
    description:
      "10 ore con Valerio per digitalizzare l'attività e affiancare le risorse della tua azienda.",
    features: [
      "10 ore di coaching con Valerio Cattedra",
      "Definizione della strategia di digitalizzazione",
      "Affiancamento alle risorse interne",
      "Revisione processi, canali e priorità commerciali",
      "Roadmap esecutiva per web, social e automazioni",
      "Supporto decisionale per proprietà e management",
    ],
    highlighted: false,
  },
] as const;

const SECTORS = [
  "Barbieri",
  "Tatuatori",
  "Pizzerie",
  "Centri estetici",
  "Palestre",
  "Studi di Professionisti",
] as const;

const SERVICE_BY_SECTOR = [
  "Ogni area COCO viene declinata sul linguaggio, sulle urgenze e sui flussi commerciali del tuo settore.",
  "La proposta cambia in base a dimensione aziendale, risorse interne, città, obiettivi e maturità digitale.",
  "Prima analizziamo il contesto, poi ti indichiamo quali moduli attivare e in che ordine.",
] as const;

function PacchettiPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grain pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-5 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-20 text-center">
          <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
            Servizi COCO
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-medium leading-[0.95] tracking-tight text-balance">
            Niente listini standard. <span className="italic text-amber font-normal">Solo percorsi su misura.</span>
          </h1>
          <p className="mt-8 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
            Le aree COCO si combinano in base al tuo settore, alla struttura della tua azienda e agli obiettivi reali. Raccontaci cosa vuoi ottenere e ti rispondiamo con una proposta chiara.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/contatti">
              <Button variant="hero" size="xl">
                Richiedi informazioni <ArrowRight />
              </Button>
            </Link>
            <a href="https://follia.deskindustries.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="xl">
                Prova Foll.IA gratis <ExternalLink />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {SERVICES.map((service) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`relative p-8 lg:p-10 rounded-3xl border ${
                  service.highlighted
                    ? "border-amber bg-gradient-to-br from-surface-elevated to-surface shadow-amber"
                    : "border-border bg-surface-elevated"
                }`}
              >
                {service.highlighted && (
                  <div className="absolute -top-3 left-8 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber text-amber-foreground text-xs font-display font-semibold">
                    <Sparkles className="size-3" /> Su misura
                  </div>
                )}
                <h2 className="text-3xl font-display font-semibold">{service.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{service.tagline}</p>
                <p className="mt-5 text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                <ul className="mt-8 space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="size-4 text-amber mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contatti" className="block mt-10">
                  <Button variant={service.highlighted ? "amber" : "outline"} className="w-full" size="lg">
                    Chiedi informazioni su {service.name} <ArrowRight />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
                Per settore e azienda
              </p>
              <h2 className="text-3xl lg:text-5xl font-display font-medium tracking-tight text-balance">
                Lo stesso metodo, <span className="italic text-amber font-normal">declinato sul tuo contesto</span>.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {SECTORS.map((sector) => (
                  <div key={sector} className="rounded-2xl border border-border bg-background p-5 text-sm font-display font-semibold">
                    {sector}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {SERVICE_BY_SECTOR.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-border bg-background p-5 text-sm text-muted-foreground">
                    <Check className="size-4 text-amber mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 border-t border-border">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="rounded-3xl border border-amber/40 bg-gradient-to-br from-surface-elevated to-surface p-8 lg:p-12 text-center">
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
              Builder AI
            </p>
            <h2 className="text-3xl lg:text-5xl font-display font-medium tracking-tight text-balance">
              Prova gratis per 7 giorni il builder Foll.IA.
            </h2>
            <p className="mt-5 max-w-2xl mx-auto text-muted-foreground leading-relaxed">
              Se vuoi iniziare subito a costruire contenuti e asset digitali con l'AI, trovi la prova gratuita su follia.deskindustries.com.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="https://follia.deskindustries.com" target="_blank" rel="noopener noreferrer">
                <Button variant="amber" size="lg">
                  Apri Foll.IA <ExternalLink />
                </Button>
              </a>
              <Link to="/contatti">
                <Button variant="outline" size="lg">
                  Richiedi una proposta <ArrowRight />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
