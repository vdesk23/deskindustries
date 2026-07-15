import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Scissors,
  Pizza,
  Dumbbell,
  Syringe,
  Flower2,
  BriefcaseBusiness,
  Check,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComingSoon } from "@/components/ComingSoon";

interface SectorData {
  label: string;
  Icon: LucideIcon;
  hero: string;
  tagline: string;
  problems: string[];
  solutions: { title: string; desc: string }[];
  results: { metric: string; label: string }[];
}

const SECTORS: Record<string, SectorData> = {
  barbieri: {
    label: "Barbieri",
    Icon: Scissors,
    hero: "Riempi la sedia tutti i giorni.",
    tagline:
      "Il barbiere non vende un taglio: vende un appuntamento fisso. Ti aiutiamo a far ritornare i clienti — e a farne arrivare di nuovi.",
    problems: [
      "Buchi nell'agenda nei giorni feriali",
      "Difficoltà a farsi trovare su Google",
      "Clienti che provano e non tornano",
      "Concorrenza locale che cresce ogni mese",
    ],
    solutions: [
      {
        title: "Prenotazioni online 24/7",
        desc: "Sistema integrato con Google e Instagram, con promemoria automatici via WhatsApp.",
      },
      {
        title: "Contenuti che mostrano il tuo stile",
        desc: "Reels prima/dopo, transizioni e storytelling per posizionarti come il barbiere di riferimento in zona.",
      },
      {
        title: "Recensioni e Google My Business",
        desc: "Strategia di richiesta recensioni e ottimizzazione della scheda per dominare le ricerche locali.",
      },
      {
        title: "Programmi fedeltà digitali",
        desc: "Card digitali, sconti per il decimo taglio, automazioni di richiamo per chi non torna da 45 giorni.",
      },
    ],
    results: [
      { metric: "+40%", label: "Tasso di riprenotazione" },
      { metric: "5★", label: "Reputazione Google" },
      { metric: "0", label: "Buchi in agenda" },
    ],
  },
  tatuatori: {
    label: "Tatuatori",
    Icon: Syringe,
    hero: "Mostra la tua arte, riempi la tua agenda.",
    tagline:
      "Il portfolio è tutto. Lo trasformiamo in un sistema che attira clienti in linea con il tuo stile e prenota lo studio per mesi.",
    problems: [
      "Richieste fuori dal tuo stile artistico",
      "Tempo sprecato in DM Instagram a rispondere alle stesse domande",
      "Difficoltà a farti pagare la caparra",
      "Mancanza di un sito che mostri davvero il portfolio",
    ],
    solutions: [
      {
        title: "Portfolio site su misura",
        desc: "Sito veloce, scuro, ottimizzato per le immagini. Filtri per stile, gallery cinematografiche.",
      },
      {
        title: "Form di contatto qualificato",
        desc: "Le persone giuste compilano, le altre vengono filtrate prima di arrivare al tuo Instagram.",
      },
      {
        title: "Caparra automatica",
        desc: "Pagamento online della caparra al momento della prenotazione. Niente più no-show.",
      },
      {
        title: "SEO + contenuti tematici",
        desc: 'Posizionamento per "tatuatore [stile] [città]" con articoli, video processo e timelapse.',
      },
    ],
    results: [
      { metric: "3 mesi", label: "Agenda piena in anticipo" },
      { metric: "-80%", label: "DM da rispondere a mano" },
      { metric: "100%", label: "Caparre incassate prima" },
    ],
  },
  pizzerie: {
    label: "Pizzerie",
    Icon: Pizza,
    hero: "Più clienti in sala. E a domicilio.",
    tagline:
      "La pizza è buona, lo sai tu. Facciamo in modo che lo sappia anche il quartiere — e tutta la città.",
    problems: [
      "Sala vuota dal lunedì al giovedì",
      "Dipendenza dalle commissioni dei delivery",
      "Difficoltà a comunicare le offerte",
      "Concorrenza con catene e franchising",
    ],
    solutions: [
      {
        title: "Prenotazioni dirette dal sito",
        desc: "Niente più TheFork: il cliente prenota da te, paghi 0 di commissione.",
      },
      {
        title: "Menu digitale ottimizzato",
        desc: "Menu QR code con foto pro, allergeni, lingue multiple. Anche per asporto.",
      },
      {
        title: "Campagne geolocalizzate",
        desc: "Annunci mirati nel raggio del tuo locale, con offerte dedicate alle serate vuote.",
      },
      {
        title: "Asporto e delivery diretto",
        desc: "Sistema di ordinazione sul tuo sito, integrato con WhatsApp e gestionale di cassa.",
      },
    ],
    results: [
      { metric: "+60%", label: "Coperti il martedì" },
      { metric: "-30%", label: "Commissioni delivery" },
      { metric: "+25%", label: "Scontrino medio" },
    ],
  },
  "centri-estetici": {
    label: "Centri estetici",
    Icon: Flower2,
    hero: "Costruisci una clientela fidelizzata.",
    tagline:
      "L'estetica vive di abbonamenti, pacchetti e ritorni. Costruiamo il sistema che li genera in automatico.",
    problems: [
      "Clienti che provano un trattamento e non tornano",
      "Difficoltà a vendere pacchetti completi",
      "Agende difficili da gestire tra più operatrici",
      "Comunicazione visiva poco professionale",
    ],
    solutions: [
      {
        title: "Sito + booking multi-operatrice",
        desc: "Prenotazione online che gestisce calendario, durata trattamento e operatrice scelta.",
      },
      {
        title: "Email & SMS marketing",
        desc: "Campagne di richiamo, compleanno, promozioni stagionali. Tutto automatizzato.",
      },
      {
        title: "Contenuti social premium",
        desc: "Foto e video curati che comunicano cura, professionalità e risultati visibili.",
      },
      {
        title: "Pacchetti e gift card digitali",
        desc: "Vendita online di abbonamenti e gift card. Il cliente paga subito, fissa dopo.",
      },
    ],
    results: [
      { metric: "+50%", label: "Vendita pacchetti" },
      { metric: "70%", label: "Tasso di ritorno cliente" },
      { metric: "+3x", label: "Gift card vendute" },
    ],
  },
  palestre: {
    label: "Palestre",
    Icon: Dumbbell,
    hero: "Acquisisci nuovi iscritti ogni mese.",
    tagline:
      "Una palestra che non cresce, muore. Costruiamo un flusso costante e prevedibile di nuovi iscritti.",
    problems: [
      "Nuove iscrizioni stagionali e imprevedibili",
      "Tassi di abbandono alti dopo 3 mesi",
      "Difficoltà a vendere personal training",
      "Concorrenza con palestre low-cost",
    ],
    solutions: [
      {
        title: "Funnel di acquisizione iscritti",
        desc: "Lead magnet (prova gratuita, consulenza), landing page e nurturing fino alla firma.",
      },
      {
        title: "Community e contenuti motivazionali",
        desc: "Reels trasformazioni, allenamenti settimanali, storytelling dei trainer.",
      },
      {
        title: "Onboarding nuovo iscritto",
        desc: "Sequenza email automatizzata nei primi 30 giorni per ridurre il drop-off.",
      },
      {
        title: "Upsell PT e corsi premium",
        desc: "Sistema di vendita di pacchetti personal training, corsi e integratori al cliente già attivo.",
      },
    ],
    results: [
      { metric: "+30", label: "Nuovi iscritti / mese" },
      { metric: "-40%", label: "Tasso di abbandono" },
      { metric: "+25%", label: "Vendite PT" },
    ],
  },
  "studi-professionisti": {
    label: "Studi di Professionisti",
    Icon: BriefcaseBusiness,
    hero: "Digitalizza il tuo studio senza perdere autorevolezza.",
    tagline:
      "Avvocati, Commercialisti e Consulenti del Lavoro hanno bisogno di fiducia, chiarezza e processi. Costruiamo una presenza digitale sobria, compliant e orientata alla relazione.",
    problems: [
      "Sito istituzionale datato o poco chiaro",
      "Difficoltà a comunicare competenze specialistiche",
      "Richieste non qualificate che consumano tempo",
      "Processi manuali tra email, documenti e appuntamenti",
    ],
    solutions: [
      {
        title: "Coco Web per studi professionali",
        desc: "Sito autorevole, architettura dei servizi, SEO/AIO e integrazione con strumenti Google per farti trovare in modo credibile.",
      },
      {
        title: "Compliance e contenuti istituzionali",
        desc: "Privacy, cookie, termini e contenuti sensibili impostati con attenzione, anche tramite supporto legale specializzato.",
      },
      {
        title: "Coco Social sobrio e professionale",
        desc: "Piano editoriale per spiegare temi complessi, rafforzare reputazione e mantenere continuità senza toni promozionali eccessivi.",
      },
      {
        title: "Automazioni per richieste e appuntamenti",
        desc: "Form qualificati, reminder, raccolta documenti e flussi operativi per alleggerire segreteria e professionisti.",
      },
    ],
    results: [
      { metric: "+qualità", label: "Richieste più pertinenti" },
      { metric: "-tempo", label: "Gestione manuale" },
      { metric: "+fiducia", label: "Percezione professionale" },
    ],
  },
};

