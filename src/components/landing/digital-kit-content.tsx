import { Check, Globe, MapPin, Rocket, Smartphone, Store } from "lucide-react";
import type { Question } from "./LandingForm";

export const DIGITAL_KIT_QUESTIONS: Question[] = [
  {
    id: "Presenza attuale",
    label: "Cosa hai già online oggi?",
    options: ["Niente, parto da zero", "Solo una pagina social", "Scheda Google ma niente sito", "Un sito vecchio da rifare"],
  },
  {
    id: "Categoria merceologica",
    label: "Che attività hai?",
    options: ["Abbigliamento e accessori", "Food & beverage", "Casa e design", "Bellezza e benessere", "Artigianato", "Servizi alla persona", "Altro"],
  },
  {
    id: "Obiettivo kit",
    label: "Cosa vuoi ottenere per primo?",
    options: ["Farmi trovare su Google", "Mostrare prodotti e servizi", "Ricevere richieste e prenotazioni", "Iniziare a vendere online"],
  },
];

export const DIGITAL_KIT_INCLUDES = [
  { Icon: MapPin, t: "Scheda Google curata", d: "Orari, foto, categoria e recensioni: il primo posto dove i clienti ti cercano." },
  { Icon: Globe, t: "Sito essenziale", d: "Chi sei, cosa offri, dove trovarti e come contattarti. Veloce, chiaro, tuo." },
  { Icon: Smartphone, t: "Profili social pronti", d: "Pagine impostate in modo coerente, con i primi contenuti per partire." },
  { Icon: Store, t: "Primi passi di vendita", d: "Richieste, prenotazioni o un primo catalogo: in base a cosa serve davvero a te." },
];

export const DIGITAL_KIT_STEPS = [
  { n: "01", t: "Fotografia", d: "Ci racconti l’attività, i clienti e cosa hai già. Non servono competenze tecniche: le domande le facciamo noi." },
  { n: "02", t: "Montaggio", d: "Prepariamo scheda Google, sito e profili con un’unica identità, usando testi e foto della tua attività." },
  { n: "03", t: "Accensione", d: "Ti consegniamo tutto online e ti mostriamo come aggiornarlo. Da lì decidi tu se e come crescere." },
];

export const DIGITAL_KIT_FAQ = [
  { q: "Non so niente di digitale. Posso farlo lo stesso?", a: "Sì, il Digital Kit nasce proprio per chi parte da zero. Ti guidiamo noi passo per passo e ti spieghiamo solo quello che ti serve per gestire la tua presenza." },
  { q: "Cosa comprende esattamente il kit?", a: "Scheda Google, sito essenziale, profili social e un primo strumento per ricevere richieste o vendere. In call definiamo insieme cosa serve davvero alla tua attività, senza aggiungere ciò che non usi." },
  { q: "Quanto costa?", a: "È il nostro pacchetto d’ingresso, pensato per un investimento contenuto. Ti mandiamo il preventivo dopo la call, quando sappiamo cosa ti serve." },
  { q: "Ci sono vincoli o canoni bloccati?", a: "No. Come tutti i servizi Desk Industries non ci sono vincoli contrattuali: paghi ciò che usi e decidi tu se proseguire." },
  { q: "Devo fornire io foto e testi?", a: "Ci basta ciò che hai: foto del negozio, prodotti, qualche informazione. Ti aiutiamo noi a trasformarli in contenuti chiari." },
  { q: "E se poi voglio vendere di più?", a: "Il kit è la base. Quando sei pronto puoi passare a servizi di crescita come Click Up, senza ricominciare da capo." },
];

export function KitVisual() {
  return (
    <div role="img" aria-label="Il Digital Kit: scheda Google, sito, social e primi passi di vendita collegati in un'unica presenza online" className="lp-glow-card relative overflow-hidden rounded-3xl border border-border bg-surface-elevated/55 p-6 shadow-elevated backdrop-blur-xl sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.22em] text-amber">Il tuo kit</p>
          <p className="mt-2 font-display text-xl font-medium tracking-tight">Tutto ciò che serve per esserci.</p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-amber/25 bg-amber-soft"><Rocket className="size-5 text-amber" /></span>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {DIGITAL_KIT_INCLUDES.map(({ Icon, t }) => (
          <div key={t} className="flex items-center gap-3 rounded-2xl border border-border bg-background/35 p-4">
            <Icon className="size-5 shrink-0 text-amber" />
            <p className="font-display text-sm font-medium">{t}</p>
            <Check className="ml-auto size-4 text-amber/70" />
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-amber/20 bg-amber-soft p-4">
        <p className="text-sm leading-relaxed"><span className="font-display text-amber">Un’unica identità.</span> <span className="text-muted-foreground">Stesso nome, stessi colori, stesse informazioni ovunque ti cerchino.</span></p>
      </div>
    </div>
  );
}
