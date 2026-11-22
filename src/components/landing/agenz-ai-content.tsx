import { Camera, Clapperboard, ImageIcon, Megaphone, Sparkles } from "lucide-react";
import type { Question } from "./LandingForm";

export const AGENZ_AI_QUESTIONS: Question[] = [
  {
    id: "Contenuti necessari",
    label: "Di quali contenuti hai bisogno?",
    options: ["Foto prodotto", "Video promo e reel", "Creatività per pubblicità", "Campagne stagionali", "Un po’ di tutto"],
  },
  {
    id: "Come li produci oggi",
    label: "Come li realizzi oggi?",
    options: ["Non li realizzo", "Li faccio da solo con il telefono", "Mi affido a fotografi o videomaker", "Ho un’agenzia"],
  },
  {
    id: "Frequenza",
    label: "Ogni quanto ti servono nuovi contenuti?",
    options: ["Ogni settimana", "Ogni mese", "Per lanci e stagioni", "Non lo so ancora"],
  },
];

export const AGENZ_AI_OUTPUTS = [
  { Icon: Camera, t: "Shooting prodotto", d: "Foto realistiche dei tuoi prodotti in ambienti, stagioni e stili diversi." },
  { Icon: Clapperboard, t: "Video e reel", d: "Promo brevi per social e campagne, senza giornate di riprese." },
  { Icon: Megaphone, t: "Creatività ads", d: "Varianti pronte da testare nelle campagne, con il tuo stile." },
  { Icon: ImageIcon, t: "Campagne stagionali", d: "Saldi, festività, nuove collezioni: visual pronti quando servono." },
];

export const AGENZ_AI_STEPS = [
  { n: "01", t: "Brief", d: "Ci mandi foto base dei prodotti e ci racconti stile, pubblico e obiettivi. Bastano le foto del telefono." },
  { n: "02", t: "Generazione", d: "Creiamo foto, video e creatività con l’AI, curando ogni dettaglio perché restino fedeli al prodotto reale." },
  { n: "03", t: "Consegna", d: "Ricevi i contenuti pronti per social, sito e pubblicità. Chiedi le modifiche, le facciamo noi." },
];

export const AGENZ_AI_FAQ = [
  { q: "I contenuti sembrano finti?", a: "Lavoriamo perché siano realistici e fedeli al prodotto: ogni contenuto viene controllato e rifinito a mano prima della consegna." },
  { q: "Cosa devo mandarvi?", a: "Poche foto dei prodotti, anche fatte con il telefono, e qualche indicazione su stile e pubblico. Al resto pensiamo noi." },
  { q: "Il prodotto viene modificato dall’AI?", a: "No: l’obiettivo è mostrarlo com’è davvero, cambiando ambientazione, luce e contesto. Non usiamo contenuti che ingannano il cliente sul prodotto." },
  { q: "Posso usare i contenuti nelle pubblicità?", a: "Sì, sono pensati per social, sito e campagne. Ti indichiamo come usarli nel rispetto delle regole delle piattaforme." },
  { q: "Ci sono vincoli o abbonamenti bloccati?", a: "No. Paghi i contenuti che ti servono, con cadenza settimanale o mensile, e ti fermi quando vuoi." },
  { q: "Quanto costa?", a: "Dipende da quantità e tipo di contenuti. Ti inviamo un preventivo dopo la call, quando sappiamo cosa ti serve." },
];

export function StudioVisual() {
  return (
    <div role="img" aria-label="Lo studio Agenz.AI: da una foto del prodotto a shooting, video, creatività ads e campagne stagionali" className="lp-glow-card relative overflow-hidden rounded-3xl border border-border bg-surface-elevated/55 p-6 shadow-elevated backdrop-blur-xl sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.22em] text-amber">Il tuo studio AI</p>
          <p className="mt-2 font-display text-xl font-medium tracking-tight">Una foto. Infinite creatività.</p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-amber/25 bg-amber-soft"><Sparkles className="size-5 text-amber" /></span>
      </div>
      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-amber/40 bg-background/35 p-4">
        <Camera className="size-5 text-amber" />
        <p className="text-sm text-muted-foreground">La foto del tuo prodotto, anche dal telefono</p>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {AGENZ_AI_OUTPUTS.map(({ Icon, t }) => (
          <div key={t} className="flex items-center gap-3 rounded-2xl border border-border bg-background/35 p-3">
            <Icon className="size-5 shrink-0 text-amber" />
            <p className="font-display text-sm font-medium">{t}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-amber/20 bg-amber-soft p-4">
        <p className="text-sm leading-relaxed"><span className="font-display text-amber">Zero set, zero giornate perse.</span> <span className="text-muted-foreground">Contenuti pronti senza fermare il negozio.</span></p>
      </div>
    </div>
  );
}
