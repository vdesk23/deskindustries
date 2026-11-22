import { BarChart3, Megaphone, Repeat, TrendingUp, Workflow } from "lucide-react";
import type { Question } from "./LandingForm";

export const CLICK_UP_QUESTIONS: Question[] = [
  {
    id: "Canali di vendita",
    label: "Dove vendi oggi?",
    options: ["Negozio fisico + sito e-commerce", "Solo e-commerce", "Social e marketplace", "Più punti vendita e online"],
  },
  {
    id: "Ostacolo principale",
    label: "Cosa ti blocca di più?",
    options: ["Poche visite al sito", "Tante visite, poche vendite", "Pubblicità che costa troppo", "Clienti che non riacquistano", "Troppo lavoro manuale"],
  },
  {
    id: "Obiettivo crescita",
    label: "Cosa vuoi ottenere nei prossimi mesi?",
    options: ["Aumentare le vendite online", "Abbassare il costo per cliente", "Far tornare i clienti", "Automatizzare ordini e processi"],
  },
];

export const CLICK_UP_LEVERS = [
  { Icon: Megaphone, t: "Traffico che converte", d: "Campagne e contenuti rivolti a chi è pronto a comprare, non a chi passa e basta." },
  { Icon: TrendingUp, t: "Conversione", d: "Schede prodotto, carrello e checkout rivisti per togliere attriti alla vendita." },
  { Icon: Repeat, t: "Riacquisto", d: "Email, carrelli abbandonati e fidelizzazione per far tornare chi ha già comprato." },
  { Icon: Workflow, t: "Automazioni", d: "Ordini, magazzino e comunicazioni collegati per liberare tempo al team." },
];

export const CLICK_UP_STEPS = [
  { n: "01", t: "Diagnosi", d: "Leggiamo i numeri del tuo negozio online: da dove arrivano i clienti, dove si fermano, cosa li fa tornare." },
  { n: "02", t: "Spinta", d: "Interveniamo sulle leve con più margine di crescita: campagne, conversione, riacquisto e automazioni." },
  { n: "03", t: "Scala", d: "Misuriamo ogni settimana, teniamo ciò che funziona e alziamo il ritmo. Cresciamo insieme a te." },
];

export const CLICK_UP_FAQ = [
  { q: "A chi serve Click Up?", a: "A chi vende già online, con un e-commerce, sui social o sui marketplace, e sente di aver raggiunto un tetto. Se parti da zero, il Digital Kit è il punto di partenza giusto." },
  { q: "Come funziona il modello con royalties?", a: "C’è una parte fissa per il lavoro di avvio e una parte legata ai risultati: se le tue vendite crescono, cresciamo anche noi. I dettagli li definiamo insieme nel preventivo." },
  { q: "Ci sono vincoli contrattuali?", a: "No. Come tutti i servizi Desk Industries, paghi a consumo con cadenza settimanale o mensile e puoi fermarti quando vuoi." },
  { q: "Dovete accedere ai miei strumenti?", a: "Per lavorare servirà un accesso ai canali concordati, ma mai nel modulo: lo organizziamo insieme in modo sicuro dopo la call, solo per ciò che serve." },
  { q: "Quanto tempo serve per vedere risultati?", a: "Dipende dal punto di partenza e dal mercato. Non promettiamo numeri a scatola chiusa: dopo la diagnosi ti diciamo cosa è realistico aspettarsi." },
  { q: "Fate anche la pubblicità?", a: "Sì, se serve. Click Up lavora sulle leve che pesano di più per te: a volte è la pubblicità, a volte la conversione o il riacquisto." },
];

export function GrowthVisual() {
  const bars = [28, 36, 34, 48, 56, 68, 82];
  return (
    <div role="img" aria-label="Le quattro leve di Click Up: traffico, conversione, riacquisto e automazioni, collegate a una curva di crescita illustrativa" className="lp-glow-card relative overflow-hidden rounded-3xl border border-border bg-surface-elevated/55 p-6 shadow-elevated backdrop-blur-xl sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.22em] text-amber">Le tue leve</p>
          <p className="mt-2 font-display text-xl font-medium tracking-tight">Dove si sblocca la crescita.</p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-amber/25 bg-amber-soft"><BarChart3 className="size-5 text-amber" /></span>
      </div>
      <div aria-hidden className="mt-6 flex h-24 items-end gap-2">
        {bars.map((h, i) => <div key={i} className="flex-1 rounded-t-lg bg-amber/70" style={{ height: `${h}%`, opacity: 0.35 + i * 0.09 }} />)}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {CLICK_UP_LEVERS.map(({ Icon, t }) => (
          <div key={t} className="flex items-center gap-3 rounded-2xl border border-border bg-background/35 p-3">
            <Icon className="size-5 shrink-0 text-amber" />
            <p className="font-display text-sm font-medium">{t}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Grafico illustrativo, non un risultato reale.</p>
    </div>
  );
}
