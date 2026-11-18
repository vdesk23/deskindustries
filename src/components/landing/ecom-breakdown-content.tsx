import { ArrowRight, BarChart3, MessagesSquare, PackageCheck, ShoppingBag, Store } from "lucide-react";
import type { Question } from "./LandingForm";

export const ECOM_BREAKDOWN_QUESTIONS: Question[] = [
  {
    id: "Situazione attuale",
    label: "Da che punto parti oggi?",
    options: ["Non vendo ancora online", "Ho un sito, ma non vende", "Vendo solo su social o marketplace", "Ho un e-commerce attivo", "Vendo su più canali"],
  },
  {
    id: "Categoria merceologica",
    label: "Cosa vendi o vorresti vendere?",
    options: ["Abbigliamento e accessori", "Food & beverage", "Casa e design", "Bellezza e benessere", "Artigianato", "Altro"],
  },
  {
    id: "Obiettivo analisi",
    label: "Cosa vuoi ottenere dal Breakdown?",
    options: ["Capire se l’online può funzionare per me", "Iniziare a vendere online", "Aumentare le vendite dell’e-commerce", "Collegare negozio e canali online"],
  },
];

export const ECOM_BREAKDOWN_STEPS = [
  { n: "01", t: "Raccolta", d: "Ci racconti da dove parti: solo negozio fisico, primi canali digitali oppure un e-commerce già attivo. Non servono competenze tecniche." },
  { n: "02", t: "Breakdown", d: "Se sei offline mettiamo a fuoco opportunità e possibili canali. Se vendi già online scomponiamo il percorso per trovare ciò che non funziona." },
  { n: "03", t: "Restituzione", d: "Ricevi il report e ne parliamo in call: cosa puoi ottenere, quali priorità valutare e da dove partire senza investire a caso." },
];

export const ECOM_BREAKDOWN_FAQ = [
  { q: "ECOM – Breakdown è davvero gratuito?", a: "Sì. Il report e la call di restituzione sono gratuiti. Non devi inserire metodi di pagamento e non ti impegni ad acquistare altri servizi." },
  { q: "Non vendo ancora online. Ha senso richiederlo?", a: "Sì, è uno dei casi per cui nasce. Partiamo dalla tua attività e dal tuo settore per capire quali opportunità puoi esplorare online, quali canali valutare e da dove iniziare." },
  { q: "Serve avere già un e-commerce?", a: "No. Se hai solo il negozio fisico analizziamo il tuo punto di partenza; se vendi già tramite sito, social o marketplace osserviamo come i canali lavorano insieme e dove puoi migliorare." },
  { q: "Che cosa contiene il report?", a: "La fotografia del tuo punto di partenza, le opportunità o i passaggi da osservare e le priorità emerse. Durante la call ti aiutiamo a leggere il documento e a valutare le prossime decisioni." },
  { q: "Devo condividere password o dati dei clienti?", a: "No, non nel modulo di richiesta. Ti chiediamo soltanto informazioni generali su attività, situazione attuale e obiettivi. Se serviranno dati aggregati per l’analisi, concorderemo insieme cosa è utile condividere." },
  { q: "Il report è un piano operativo completo?", a: "No: è una fotografia chiara del punto di partenza e delle priorità. Eventuali attività operative vengono valutate separatamente, solo se le ritieni utili per la tua attività." },
  { q: "Dopo la call devo acquistare un servizio?", a: "No. La restituzione serve a renderti utili l’analisi e le priorità. Non ci sono vincoli né obblighi di acquisto." },
];

const FLOW = [
  { Icon: Store, n: "01", t: "Attività", d: "Prodotti, clienti, know-how" },
  { Icon: ShoppingBag, n: "02", t: "Presenza", d: "Negozio, sito, social" },
  { Icon: PackageCheck, n: "03", t: "Vendita", d: "Opportunità e ordini" },
  { Icon: MessagesSquare, n: "04", t: "Direzione", d: "Priorità e prossimi passi" },
];

export function SalesFlowVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div role="img" aria-label="Mappa dal punto di partenza alle prossime decisioni: attività, presenza, vendita e direzione" className="lp-glow-card relative overflow-hidden rounded-3xl border border-border bg-surface-elevated/55 p-6 shadow-elevated backdrop-blur-xl sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.22em] text-amber">La tua mappa online</p>
          <p className="mt-2 font-display text-xl font-medium tracking-tight">Da dove sei a dove puoi arrivare.</p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-amber/25 bg-amber-soft"><BarChart3 className="size-5 text-amber" /></span>
      </div>
      <div className={`mt-8 grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
        {FLOW.map(({ Icon, n, t, d }, i) => (
          <div key={t} className="relative rounded-2xl border border-border bg-background/35 p-4">
            <div className="flex items-center justify-between">
              <Icon className="size-5 text-amber" />
              <span className="font-display text-xs text-muted-foreground">{n}</span>
            </div>
            <p className="mt-4 font-display font-medium">{t}</p>
            <p className="mt-1 text-xs text-muted-foreground">{d}</p>
            {i < FLOW.length - 1 && <ArrowRight aria-hidden className="absolute -right-3 top-1/2 z-10 hidden size-4 -translate-y-1/2 text-amber sm:block" />}
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-amber/20 bg-amber-soft p-4">
        <p className="text-sm leading-relaxed"><span className="font-display text-amber">Report + call.</span> <span className="text-muted-foreground">Per capire cosa osservare prima di decidere dove investire.</span></p>
      </div>
    </div>
  );
}
