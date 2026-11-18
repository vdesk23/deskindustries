import { ArrowRight, BarChart3, MessagesSquare, PackageCheck, ShoppingBag, Store } from "lucide-react";
import type { Question } from "./LandingForm";

export const ECOM_BREAKDOWN_QUESTIONS: Question[] = [
  {
    id: "Categoria merceologica",
    label: "Cosa vendi?",
    options: ["Abbigliamento e accessori", "Food & beverage", "Casa e design", "Bellezza e benessere", "Artigianato", "Altro"],
  },
  {
    id: "Canali di vendita",
    label: "Dove vendi oggi?",
    options: ["Solo negozio fisico", "E-commerce proprietario", "Social o marketplace", "Più canali insieme"],
  },
  {
    id: "Obiettivo analisi",
    label: "Cosa vuoi capire meglio?",
    options: ["Da dove arrivano gli ordini", "Dove si interrompe la vendita", "Come si muovono stock e logistica", "Dove investire per crescere"],
  },
];

export const ECOM_BREAKDOWN_STEPS = [
  { n: "01", t: "Raccolta", d: "Partiamo da come vendi oggi: canali, passaggi e punti che non riesci a leggere con chiarezza." },
  { n: "02", t: "Breakdown", d: "Scomponiamo il flusso di vendita e colleghiamo ciò che oggi vedi separato: contatto, ordine, consegna e ritorno." },
  { n: "03", t: "Restituzione", d: "Ricevi il report e ne parliamo in call: cosa osservare, quali priorità valutare e da dove puoi partire." },
];

export const ECOM_BREAKDOWN_FAQ = [
  { q: "ECOM – Breakdown è davvero gratuito?", a: "Sì. Il report sui flussi di vendita e la call di restituzione sono gratuiti. Non devi inserire metodi di pagamento e non ti impegni ad acquistare altri servizi." },
  { q: "Serve avere già un e-commerce?", a: "No. Possiamo partire dal solo negozio fisico oppure analizzare una vendita distribuita tra sito, social e marketplace. Il percorso si adatta ai canali che usi oggi." },
  { q: "Che cosa contiene il report?", a: "La mappa dei tuoi flussi di vendita, i passaggi da osservare e le priorità emerse. Durante la call ti aiutiamo a leggere il documento e a valutare le prossime decisioni." },
  { q: "Devo condividere password o dati dei clienti?", a: "No, non nel modulo di richiesta. Ti chiediamo soltanto informazioni generali su attività, canali e obiettivi. Se serviranno dati aggregati per l’analisi, concorderemo insieme cosa è utile condividere." },
  { q: "Il report è un piano operativo completo?", a: "No: è una fotografia chiara dei flussi e delle priorità. Eventuali attività operative vengono valutate separatamente, solo se le ritieni utili per la tua attività." },
  { q: "Dopo la call devo acquistare un servizio?", a: "No. La restituzione serve a renderti utili l’analisi e le priorità. Non ci sono vincoli né obblighi di acquisto." },
];

const FLOW = [
  { Icon: Store, n: "01", t: "Contatto", d: "Negozio, sito, social" },
  { Icon: ShoppingBag, n: "02", t: "Ordine", d: "Carrello e acquisto" },
  { Icon: PackageCheck, n: "03", t: "Evasione", d: "Stock e consegna" },
  { Icon: MessagesSquare, n: "04", t: "Relazione", d: "Assistenza e ritorno" },
];

export function SalesFlowVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div role="img" aria-label="Mappa del flusso di vendita: contatto, ordine, evasione e relazione con il cliente" className="lp-glow-card relative overflow-hidden rounded-3xl border border-border bg-surface-elevated/55 p-6 shadow-elevated backdrop-blur-xl sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.22em] text-amber">Mappa del flusso</p>
          <p className="mt-2 font-display text-xl font-medium tracking-tight">Ogni passaggio, finalmente collegato.</p>
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