export const Route = createFileRoute("/settori/$slug")({
  loader: ({ params }) => {
    const sector = SECTORS[params.slug];
    if (!sector) throw notFound();
    return { sector };
  },
  head: ({ loaderData, params }) => ({
    meta: loaderData
      ? [
          { title: `Marketing per ${loaderData.sector.label} — Desk Industries` },
          { name: "description", content: loaderData.sector.tagline },
          { property: "og:title", content: `Marketing per ${loaderData.sector.label}` },
          { property: "og:description", content: loaderData.sector.tagline },
        ]
      : [],
    links: loaderData
      ? [{ rel: "canonical", href: `https://deskindustries.lovable.app/settori/${params.slug}` }]
      : [],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              name: `Marketing per ${loaderData.sector.label}`,
              description: loaderData.sector.tagline,
              provider: { "@type": "Organization", name: "Desk Industries" },
              areaServed: "IT",
              url: `https://deskindustries.lovable.app/settori/${params.slug}`,
            }),
          },
        ]
      : [],
  }),
  component: SectorPage,
  notFoundComponent: () => (
    <ComingSoon eyebrow="404" title="Settore non trovato" description="Torna ai settori." />
  ),
});

function SectorPage() {
  const { sector } = Route.useLoaderData();
  const { Icon } = sector;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grain pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-20 pb-20 lg:pt-28 lg:pb-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-amber-soft flex items-center justify-center">
              <Icon className="size-5 text-amber" />
            </div>
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase">
              Settore — {sector.label}
            </p>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-medium leading-[0.95] tracking-tight text-balance max-w-4xl">
            {sector.hero}
          </h1>
          <p className="mt-8 max-w-2xl text-lg lg:text-xl text-muted-foreground leading-relaxed">
            {sector.tagline}
          </p>
        </div>
      </section>

      {/* PROBLEMI */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
              I problemi
            </p>
            <h2 className="text-3xl lg:text-5xl font-display font-medium tracking-tight text-balance">
              Quello che ci dicono{" "}
              <span className="italic text-amber font-normal">tutti i giorni</span>.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {sector.problems.map((p: string, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="p-5 rounded-2xl border border-border bg-surface-elevated flex items-start gap-3"
              >
                <span className="text-amber font-display text-xl leading-none mt-0.5">×</span>
                <span className="text-foreground">{p}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUZIONI */}
      <section className="py-20 lg:py-28 border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
              Le nostre soluzioni
            </p>
            <h2 className="text-3xl lg:text-5xl font-display font-medium tracking-tight text-balance">
              Come risolviamo questi problemi{" "}
              <span className="italic text-amber font-normal">per te</span>.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {sector.solutions.map((s: { title: string; desc: string }, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-7 rounded-2xl border border-border bg-background hover:border-amber/50 transition-colors"
              >
                <Check className="size-6 text-amber mb-4" />
                <h3 className="text-xl font-display font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* RISULTATI */}
      <section className="py-20 lg:py-28 border-t border-border">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
              Risultati medi
            </p>
            <h2 className="text-3xl lg:text-5xl font-display font-medium tracking-tight text-balance">
              Quello che puoi aspettarti
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
            {sector.results.map((r: { metric: string; label: string }) => (
              <div
                key={r.label}
                className="p-8 rounded-3xl border border-border bg-surface-elevated text-center"
              >
                <div className="text-5xl lg:text-6xl font-display font-medium text-amber">
                  {r.metric}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 lg:py-32 border-t border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-display font-medium tracking-tight text-balance">
            Pronto per la{" "}
            <span className="italic text-amber font-normal">tua attività</span>?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Prenota una call gratuita: ti diciamo se possiamo davvero aiutarti.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/contatti">
              <Button variant="hero" size="xl">
                Prenota una call <ArrowRight />
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
