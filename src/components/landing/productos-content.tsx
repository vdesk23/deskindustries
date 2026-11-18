import { Star } from "lucide-react";
import { DESK_GOOGLE_PLACE, DESK_GOOGLE_REVIEWS } from "@/lib/google-reviews-data";
import type { Question } from "./LandingForm";

export const PRODUCTOS_QUESTIONS: Question[] = [
  { id: "Categoria negozio", label: "Che tipo di negozio hai?", options: ["Abbigliamento e accessori", "Food & beverage", "Casa e design", "Bellezza e benessere", "Artigianato", "Altro"] },
  { id: "Fatturato annuo", label: "Fatturato annuo indicativo", options: ["Meno di 100k €", "100k – 500k €", "500k – 1M €", "Oltre 1M €"] },
  { id: "E-commerce", label: "Vendi già online?", options: ["No, solo in negozio", "Sì, con un e-commerce", "Solo social / marketplace"] },
];

export const METHOD_NAME = "ProductOS Loop";
export const METHOD_STEPS = [
  { n: "01", t: "Ricerca", d: "Analizziamo il tuo know-how, i tuoi clienti e il mercato. Troviamo cosa sai fare che può diventare digitale." },
  { n: "02", t: "Strategia", d: "Scegliamo il prodotto giusto (corso, app, abbonamento, kit), il prezzo e il modo di venderlo." },
  { n: "03", t: "Lancio", d: "Lo costruiamo, lo mettiamo online e portiamo i primi clienti. Poi lo facciamo crescere." },
];

export const PRODUCTOS_FAQ = [
  { q: "Il mio negozio può davvero avere un prodotto digitale?", a: "Quasi sempre sì. Ogni negozio ha competenze, clienti fedeli e un modo unico di lavorare: sono la base di un prodotto digitale. Il nostro lavoro è trovarlo." },
  { q: "Non sono pratico di tecnologia. È un problema?", a: "No. Ti accompagniamo passo per passo e ci occupiamo noi di tutta la parte tecnica. A te chiediamo solo di raccontarci il tuo lavoro." },
  { q: "Quanto tempo serve?", a: "La fase di ricerca e strategia si chiude in poche settimane. I tempi di lancio dipendono dal prodotto scelto e te li diciamo prima di partire." },
  { q: "Come funzionano le royalties?", a: "Oltre al setup iniziale, condividiamo una piccola parte dei ricavi generati dal prodotto. Così guadagniamo solo se guadagni anche tu." },
  { q: "Devo firmare un contratto lungo?", a: "No. Come per tutti i servizi Desk Industries, non ci sono vincoli contrattuali di lunga durata." },
  { q: "La prima call è a pagamento?", a: "No. La prima call è gratuita e serve a capire se il tuo negozio è pronto per un prodotto digitale." },
];

export function GoogleBadge() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-amber text-amber" />)}</div>
      <span className="font-display font-medium">{DESK_GOOGLE_PLACE.rating.toFixed(1)}</span>
      <span className="text-muted-foreground">su Google · {DESK_GOOGLE_PLACE.total} recensioni</span>
    </div>
  );
}

export function Testimonials({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {DESK_GOOGLE_REVIEWS.slice(0, count).map((r) => (
        <figure key={r.author} className="rounded-2xl border border-border bg-surface-elevated/50 backdrop-blur-xl p-6">
          <div className="flex mb-3">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="size-3.5 fill-amber text-amber" />)}</div>
          <blockquote className="text-sm leading-relaxed text-foreground/90">“{r.text}”</blockquote>
          <figcaption className="mt-4 text-xs text-muted-foreground">
            <span className="font-display text-foreground">{r.author}</span> · {r.relativeTime} ·{" "}
            <a href={DESK_GOOGLE_PLACE.url} target="_blank" rel="noopener noreferrer" className="text-amber hover:underline">Google</a>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
