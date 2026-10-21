import { useEffect, useState, type FormEvent } from "react";
import { listServiceCatalog } from "@/lib/services-catalog.functions";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SECTORS = [
  "E-commerce",
  "Manifatturiero / B2B",
  "Servizi professionali",
  "Ristorazione / Hospitality",
  "Retail / Negozio fisico",
  "Salute e benessere",
  "Altro",
] as const;

const INTERESTS = [
  "Sito web / Web app",
  "Marketing (Magnus)",
  "Automazioni AI",
  "Prodotto custom (Arkeo)",
  "Consulenza strategica",
] as const;

type Option = { code: string; name: string };
const FALLBACK: Option[] = INTERESTS.map((i) => ({ code: "", name: i }));

export function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<Option[]>(FALLBACK);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    listServiceCatalog()
      .then((r) => {
        if (r.live && r.services.length) setOptions(r.services.map((s) => ({ code: s.code, name: s.name })));
      })
      .catch(() => {});
  }, []);

  function toggle(v: string) {
    setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected.length) {
      setError("Seleziona almeno un servizio.");
      return;
    }
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const picked = options.filter((o) => selected.includes(o.name));
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      business: String(fd.get("business") ?? ""),
      sector: String(fd.get("sector") ?? "Altro"),
      selectedServices: picked.map((o) => o.name),
      serviceCodes: picked.map((o) => o.code).filter(Boolean),
      expectedGoals: [],
      lookingFor: String(fd.get("lookingFor") ?? ""),
      contactPreference: "email" as const,
    };
    try {
      const res = await fetch("/api/public/lead-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? "Errore invio");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore invio");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-amber bg-surface-elevated p-10 text-center"
      >
        <div className="size-14 rounded-full bg-amber-soft mx-auto flex items-center justify-center">
          <Check className="size-6 text-amber" />
        </div>
        <h3 className="mt-5 text-2xl font-display font-semibold">Richiesta ricevuta</h3>
        <p className="mt-3 text-muted-foreground">
          Ti ricontattiamo entro 24 ore lavorative con una proposta su misura.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-border bg-surface-elevated/70 backdrop-blur p-6 lg:p-8 space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome e cognome *</Label>
          <Input id="name" name="name" required minLength={2} placeholder="Mario Rossi" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required placeholder="mario@azienda.it" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="business">Azienda</Label>
          <Input id="business" name="business" placeholder="Nome attività" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefono</Label>
          <Input id="phone" name="phone" placeholder="+39..." />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sector">Settore *</Label>
        <select
          id="sector"
          name="sector"
          required
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {SECTORS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Cosa ti interessa? *</Label>
        <div className="flex flex-wrap gap-2">
          {options.map(({ name: i }) => {
            const on = selected.includes(i);
            return (
              <button
                type="button"
                key={i}
                aria-pressed={on}
                onClick={() => toggle(i)}
                className={`text-xs px-3 py-2 rounded-full border transition-colors ${
                  on
                    ? "bg-amber text-amber-foreground border-amber"
                    : "border-border text-muted-foreground hover:border-amber"
                }`}
              >
                {i}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lookingFor">Raccontaci il tuo obiettivo *</Label>
        <Textarea
          id="lookingFor"
          name="lookingFor"
          required
          minLength={5}
          rows={3}
          placeholder="Cosa vorresti ottenere nei prossimi 6 mesi?"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Invio in corso...
          </>
        ) : (
          <>
            Invia richiesta <ArrowRight />
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Ti risponde una persona reale entro 24h. Nessun impegno.
      </p>
    </form>
  );
}
