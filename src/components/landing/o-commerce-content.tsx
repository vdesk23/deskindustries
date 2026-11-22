import { Boxes, Network, ShoppingCart, Store, Truck } from "lucide-react";
import type { Question } from "./LandingForm";

export const O_COMMERCE_QUESTIONS: Question[] = [
  {
    id: "Rete punti vendita",
    label: "Quanti punti vendita gestisci?",
    options: ["2–5 negozi", "6–20 negozi", "Oltre 20 negozi", "Sto aprendo un franchising"],
  },
  {
    id: "Modello rete",
    label: "Com’è organizzata la tua rete?",
    options: ["Negozi di proprietà", "Franchising", "Mista: proprietà e affiliati", "Corner e rivenditori"],
  },
  {
    id: "Priorità omnicanale",
    label: "Cosa vuoi risolvere per primo?",
    options: ["Unire cassa e magazzino online", "Ordini online con ritiro in negozio", "Visione unica di vendite e scorte", "Coordinare gli affiliati"],
  },
];

export const O_COMMERCE_PILLARS = [
  { Icon: Store, t: "Negozi e online uniti", d: "Cassa, sito e marketplace parlano la stessa lingua: un solo catalogo, un solo cliente." },
  { Icon: Boxes, t: "Scorte in tempo reale", d: "Disponibilità aggiornata su tutti i punti vendita e sul sito, senza fogli di calcolo." },
  { Icon: Truck, t: "Ritiro e spedizioni", d: "Compra online e ritira in negozio, o spedisci dal punto vendita più vicino." },
  { Icon: Network, t: "Rete coordinata", d: "Prezzi, promozioni e comunicazione coerenti tra sede e affiliati." },
];

export const O_COMMERCE_STEPS = [
  { n: "01", t: "Mappatura", d: "Analizziamo come lavorano oggi sede, negozi e canali online: strumenti, flussi di ordini e scorte." },
  { n: "02", t: "Integrazione", d: "Colleghiamo cassa, magazzino, sito e marketplace in un unico sistema, con automazioni dove servono." },
  { n: "03", t: "Regia", d: "Attiviamo la rete per gradi, formiamo il personale e affianchiamo la sede nella gestione quotidiana." },
];

export const O_COMMERCE_FAQ = [
  { q: "A chi è rivolto O-Commerce?", a: "A catene di negozi, reti in franchising e attività con più punti vendita che vogliono gestire negozi e online come un unico sistema." },
  { q: "Dobbiamo cambiare tutti i nostri strumenti?", a: "Non per forza. Partiamo da ciò che usate già e valutiamo insieme cosa collegare, cosa sostituire e cosa lasciare com’è." },
  { q: "Come funziona con gli affiliati?", a: "Definiamo regole chiare per catalogo, prezzi, promozioni e ordini, così sede e affiliati lavorano in modo coordinato senza perdere autonomia." },
  { q: "Dovete accedere ai nostri gestionali?", a: "Per l’integrazione serviranno accessi concordati, mai nel modulo: li organizziamo insieme in modo sicuro dopo la call." },
  { q: "Ci sono vincoli contrattuali?", a: "No. Anche nei progetti più ampi paghi l’effort consumato, con cadenza settimanale o mensile, e mantieni la libertà di fermarti." },
  { q: "Quanto costa un progetto O-Commerce?", a: "Dipende da numero di punti vendita, strumenti e integrazioni. Ti inviamo un preventivo dopo la mappatura iniziale." },
];

export function OmniVisual() {
  return (
    <div role="img" aria-label="Schema O-Commerce: negozi, sito, marketplace e magazzino collegati a un'unica regia centrale" className="lp-glow-card relative overflow-hidden rounded-3xl border border-border bg-surface-elevated/55 p-6 shadow-elevated backdrop-blur-xl sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.22em] text-amber">Una sola regia</p>
          <p className="mt-2 font-display text-xl font-medium tracking-tight">Tutti i canali, un unico sistema.</p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-amber/25 bg-amber-soft"><Network className="size-5 text-amber" /></span>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {[{ I: Store, t: "Negozi" }, { I: ShoppingCart, t: "Sito e-commerce" }, { I: Network, t: "Marketplace" }, { I: Boxes, t: "Magazzino" }].map(({ I, t }) => (
          <div key={t} className="flex items-center gap-3 rounded-2xl border border-border bg-background/35 p-3">
            <I className="size-5 shrink-0 text-amber" />
            <p className="font-display text-sm font-medium">{t}</p>
          </div>
        ))}
      </div>
      <div className="mx-auto my-3 h-6 w-px bg-amber/50" aria-hidden />
      <div className="rounded-2xl border border-amber/30 bg-amber-soft p-4 text-center">
        <p className="font-display text-sm text-amber">Regia centrale</p>
        <p className="mt-1 text-xs text-muted-foreground">Catalogo, scorte, ordini e clienti in un unico posto</p>
      </div>
    </div>
  );
}
