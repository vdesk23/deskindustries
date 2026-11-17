import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listServiceCatalog } from "@/lib/services-catalog.functions";
import { groupServices, STORE_CATEGORIES, STORE_SITUATIONS, type ServiceOption } from "@/lib/lead-intake";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const STORAGE_KEY = "desk-commercial-intake";
const emptyContact = { name: "", email: "", phone: "" };
const emptyCompany = { business: "", vatNumber: "", address: "", city: "" };
const STEPS = ["Contatti", "Categoria", "Situazione", "Servizi", "Società"] as const;
type Step = 1 | 2 | 3 | 4 | 5;

function Choice({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick}
      className={`w-full text-left rounded-2xl border px-4 py-3 text-sm transition-colors ${active ? "border-amber bg-amber-soft text-foreground" : "border-border hover:border-amber/60 text-muted-foreground"}`}>
      {label}
    </button>
  );
}

export function LeadForm() {
  const [step, setStep] = useState<Step>(1);
  const [contact, setContact] = useState(emptyContact);
  const [category, setCategory] = useState("");
  const [situation, setSituation] = useState("");
  const [company, setCompany] = useState(emptyCompany);
  const [continuation, setContinuation] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ServiceOption[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState("");
  const getCatalog = useServerFn(listServiceCatalog);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.expires > Date.now() && typeof saved.continuation === "string") {
        setContinuation(saved.continuation);
        setContact({ ...emptyContact, ...saved.contact });
        setStep(saved.registered ? 2 : 1);
      }
    } catch { /* Browser storage is optional. */ }
  }, []);

  async function loadCatalog() {
    setCatalogLoading(true);
    try {
      const result = await getCatalog();
      setOptions(result.live ? result.services : []);
    } catch { setOptions([]); }
    finally { setCatalogLoading(false); }
  }

  useEffect(() => {
    if (step === 4 && !options.length) void loadCatalog();
  }, [step]);

  function remember(token: string, registered: boolean) {
    setContinuation(token);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ continuation: token, contact, registered, expires: Date.now() + 86400000 }));
    } catch { /* The current form remains usable without storage. */ }
  }

  function go(next: Step) { setError(null); setStep(next); }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (step === 2) return category ? go(3) : setError("Scegli la categoria del tuo negozio.");
    if (step === 3) return situation ? go(4) : setError("Scegli la situazione più vicina alla tua.");
    if (step === 4) return selected.length ? go(5) : setError("Seleziona almeno un servizio.");
    setLoading(true);
    try {
      const payload = step === 1
        ? { action: "register", ...contact, continuation: continuation || undefined }
        : { action: "quote", continuation, sector: category, situation, serviceCodes: selected, lookingFor, company };
      const response = await fetch("/api/public/lead-submit", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (typeof result.continuation === "string") remember(result.continuation, response.ok);
      if (!response.ok || !result.success) throw new Error(result.error || "Invio non riuscito. Riprova.");
      if (step === 1) {
        go(2);
      } else {
        setSent(true);
        try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* Optional storage. */ }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invio non riuscito. Riprova.");
    } finally { setLoading(false); }
  }

  if (sent) return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="border border-amber bg-surface-elevated p-8 text-center">
      <div className="size-14 rounded-full bg-amber-soft mx-auto flex items-center justify-center"><Check className="size-6 text-amber" /></div>
      <h3 className="mt-5 text-2xl font-display font-semibold">Richiesta ricevuta</h3>
      <p className="mt-3 text-muted-foreground">Analizziamo il tuo negozio e i servizi scelti: ti contattiamo con una proposta su misura.</p>
    </motion.div>
  );

  const field = (id: keyof typeof emptyCompany, label: string, placeholder: string, extra: Record<string, unknown> = {}) => (
    <div className="space-y-2"><Label htmlFor={id}>{label} *</Label><Input id={id} required value={company[id]} onChange={(e) => setCompany({ ...company, [id]: e.target.value })} placeholder={placeholder} {...extra} /></div>
  );

  return (
    <form method="post" onSubmit={onSubmit} className="bg-surface-elevated/70 backdrop-blur p-6 lg:p-8 space-y-5" aria-label="Richiesta preventivo">
      <div className="border-b border-border pb-4">
        <p className="text-xs font-display text-muted-foreground">Step {step} di 5 · <span className="text-amber">{STEPS[step - 1]}</span></p>
        <div className="mt-3 grid grid-cols-5 gap-1.5" aria-hidden>
          {STEPS.map((s, i) => <span key={s} className={`h-1 rounded-full ${i < step ? "bg-amber" : "bg-border"}`} />)}
        </div>
      </div>

      {step === 1 && <>
        <p className="font-display font-semibold">Come possiamo contattarti?</p>
        <div className="space-y-2"><Label htmlFor="name">Nome e cognome *</Label><Input id="name" autoComplete="name" required minLength={2} maxLength={80} value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Mario Rossi" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="email">Email *</Label><Input id="email" type="email" autoComplete="email" required maxLength={255} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="mario@negozio.it" /></div>
          <div className="space-y-2"><Label htmlFor="phone">Telefono / WhatsApp</Label><Input id="phone" type="tel" autoComplete="tel" maxLength={40} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+39..." /></div>
        </div>
      </>}

      {step === 2 && <fieldset className="space-y-2">
        <legend className="font-display font-semibold mb-3">Cosa vendi nel tuo negozio?</legend>
        {STORE_CATEGORIES.map((c) => <Choice key={c} label={c} active={category === c} onClick={() => setCategory(c)} />)}
      </fieldset>}

      {step === 3 && <fieldset className="space-y-2">
        <legend className="font-display font-semibold mb-3">Qual è la tua situazione oggi?</legend>
        {STORE_SITUATIONS.map((c) => <Choice key={c} label={c} active={situation === c} onClick={() => setSituation(c)} />)}
      </fieldset>}

      {step === 4 && <>
        <p className="font-display font-semibold">Di cosa hai bisogno?</p>
        {catalogLoading ? <div role="status" className="flex gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Caricamento servizi…</div> : options.length ?
          <div className="space-y-5 max-h-80 overflow-y-auto pr-2">{groupServices(options).map(([cat, services]) => <fieldset key={cat} className="space-y-3">
            <legend className="text-sm font-display font-semibold text-amber mb-3">{cat}</legend>
            {services.map((service) => <div key={service.code} className="flex items-start gap-3">
              <Checkbox id={`service-${service.code}`} checked={selected.includes(service.code)} disabled={selected.length >= 30 && !selected.includes(service.code)} onCheckedChange={(checked) => setSelected((current) => checked ? [...current, service.code] : current.filter((code) => code !== service.code))} className="mt-0.5" />
              <Label htmlFor={`service-${service.code}`} className="text-sm leading-5 cursor-pointer">{service.name}</Label>
            </div>)}
          </fieldset>)}</div>
          : <div role="status" className="space-y-3"><p className="text-sm text-muted-foreground">Il catalogo servizi non è disponibile al momento.</p><Button type="button" variant="outline" size="sm" onClick={loadCatalog}>Riprova</Button></div>}
        <div className="space-y-2"><Label htmlFor="lookingFor">Cosa stai cercando? <span className="text-muted-foreground">(facoltativo)</span></Label><Textarea id="lookingFor" maxLength={500} rows={3} value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} placeholder="Es: abbiamo due negozi e vorremmo aprire lo store online senza vendere capi esauriti in cassa." /></div>
      </>}

      {step === 5 && <>
        <p className="font-display font-semibold">Dati della società per il preventivo</p>
        {field("business", "Ragione sociale", "Boutique Rossi srl", { maxLength: 120, autoComplete: "organization" })}
        {field("vatNumber", "Partita IVA", "12345678901", { maxLength: 13, pattern: "(IT|it)?[0-9]{11}", title: "11 cifre" })}
        <div className="grid gap-4 sm:grid-cols-2">
          {field("address", "Indirizzo sede", "Via Roma 1", { maxLength: 160, autoComplete: "street-address" })}
          {field("city", "Città", "Roma", { maxLength: 80, autoComplete: "address-level2" })}
        </div>
      </>}

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3">
        {step > 2 && <Button type="button" variant="outline" size="lg" aria-label="Indietro" onClick={() => go((step - 1) as Step)}><ArrowLeft /></Button>}
        <Button type="submit" variant="hero" size="lg" className="flex-1" disabled={loading || (step === 4 && catalogLoading)}>
          {loading ? <><Loader2 className="size-4 animate-spin" />Invio in corso…</> : <>{step === 5 ? "Richiedi preventivo" : "Continua"}<ArrowRight /></>}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">Nessun impegno di acquisto.</p>
    </form>
  );
}
