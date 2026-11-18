import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cookie-policy")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — Desk Industries" },
      { name: "description", content: "Quali cookie e strumenti di misurazione usa il sito Desk Industries e come gestire le tue preferenze." },
      { property: "og:title", content: "Cookie Policy — Desk Industries" },
      { property: "og:description", content: "Cookie tecnici, analisi delle visite e Meta Pixel: come li usiamo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CookiePolicy,
});

function CookiePolicy() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-3xl px-5 lg:px-8 space-y-6 text-muted-foreground leading-relaxed">
        <h1 className="font-display text-4xl font-medium tracking-tight text-foreground">Cookie Policy</h1>
        <p>Ultimo aggiornamento: 18 novembre 2026. Titolare: Desk Industries SRLS.</p>
        <h2 className="font-display text-2xl text-foreground">Necessari</h2>
        <p>Servono al funzionamento del sito (sessione, accesso, salvataggio delle tue preferenze cookie). Sono sempre attivi.</p>
        <h2 className="font-display text-2xl text-foreground">Analisi (Lovable)</h2>
        <p>Contiamo le visite senza cookie e senza identificarti. Se accetti, misuriamo anche i clic e le azioni sul sito.</p>
        <h2 className="font-display text-2xl text-foreground">Pubblicità (Meta Pixel)</h2>
        <p>Solo se scegli “Accetta tutti” o attivi la voce Pubblicità, carichiamo il Meta Pixel di Meta Platforms Ireland Ltd. Ci aiuta a misurare l'efficacia delle campagne (visite, inizio e invio dei moduli). Non inviamo a Meta nome, email o telefono. Il Pixel può impostare cookie come <code>_fbp</code> per fino a 90 giorni.</p>
        <h2 className="font-display text-2xl text-foreground">Gestire le preferenze</h2>
        <p>Puoi cambiare scelta in qualsiasi momento dal link “Impostazioni cookie” in fondo a ogni pagina. Se il tuo browser invia il segnale Global Privacy Control, analisi e pubblicità restano disattivate.</p>
      </div>
    </section>
  );
}
