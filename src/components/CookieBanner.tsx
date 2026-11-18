import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { needsAnswer, onConsentChange, readChoice, saveChoices, type Purpose } from "@/lib/consent";

const PURPOSES: Purpose[] = ["analytics", "advertising"];
export const OPEN_COOKIE_SETTINGS = "open-cookie-settings";

export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [gpc, setGpc] = useState(false);
  const [sw, setSw] = useState<Record<Purpose, boolean>>({ analytics: false, advertising: false });
  const ref = useRef<HTMLDivElement>(null);

  const syncSwitches = () =>
    setSw({ analytics: readChoice("analytics") === "granted", advertising: readChoice("advertising") === "granted" });

  useEffect(() => {
    setGpc((navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl === true);
    void needsAnswer(PURPOSES).then((n) => n && setOpen(true));
    const openSettings = () => { syncSwitches(); setSettings(true); setOpen(true); };
    window.addEventListener(OPEN_COOKIE_SETTINGS, openSettings);
    const off = onConsentChange(syncSwitches);
    return () => { window.removeEventListener(OPEN_COOKIE_SETTINGS, openSettings); off(); };
  }, []);

  useEffect(() => { if (open) ref.current?.focus(); }, [open, settings]);

  if (!open) return null;
  const all = (c: "granted" | "denied") => { saveChoices({ analytics: c, advertising: c }); setOpen(false); setSettings(false); };

  return (
    <div ref={ref} tabIndex={-1} role="region" aria-label="Preferenze cookie"
      className="fixed bottom-24 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 rounded-2xl border border-border bg-surface-elevated/95 backdrop-blur-md shadow-elevated p-5 outline-none">
      <p className="text-xs font-display tracking-[0.2em] text-amber uppercase mb-2">Cookie</p>
      {!settings ? (
        <p className="text-sm leading-relaxed text-foreground/90">
          Contiamo le visite senza cookie. Se accetti, misuriamo anche i clic e usiamo cookie pubblicitari per mostrarti annunci pertinenti e misurare le campagne.{" "}
          <Link to="/cookie-policy" className="text-amber hover:underline">Cookie Policy</Link> ·{" "}
          <Link to="/privacy" className="text-amber hover:underline">Privacy</Link>
        </p>
      ) : (
        <div className="space-y-3 text-sm">
          {gpc && <p className="text-muted-foreground">Il tuo browser invia un segnale di privacy: analisi e pubblicità restano disattivate.</p>}
          <div className="flex items-center justify-between gap-3"><span>Necessari — sempre attivi</span></div>
          <label className="flex items-center justify-between gap-3">
            <span>Analisi, fornita da Lovable</span>
            <Switch disabled={gpc} checked={!gpc && sw.analytics} onCheckedChange={(v) => setSw((s) => ({ ...s, analytics: v }))} />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Pubblicità, fornita da Meta</span>
            <Switch disabled={gpc} checked={!gpc && sw.advertising} onCheckedChange={(v) => setSw((s) => ({ ...s, advertising: v }))} />
          </label>
          <Button variant="amber" size="sm" className="w-full" onClick={() => {
            saveChoices({ analytics: sw.analytics ? "granted" : "denied", advertising: sw.advertising ? "granted" : "denied" });
            setOpen(false); setSettings(false);
          }}>Salva preferenze</Button>
        </div>
      )}
      {!settings && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => all("denied")}>Rifiuta tutti</Button>
            <Button variant="outline" size="sm" onClick={() => all("granted")}>Accetta tutti</Button>
          </div>
          <button className="mt-3 text-xs text-muted-foreground hover:text-foreground underline" onClick={() => { syncSwitches(); setSettings(true); }}>
            Impostazioni cookie
          </button>
        </>
      )}
    </div>
  );
}
