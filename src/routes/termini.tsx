import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/termini")({
  head: () => ({
    meta: [
      { title: "Termini e Condizioni — Desk Industries" },
      {
        name: "description",
        content:
          "Termini e Condizioni di servizio di Desk Industries SRLS per i servizi COCO su misura.",
      },
      { property: "og:title", content: "Termini e Condizioni — Desk Industries" },
      {
        property: "og:description",
        content: "Le condizioni contrattuali per i servizi COCO di Desk Industries.",
      },
    ],
  }),
  component: TerminiPage,
});

function TerminiPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 lg:px-8 py-20 lg:py-28">
      <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
        Documento legale
      </p>
      <h1 className="text-4xl lg:text-5xl font-display font-medium tracking-tight">
        Termini e Condizioni
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="prose prose-invert mt-12 space-y-8 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">1. Fornitore</h2>
          <p className="mt-3">
            I servizi sono erogati da <strong>Desk Industries SRLS</strong>, società di diritto
            italiano. Per contattarci:{" "}
            <a href="mailto:info@deskindustries.com" className="text-amber hover:underline">
              info@deskindustries.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">2. Oggetto del servizio</h2>
          <p className="mt-3">
            I servizi <strong>Coco Web</strong>, <strong>Coco Social</strong>, <strong>CoCoaching</strong> e <strong>CoCoaching Executive</strong>
            vengono descritti nella pagina <a href="/pacchetti" className="text-amber hover:underline">Servizi COCO</a> e definiti in dettaglio nella proposta personalizzata.
            Ogni costo, durata e perimetro operativo viene concordato per iscritto prima dell'attivazione.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">3. Pagamento e rinnovo</h2>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Il pagamento avviene secondo le modalità indicate nella proposta o nel preventivo approvato.</li>
            <li>Eventuali rinnovi o attività ricorrenti vengono specificati per iscritto nella proposta.</li>
            <li>Gli importi sono espressi in Euro al netto di IVA, applicata secondo normativa.</li>
            <li>In caso di mancato pagamento il servizio viene sospeso dopo 7 giorni di tolleranza.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">4. Disdetta</h2>
          <p className="mt-3">
            Puoi disdire l'abbonamento in qualsiasi momento dalla tua area{" "}
            <a href="/account" className="text-amber hover:underline">Account</a> con un preavviso
            di <strong>30 giorni</strong>. La disdetta avrà effetto al termine del periodo di
            fatturazione corrente. Non sono previste penali.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">5. Diritto di recesso</h2>
          <p className="mt-3">
            Ai sensi dell'art. 59 del Codice del Consumo (D.Lgs. 206/2005), il diritto di recesso
            di 14 giorni non si applica ai servizi digitali la cui esecuzione è iniziata con il tuo
            consenso espresso. Sottoscrivendo l'abbonamento accetti che il servizio inizi
            immediatamente e rinunci al diritto di recesso una volta erogato.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">6. Obblighi del cliente</h2>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Fornire informazioni veritiere e aggiornate.</li>
            <li>Mantenere riservate le credenziali di accesso al proprio account.</li>
            <li>Utilizzare il servizio nel rispetto della legge e dei diritti di terzi.</li>
            <li>Fornire i contenuti e gli accessi necessari per l'erogazione del servizio.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">7. Limitazione di responsabilità</h2>
          <p className="mt-3">
            Desk Industries garantisce la massima professionalità nell'erogazione del servizio
            ma non può garantire risultati commerciali specifici, dipendenti da fattori esterni
            (mercato, concorrenza, qualità del prodotto del cliente). La responsabilità è limitata
            all'importo pagato negli ultimi 3 mesi di abbonamento.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">8. Proprietà intellettuale</h2>
          <p className="mt-3">
            I contenuti creati su misura per il cliente (testi, grafiche, codice di siti dedicati)
            diventano di proprietà del cliente al saldo della relativa fattura. I template, le
            metodologie e gli strumenti proprietari di Desk Industries restano di sua esclusiva
            proprietà.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">9. Foro competente</h2>
          <p className="mt-3">
            Per qualsiasi controversia è competente in via esclusiva il Foro del consumatore se
            il cliente è qualificabile come consumatore, altrimenti il Foro della sede legale di
            Desk Industries SRLS. La legge applicabile è quella italiana.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-semibold text-foreground">10. Modifiche</h2>
          <p className="mt-3">
            Eventuali modifiche ai presenti termini saranno comunicate via email con preavviso
            di 30 giorni. Il proseguimento dell'abbonamento dopo tale termine costituirà
            accettazione delle nuove condizioni.
          </p>
        </section>
      </div>
    </article>
  );
}
