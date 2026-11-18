import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { User, ChevronUp } from "lucide-react";
import { LANDING_LINES } from "@/lib/landing-lines";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const DESK_PM_URL = "https://project.deskinc.app";

export function Header() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed bottom-4 sm:bottom-6 inset-x-0 z-50 pointer-events-none flex justify-center px-3">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/70 bg-background/60 backdrop-blur-2xl shadow-elevated pl-3 pr-2 py-2 max-w-[min(960px,100%)]">
        <div className="shrink-0 pl-1 pr-2">
          <Logo />
        </div>

        <div className="relative" onMouseLeave={() => setOpen(false)}>
          <Button variant="ghost" size="sm" className="rounded-full" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)}>
            Servizi <ChevronUp className={`size-4 transition-transform ${open ? "" : "rotate-180"}`} />
          </Button>
          {open && (
            <nav aria-label="Servizi" className="absolute bottom-full left-1/2 -translate-x-1/2 pb-3 w-[min(22rem,90vw)]">
              <ul className="rounded-2xl border border-border bg-surface-elevated/95 backdrop-blur-xl shadow-elevated p-2">
                {LANDING_LINES.map((l) => (
                  <li key={l.id}>
                    {l.path ? (
                      <Link to={l.path} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 hover:bg-amber-soft">
                        <span className="font-display font-medium text-foreground">{l.name}</span>
                        <span className="block text-xs text-muted-foreground">{l.tagline}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between rounded-xl px-3 py-2 opacity-60">
                        <span className="font-display text-foreground">{l.name}</span>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">In arrivo</span>
                      </div>
                    )}
                  </li>
                ))}
                <li className="border-t border-border mt-1 pt-1">
                  <Link to="/servizi" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-amber hover:bg-amber-soft">Tutti i servizi →</Link>
                </li>
              </ul>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 pl-1">
          {user ? (
            <Link to="/account">
              <Button variant="ghost" size="sm" className="rounded-full">
                <User className="size-4" /> Area clienti
              </Button>
            </Link>
          ) : (
            <a href={DESK_PM_URL}>
              <Button variant="ghost" size="sm" className="rounded-full">
                Accedi
              </Button>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
