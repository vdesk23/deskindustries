import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6 space-y-5">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Diamo voce online alle attività locali. Strategie trasparenti e
              sostenibili per far crescere la tua impresa.
            </p>
          </div>

          <div className="md:col-span-6">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber mb-4">
              Contatti
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Desk Industries SRLS</li>
              <li>Sede legale: Via Emilio Nazzani 9, 00148 Roma (RM)</li>
              <li>
                <a href="mailto:info@deskindustries.com" className="hover:text-foreground">
                  info@deskindustries.com
                </a>
              </li>
              <li>PEC: deskindustriessrls@legalmail.it</li>
              <li>Partita IVA: IT18081351001</li>
              <li>Numero REA: 1760359</li>
              <li>Codice destinatario: JI3TXCE</li>
              <li>
                <a href="https://www.deskindustries.com" target="_blank" rel="noreferrer" className="hover:text-foreground">
                  deskindustries.com
                </a>
              </li>
            </ul>
          </div>
        </div>


        <div className="mt-14 pt-6 border-t border-border flex flex-col md:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <p>© {new Date().getFullYear()} Desk Industries SRLS. Tutti i diritti riservati.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link to="/termini" className="hover:text-foreground">Termini</Link>
            </div>
          </div>
          <p className="font-display tracking-wider">
            COCO — <span className="text-amber">Costruire Online</span> per Cementificare Offline
          </p>
        </div>
      </div>
    </footer>
  );
}
