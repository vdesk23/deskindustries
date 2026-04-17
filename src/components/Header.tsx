import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/metodo-coco", label: "Metodo COCO" },
  { to: "/pacchetti", label: "Pacchetti" },
  { to: "/settori", label: "Settori" },
  { to: "/progetti", label: "Progetti" },
  { to: "/chi-siamo", label: "Chi siamo" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-background/70 border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8 h-16 flex items-center justify-between">
        <Logo />

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <Link to="/account">
              <Button variant="ghost" size="sm">
                <User className="size-4" /> Area clienti
              </Button>
            </Link>
          ) : (
            <Link to="/auth" search={{ redirect: "/account", mode: "login" }}>
              <Button variant="ghost" size="sm">
                Accedi
              </Button>
            </Link>
          )}
          <Link to="/contatti">
            <Button variant="amber" size="sm">
              Prenota una call
            </Button>
          </Link>
        </div>

        <button
          aria-label="Menu"
          className="lg:hidden p-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="px-5 py-4 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-base text-muted-foreground hover:text-foreground rounded-md"
                activeProps={{ className: "text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/contatti" onClick={() => setOpen(false)} className="mt-2">
              <Button variant="amber" className="w-full">
                Prenota una call
              </Button>
            </Link>
            {user ? (
              <Link to="/account" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full mt-2">
                  <User className="size-4" /> Area clienti
                </Button>
              </Link>
            ) : (
              <Link
                to="/auth"
                search={{ redirect: "/account", mode: "login" }}
                onClick={() => setOpen(false)}
              >
                <Button variant="outline" className="w-full mt-2">
                  Accedi
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
