import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Mail, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5 space-y-5">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Diamo voce online alle attività locali. Strategie trasparenti e
              sostenibili per far crescere la tua impresa.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="mailto:info@deskindustries.com"
                className="size-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-amber hover:border-amber transition-colors"
                aria-label="Email"
              >
                <Mail className="size-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="size-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-amber hover:border-amber transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="size-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-amber hover:border-amber transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber mb-4">
              Servizi
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/metodo-coco" className="text-muted-foreground hover:text-foreground">Metodo COCO</Link></li>
              <li><Link to="/pacchetti" className="text-muted-foreground hover:text-foreground">Servizi COCO</Link></li>
              <li><Link to="/settori" className="text-muted-foreground hover:text-foreground">Settori</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber mb-4">
              Agenzia
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/chi-siamo" className="text-muted-foreground hover:text-foreground">Chi siamo</Link></li>
              <li><Link to="/progetti" className="text-muted-foreground hover:text-foreground">Progetti</Link></li>
              <li><Link to="/contatti" className="text-muted-foreground hover:text-foreground">Contatti</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber mb-4">
              Contatti
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Desk Industries SRLS</li>
              <li>info@deskindustries.com</li>
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
