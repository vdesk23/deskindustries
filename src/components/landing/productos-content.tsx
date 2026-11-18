import type { Question } from "./LandingForm";

export { GoogleBadge } from "./GoogleBadge";

export const PRODUCTOS_QUESTIONS: Question[] = [
  { id: "Categoria negozio", label: "Che tipo di negozio hai?", options: ["Abbigliamento e accessori", "Food & beverage", "Casa e design", "Bellezza e benessere", "Artigianato", "Altro"] },
  { id: "Fatturato annuo", label: "Fatturato annuo indicativo", options: ["Meno di 100k €", "100k – 500k €", "500k – 1M €", "Oltre 1M €"] },
  { id: "E-commerce", label: "Vendi già online?", options: ["No, solo in negozio", "Sì, con un e-commerce", "Solo social / marketplace"] },
];

export const METHOD_NAME = "Product-OSystem ";
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
