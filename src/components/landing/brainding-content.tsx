import { Palette, PenTool, ShoppingBag, Sparkles, Tag } from "lucide-react";
import type { Question } from "./LandingForm";

export const BRAINDING_QUESTIONS: Question[] = [
  {
    id: "Situazione brand",
    label: "A che punto è la tua identità visiva?",
    options: ["Sto aprendo una nuova attività", "Ho un logo ma non mi rappresenta più", "Ogni materiale ha uno stile diverso", "Voglio un restyling completo"],
  },
  {
    id: "Materiali necessari",
    label: "Cosa ti serve?",
    options: ["Logo e colori", "Shopper e packaging", "Insegna e allestimento", "Etichette e cartellini", "Identità completa"],
  },
  {
    id: "Obiettivo branding",
    label: "Cosa vuoi ottenere?",
    options: ["Essere riconoscibile", "Sembrare più professionale", "Alzare il valore percepito", "Preparare un franchising"],
  },
];

export const BRAINDING_DELIVERABLES = [
  { Icon: PenTool, t: "Logo e marchio", d: "Un segno chiaro e memorabile, pensato per insegna, social e packaging." },
  { Icon: Palette, t: "Colori e caratteri", d: "Una palette e una tipografia che rendono riconoscibile ogni tuo materiale." },
  { Icon: ShoppingBag, t: "Shopper e packaging", d: "Il tuo marchio esce dal negozio con il cliente e diventa pubblicità." },
  { Icon: Tag, t: "Etichette e cartellini", d: "Dettagli coordinati che alzano il valore percepito dei prodotti." },
];

export const BRAINDING_STEPS = [
  { n: "01", t: "Ascolto", d: "Conosciamo la tua attività, i clienti, i valori e i concorrenti. Capiamo cosa ti rende diverso." },
  { n: "02", t: "Disegno", d: "Creiamo logo, colori e caratteri, poi li proviamo su shopper, insegna, social e cartellini." },
  { n: "03", t: "Consegna", d: "Ricevi i file pronti per la stampa e una guida semplice per usare il brand sempre nello stesso modo." },
];

export const BRAINDING_FAQ = [
  { q: "Ho già un logo. Devo buttarlo?", a: "Non per forza. Valutiamo insieme se basta un aggiornamento o se serve un’identità nuova, partendo da ciò che i tuoi clienti già riconoscono." },
  { q: "Cosa ricevo alla fine?", a: "I file del logo in tutti i formati, palette, caratteri, le applicazioni concordate (shopper, etichette, social…) e una guida per usarli correttamente." },
  { q: "Vi occupate anche della stampa?", a: "Ti consegniamo i file pronti e possiamo coordinare noi i fornitori di stampa, se preferisci." },
  { q: "Il marchio è di mia proprietà?", a: "Sì, i file finali sono tuoi. Ti consigliamo anche come valutare la registrazione del marchio con un professionista." },
  { q: "Ci sono vincoli contrattuali?", a: "No. Paghi l’effort consumato, con cadenza settimanale o mensile, senza vincoli." },
  { q: "Quanto costa?", a: "Dipende da quanti materiali servono. Ti inviamo un preventivo dopo la call, quando conosciamo la tua attività." },
];

export function BrandVisual() {
  return (
    <div role="img" aria-label="Il kit di identità BrainDing: logo, colori, shopper e cartellini coordinati" className="lp-glow-card relative overflow-hidden rounded-3xl border border-border bg-surface-elevated/55 p-6 shadow-elevated backdrop-blur-xl sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.22em] text-amber">La tua identità</p>
          <p className="mt-2 font-display text-xl font-medium tracking-tight">Riconoscibile ovunque.</p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-amber/25 bg-amber-soft"><Sparkles className="size-5 text-amber" /></span>
      </div>
      <div aria-hidden className="mt-6 flex gap-2">
        {["bg-amber", "bg-amber/70", "bg-amber/40", "bg-foreground/80", "bg-muted"].map((c) => <div key={c} className={`h-10 flex-1 rounded-xl ${c}`} />)}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {BRAINDING_DELIVERABLES.map(({ Icon, t }) => (
          <div key={t} className="flex items-center gap-3 rounded-2xl border border-border bg-background/35 p-3">
            <Icon className="size-5 shrink-0 text-amber" />
            <p className="font-display text-sm font-medium">{t}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-amber/20 bg-amber-soft p-4">
        <p className="text-sm leading-relaxed"><span className="font-display text-amber">Un solo linguaggio.</span> <span className="text-muted-foreground">Dall’insegna al sacchetto, il cliente ti riconosce.</span></p>
      </div>
    </div>
  );
}
