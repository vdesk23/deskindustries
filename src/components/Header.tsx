import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/progetti", label: "Progetti" },
  { to: "/chi-siamo", label: "Il gruppo" },
  { to: "/pacchetti", label: "Servizi" },
  { to: "/blog", label: "Blog" },
  { to: "/contatti", label: "Contatti" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      {/* Floating pill header — app-like, anchored to bottom */}
      <header className="fixed bottom-4 sm:bottom-6 inset-x-0 z-50 pointer-events-none flex justify-center px-3">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/70 bg-background/60 backdrop-blur-2xl shadow-elevated pl-3 pr-2 py-2 max-w-[min(960px,100%)]">
          <Link to="/" className="shrink-0 pl-1 pr-2">
            <Logo />
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-white/5"
                activeProps={{ className: "text-foreground bg-white/[0.06]" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2 pl-1">
            {user ? (
              <Link to="/account">
                <Button variant="ghost" size="sm" className="rounded-full">
                  <User className="size-4" /> Area clienti
                </Button>
              </Link>
            ) : (
              <Link to="/auth" search={{ redirect: "/account", mode: "login" }}>
                <Button variant="ghost" size="sm" className="rounded-full">
                  Accedi
                </Button>
              </Link>
            )}
            <Link to="/contatti">
              <Button variant="amber" size="sm" className="rounded-full">
                Prenota una call
              </Button>
            </Link>
          </div>

          <button
            aria-label="Menu"
            className="lg:hidden p-2.5 rounded-full text-foreground hover:bg-white/5"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer opens from bottom */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-background/60 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute bottom-24 left-3 right-3 rounded-3xl border border-border/70 bg-background/90 backdrop-blur-2xl shadow-elevated p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-base text-muted-foreground hover:text-foreground rounded-2xl hover:bg-white/5"
                  activeProps={{ className: "text-foreground bg-white/[0.06]" }}
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/contatti" onClick={() => setOpen(false)} className="mt-2">
                <Button variant="amber" className="w-full rounded-full">
                  Prenota una call
                </Button>
              </Link>
              {user ? (
                <Link to="/account" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full mt-2 rounded-full">
                    <User className="size-4" /> Area clienti
                  </Button>
                </Link>
              ) : (
                <Link
                  to="/auth"
                  search={{ redirect: "/account", mode: "login" }}
                  onClick={() => setOpen(false)}
                >
                  <Button variant="outline" className="w-full mt-2 rounded-full">
                    Accedi
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
