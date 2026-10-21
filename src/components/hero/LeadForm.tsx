import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listServiceCatalog } from "@/lib/services-catalog.functions";
import { groupServices, type ServiceOption } from "@/lib/lead-intake";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const SECTORS = ["E-commerce", "Manifatturiero / B2B", "Servizi professionali", "Ristorazione / Hospitality", "Retail / Negozio fisico", "Salute e benessere", "Altro"];
const STORAGE_KEY = "desk-commercial-intake";
const emptyContact = { name: "", email: "", business: "", phone: "", sector: "E-commerce" };

export function LeadForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [contact, setContact] = useState(emptyContact);
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
    if (step === 2) void loadCatalog();
  }, [step]);

  function remember(token: string, registered: boolean) {
    setContinuation(token);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ continuation: token, contact, registered, expires: Date.now() + 86400000 }));
    } catch { /* The current form remains usable without storage. */ }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 2 && !selected.length) {
      setError("Seleziona almeno un servizio.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = step === 1
        ? { action: "register", ...contact, continuation: continuation || undefined }
        : { action: "quote", continuation, serviceCodes: selected, lookingFor };
      const response = await fetch("/api/public/lead-submit", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (typeof result.continuation === "string") remember(result.continuation, response.ok);
      if (!response.ok || !result.success) throw new Error(result.error || "Invio non riuscito. Riprova.");
      if (step === 1) {
        setStep(2);
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
      <p className="mt-3 text-muted-foreground">Il commerciale esaminerà i servizi scelti e ti contatterà con una proposta su misura.</p>
    </motion.div>
  );

  return (
    <form onSubmit={onSubmit} className="bg-surface-elevated/70 backdrop-blur p-6 lg:p-8 space-y-5" aria-label="Richiesta commerciale">
      <ol className="flex gap-5 border-b border-border pb-4 text-sm font-display">
        <li aria-current={step === 1 ? "step" : undefined} className={step === 1 ? "text-amber" : "text-muted-foreground"}>01 · I tuoi dati</li>
        <li aria-current={step === 2 ? "step" : undefined} className={step === 2 ? "text-amber" : "text-muted-foreground"}>02 · Servizi e obiettivo</li>
      </ol>
      {step === 1 ? <>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="name">Nome e cognome *</Label><Input id="name" autoComplete="name" required minLength={2} maxLength={80} value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Mario Rossi" /></div>
          <div className="space-y-2"><Label htmlFor="email">Email *</Label><Input id="email" type="email" autoComplete="email" required maxLength={255} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="mario@azienda.it" /></div>
          <div className="space-y-2"><Label htmlFor="business">Azienda</Label><Input id="business" autoComplete="organization" maxLength={120} value={contact.business} onChange={(e) => setContact({ ...contact, business: e.target.value })} placeholder="Nome attività" /></div>
          <div className="space-y-2"><Label htmlFor="phone">Telefono</Label><Input id="phone" type="tel" autoComplete="tel" maxLength={40} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+39..." /></div>
        </div>
        <div className="space-y-2"><Label htmlFor="sector">Settore *</Label>
          <Select value={contact.sector} onValueChange={(sector) => setContact({ ...contact, sector })}>
            <SelectTrigger id="sector"><SelectValue /></SelectTrigger>
            <SelectContent>{SECTORS.map((sector) => <SelectItem key={sector} value={sector}>{sector}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </> : <>
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
          <div className="min-w-0"><p className="font-medium break-words">{contact.business || contact.name}</p><p className="text-sm text-muted-foreground break-all">{contact.email}</p><p className="text-xs text-muted-foreground mt-1">{contact.sector}</p></div>
          <Button type="button" variant="ghost" size="icon" aria-label="Modifica dati" title="Modifica dati" onClick={() => { setStep(1); setError(null); }}><ArrowLeft /></Button>
        </div>
        {catalogLoading ? <div role="status" className="flex gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Caricamento servizi…</div> : options.length ?
          <div className="space-y-5 max-h-96 overflow-y-auto pr-2">{groupServices(options).map(([category, services]) => <fieldset key={category} className="space-y-3">
            <legend className="text-sm font-display font-semibold text-amber mb-3">{category}</legend>
            {services.map((service) => <div key={service.code} className="flex items-start gap-3">
              <Checkbox id={`service-${service.code}`} checked={selected.includes(service.code)} disabled={loading || (selected.length >= 30 && !selected.includes(service.code))} onCheckedChange={(checked) => setSelected((current) => checked ? [...current, service.code] : current.filter((code) => code !== service.code))} className="mt-0.5" />
              <Label htmlFor={`service-${service.code}`} className="text-sm leading-5 cursor-pointer">{service.name}</Label>
            </div>)}
          </fieldset>)}</div>
          : <div role="status" className="space-y-3"><p className="text-sm text-muted-foreground">Il catalogo servizi non è disponibile al momento.</p><Button type="button" variant="outline" size="sm" onClick={loadCatalog}>Riprova</Button></div>}
        <div className="space-y-2"><Label htmlFor="lookingFor">Raccontaci il tuo obiettivo *</Label><Textarea id="lookingFor" required minLength={5} maxLength={500} rows={3} value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} placeholder="Cosa vorresti ottenere nei prossimi 6 mesi?" /></div>
      </>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading || (step === 2 && (catalogLoading || !options.length))}>
        {loading ? <><Loader2 className="size-4 animate-spin" />Invio in corso…</> : <>{step === 1 ? "Continua" : "Richiedi preventivo"}<ArrowRight /></>}
      </Button>
      <p className="text-xs text-muted-foreground text-center">Nessun impegno di acquisto.</p>
    </form>
  );
}
