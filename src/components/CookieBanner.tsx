import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie-consent-v1";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Informativa cookie"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 rounded-2xl border border-border bg-surface-elevated/95 backdrop-blur-md shadow-2xl p-5"
    >
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Chiudi"
      >
        <X className="size-4" />
      </button>
      <p className="text-xs font-display tracking-[0.2em] text-amber uppercase mb-2">
        Cookie
      </p>
      <p className="text-sm leading-relaxed text-foreground/90 pr-6">
        Usiamo solo cookie tecnici necessari al funzionamento del sito (sessione e
        autenticazione). Nessun cookie di profilazione o marketing.{" "}
        <Link to="/privacy" className="text-amber hover:underline font-medium">
          Maggiori info
        </Link>
        .
      </p>
      <Button variant="amber" size="sm" className="mt-4 w-full" onClick={dismiss}>
        Ho capito
      </Button>
    </div>
  );
}
