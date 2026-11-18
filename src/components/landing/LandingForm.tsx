import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trackPixel } from "@/lib/meta-pixel";
import type { LandingLineId } from "@/lib/landing-lines";
import type { Variant } from "@/lib/landing-splitter";

export interface Question { id: string; label: string; options: string[] }

interface Props {
  line: LandingLineId;
  lineLabel: string;
  variant: Variant;
  questions: Question[];
  submitLabel?: string;
}

const UTM_KEY = "lp_utm";

export function LandingForm({ line, lineLabel, variant, questions, submitLabel = "Prenota la call gratuita" }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [c, setC] = useState({ firstName: "", lastName: "", phone: "", email: "" });
  const [privacy, setPrivacy] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [contactId, setContactId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);
  const done = useRef(false);
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    const onLeave = () => {
      if (started.current && !done.current) trackPixel("AbandonCheckout", { step: stepRef.current, line }, true);
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, [line]);

  const begin = () => {
    if (started.current) return;
    started.current = true;
    trackPixel("InitiateCheckout", { content_name: lineLabel });
  };

  const post = async (payload: Record<string, unknown>) => {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/public/landing-submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Invio non riuscito, riprova.");
      return json;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invio non riuscito, riprova.");
      return null;
    } finally { setBusy(false); }
  };

  const submit1 = async () => {
    let utm = {};
    try { utm = JSON.parse(sessionStorage.getItem(UTM_KEY) || "{}"); } catch { /* none */ }
    const r = await post({ action: "contact", line, variant, contactId, ...c, privacy, utm });
    if (r?.contactId) { setContactId(r.contactId); setStep(2); }
  };

  const submit3 = async () => {
    const r = await post({ action: "request", line, contactId, answers, preferredSlot: slot, notes });
    if (r?.ok) {
      done.current = true;
      trackPixel("Lead", { content_name: lineLabel });
      navigate({ to: "/grazie", search: { store: line, nome: c.firstName } });
    }
  };

  const step1Valid = c.firstName.trim().length > 1 && c.lastName.trim().length > 1 && c.phone.trim().length > 5 && /\S+@\S+\.\S+/.test(c.email) && privacy;
  const step2Valid = questions.every((q) => answers[q.id]);

  return (
    <form method="post" onSubmit={(e) => e.preventDefault()} onFocus={begin}
      className="rounded-3xl border border-border bg-surface-elevated/60 backdrop-blur-xl shadow-elevated p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs font-display uppercase tracking-[0.2em] text-amber">Step {step} di 3</p>
        <div className="flex gap-1.5">{[1, 2, 3].map((s) => <span key={s} className={`h-1.5 w-8 rounded-full ${s <= step ? "bg-amber" : "bg-border"}`} />)}</div>
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <h3 className="font-display text-xl font-medium tracking-tight">Parliamo del tuo negozio</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input aria-label="Nome" name="firstName" placeholder="Nome" autoComplete="given-name" value={c.firstName} onChange={(e) => setC({ ...c, firstName: e.target.value })} />
            <Input aria-label="Cognome" name="lastName" placeholder="Cognome" autoComplete="family-name" value={c.lastName} onChange={(e) => setC({ ...c, lastName: e.target.value })} />
          </div>
          <Input aria-label="Telefono" name="phone" type="tel" placeholder="Telefono" autoComplete="tel" value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value })} />
          <Input aria-label="Email" name="email" type="email" placeholder="Email" autoComplete="email" value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} />
          <label className="flex items-start gap-3 text-xs text-muted-foreground pt-1">
            <Checkbox checked={privacy} onCheckedChange={(v) => setPrivacy(v === true)} aria-label="Consenso privacy" />
            <span>Ho letto la <Link to="/privacy" className="text-amber underline">Privacy Policy</Link> e acconsento a essere ricontattato da Desk Industries.</span>
          </label>
          <Button type="button" variant="amber" className="w-full rounded-full" disabled={!step1Valid || busy} onClick={submit1}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <>Continua <ArrowRight className="size-4" /></>}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          {questions.map((q) => (
            <fieldset key={q.id}>
              <legend className="font-display font-medium mb-2">{q.label}</legend>
              <div className="flex flex-wrap gap-2">
                {q.options.map((o) => (
                  <button type="button" key={o} onClick={() => setAnswers({ ...answers, [q.id]: o })}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${answers[q.id] === o ? "border-amber bg-amber-soft text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => setStep(1)}><ArrowLeft className="size-4" /> Indietro</Button>
            <Button type="button" variant="amber" className="flex-1 rounded-full" disabled={!step2Valid} onClick={() => setStep(3)}>Continua <ArrowRight className="size-4" /></Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <h3 className="font-display text-xl font-medium tracking-tight">Quando ti chiamiamo?</h3>
          <div className="flex flex-wrap gap-2">
            {["Mattina (9-13)", "Pomeriggio (14-18)", "Sera (18-20)"].map((o) => (
              <button type="button" key={o} onClick={() => setSlot(o)}
                className={`rounded-full border px-4 py-2 text-sm ${slot === o ? "border-amber bg-amber-soft" : "border-border text-muted-foreground"}`}>{o}</button>
            ))}
          </div>
          <Textarea aria-label="Note" placeholder="Note (facoltative): cosa vendi, cosa vorresti ottenere…" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} />
          <div className="flex gap-2">
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => setStep(2)}><ArrowLeft className="size-4" /> Indietro</Button>
            <Button type="button" variant="amber" className="flex-1 rounded-full" disabled={!slot || busy} onClick={submit3}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : submitLabel}
            </Button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    </form>
  );
}
