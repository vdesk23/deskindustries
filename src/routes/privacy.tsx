import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Desk Industries" },
      {
        name: "description",
        content:
          "Privacy Policy di Desk Industries SRLS. Come trattiamo i tuoi dati personali ai sensi del GDPR.",
      },
      { property: "og:title", content: "Privacy Policy — Desk Industries" },
      {
        property: "og:description",
        content: "Come trattiamo i dati personali dei nostri clienti e visitatori.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 lg:px-8 py-20 lg:py-28">
      <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
        Documento legale
      </p>
      <h1 className="text-4xl lg:text-5xl font-display font-medium tracking-tight">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="prose prose-invert mt-12 space-y-8 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">1. Titolare del trattamento</h2>
          <p className="mt-3">
            Il titolare del trattamento dei dati è <strong>Desk Industries SRLS</strong>,
            con sede legale in Italia. Per qualsiasi richiesta relativa al trattamento dei tuoi
            dati personali puoi contattarci all'indirizzo{" "}
            <a href="mailto:info@deskindustries.com" className="text-amber hover:underline">
              info@deskindustries.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">2. Dati raccolti</h2>
          <p className="mt-3">Raccogliamo le seguenti categorie di dati:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Dati di registrazione</strong>: nome, cognome, email, password (cifrata).</li>
            <li><strong>Dati di pagamento</strong>: gestiti interamente da Stripe; non memorizziamo numeri di carta.</li>
            <li><strong>Dati di utilizzo</strong>: log di accesso, indirizzo IP, tipo di browser e dispositivo.</li>
            <li><strong>Comunicazioni</strong>: contenuti delle email che ci invii.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">3. Finalità del trattamento</h2>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Erogazione dei servizi sottoscritti (pacchetti COCO Lite e Pro).</li>
            <li>Gestione dei pagamenti e fatturazione elettronica.</li>
            <li>Comunicazioni transazionali (conferme, rinnovi, cambi di stato).</li>
            <li>Adempimenti fiscali e contabili previsti dalla legge italiana.</li>
            <li>Sicurezza della piattaforma e prevenzione di frodi.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">4. Base giuridica</h2>
          <p className="mt-3">
            Il trattamento si basa sull'esecuzione del contratto (art. 6.1.b GDPR), sugli obblighi
            di legge (art. 6.1.c GDPR) e sul legittimo interesse del titolare (art. 6.1.f GDPR).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">5. Conservazione dei dati</h2>
          <p className="mt-3">
            I dati contrattuali vengono conservati per 10 anni come previsto dalla normativa
            fiscale. I log tecnici sono conservati per 6 mesi. I dati dell'account vengono
            cancellati su richiesta o dopo 24 mesi di inattività.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">6. Soggetti terzi</h2>
          <p className="mt-3">I tuoi dati possono essere trattati dai seguenti responsabili esterni:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Stripe Payments Europe</strong>: elaborazione pagamenti.</li>
            <li><strong>Supabase / Lovable Cloud</strong>: hosting database e backend.</li>
            <li><strong>Google Workspace</strong>: email aziendale e produttività.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">7. I tuoi diritti</h2>
          <p className="mt-3">
            In qualsiasi momento puoi esercitare i diritti previsti dagli artt. 15-22 del GDPR:
            accesso, rettifica, cancellazione, limitazione, portabilità e opposizione. Per farlo
            scrivi a{" "}
            <a href="mailto:info@deskindustries.com" className="text-amber hover:underline">
              info@deskindustries.com
            </a>. Hai inoltre diritto di proporre reclamo al Garante per la Protezione dei Dati
            Personali (
            <a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer" className="text-amber hover:underline">
              garanteprivacy.it
            </a>
            ).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">8. Cookie</h2>
          <p className="mt-3">
            Il sito utilizza esclusivamente cookie tecnici necessari al funzionamento (sessione,
            autenticazione). Non utilizziamo cookie di profilazione né di marketing senza il tuo
            consenso esplicito.
          </p>
        </section>
      </div>
    </article>
  );
}
