import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, Store, UtensilsCrossed, Scissors, Briefcase, Building2, Loader2, Globe, Wand2, MapPin, AlertTriangle } from "lucide-react";
import { createFolliaDraft, checkFolliaSubdomain, prefillFolliaFromUrls } from "@/lib/follia.functions";


export const Route = createFileRoute("/follia")({
  component: FolliaLanding,
  head: () => ({
    meta: [
      { title: "Foll.IA — Il tuo sito web in 30 secondi | Desk Industries" },
      { name: "description", content: "Crea il sito vetrina della tua attività con l'IA. Gratis fino alla pubblicazione, poi 19€/mese. Hosting, sottodominio e dashboard inclusi." },
      { property: "og:title", content: "Foll.IA — Il tuo sito web in 30 secondi" },
      { property: "og:description", content: "Genera un sito vetrina con l'IA. Poi modifica e pubblica con un click." },
    ],
  }),
});

const BUSINESS_TYPES = [
  { id: "restaurant", label: "Ristorante / Bar", icon: UtensilsCrossed, hint: "Menù, prezzi, prenotazioni tavoli" },
  { id: "retail_shop", label: "Negozio al dettaglio", icon: Store, hint: "Vetrina prodotti (no e-commerce)" },
  { id: "barbershop_salon", label: "Barbiere / Salone", icon: Scissors, hint: "Listino servizi e appuntamenti" },
  { id: "professional", label: "Studio professionale", icon: Briefcase, hint: "Servizi e contatti" },
  { id: "other", label: "Altra attività locale", icon: Building2, hint: "Sito vetrina classico" },
] as const;

type BusinessTypeId = typeof BUSINESS_TYPES[number]["id"];

function FolliaLanding() {
  const submit = useServerFn(createFolliaDraft);
  const checkSub = useServerFn(checkFolliaSubdomain);
  const prefill = useServerFn(prefillFolliaFromUrls);

  const [step, setStep] = useState<"intro" | "prefill" | "form" | "success">("intro");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subStatus, setSubStatus] = useState<{ checking: boolean; available?: boolean; reason?: string }>({ checking: false });
  const [createdSiteId, setCreatedSiteId] = useState<string | null>(null);
  const stepSectionRef = useRef<HTMLDivElement | null>(null);

  // Step "prefill"
  const [prefillUrls, setPrefillUrls] = useState({ oldSiteUrl: "", inspirationUrl: "", gmbUrl: "" });
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [prefillError, setPrefillError] = useState<string | null>(null);
  const [prefillSources, setPrefillSources] = useState<Array<{ url: string; kind: string; ok: boolean; error?: string }>>([]);
  const [prefilledFields, setPrefilledFields] = useState<Set<string>>(new Set());
  const [prefillAttempted, setPrefillAttempted] = useState(false);

  useEffect(() => {
    if (step !== "intro" && stepSectionRef.current) {
      stepSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  const [form, setForm] = useState({
    businessType: "" as BusinessTypeId | "",
    businessName: "",
    subdomain: "",
    email: "",
    city: "",
    address: "",
    phone: "",
    description: "",
    services: "",
    openingHours: "",
    primaryColor: "#6d28d9",
    secondaryColor: "#f59e0b",
    notes: "",
  });

  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function onSubdomainBlur() {
    const value = form.subdomain.trim().toLowerCase();
    if (!value) return;
    setSubStatus({ checking: true });
    try {
      const r = await checkSub({ data: { subdomain: value } });
      setSubStatus({ checking: false, available: r.available, reason: r.reason });
    } catch {
      setSubStatus({ checking: false });
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.businessType) {
      setError("Scegli prima il tipo di attività.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submit({ data: { ...form, businessType: form.businessType as BusinessTypeId } });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setCreatedSiteId(res.siteId);
      setStep("success");
    } catch (err: any) {
      setError(err?.message || "Errore imprevisto. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }

  async function runPrefill() {
    setPrefillError(null);
    const hasAny = prefillUrls.oldSiteUrl || prefillUrls.inspirationUrl || prefillUrls.gmbUrl;
    if (!hasAny) {
      setPrefillAttempted(false);
      setStep("form");
      return;
    }
    setPrefillLoading(true);
    setPrefillAttempted(true);
    try {
      const res = await prefill({ data: prefillUrls });
      setPrefillSources(res.sources || []);
      const d = (res.data || {}) as Partial<{
        business_type_guess: BusinessTypeId;
        business_name: string;
        city: string;
        address: string;
        phone: string;
        description: string;
        services: string;
        opening_hours: string;
        primary_color: string;
        secondary_color: string;
        tone_notes: string;
        subdomain_suggestion: string;
      }>;
      const filled = new Set<string>();
      setForm((p) => {
        const next = { ...p };
        const setIf = (key: keyof typeof p, val: unknown) => {
          if (typeof val === "string" && val.trim() && !next[key]) {
            (next[key] as string) = val;
            filled.add(key as string);
          }
        };
        if (d.business_type_guess && !next.businessType) {
          next.businessType = d.business_type_guess as BusinessTypeId;
          filled.add("businessType");
        }
        setIf("businessName", d.business_name);
        setIf("city", d.city);
        setIf("address", d.address);
        setIf("phone", d.phone);
        setIf("description", d.description);
        setIf("services", d.services);
        setIf("openingHours", d.opening_hours);
        if (d.primary_color && /^#[0-9a-f]{6}$/i.test(d.primary_color)) {
          next.primaryColor = d.primary_color;
          filled.add("primaryColor");
        }
        if (d.secondary_color && /^#[0-9a-f]{6}$/i.test(d.secondary_color)) {
          next.secondaryColor = d.secondary_color;
          filled.add("secondaryColor");
        }
        if (d.subdomain_suggestion && !next.subdomain) {
          next.subdomain = d.subdomain_suggestion as string;
          filled.add("subdomain");
        }
        if (d.tone_notes) {
          next.notes = next.notes ? next.notes : `Tono di voce/stile: ${d.tone_notes}`;
          filled.add("notes");
        }
        return next;
      });
      setPrefilledFields(filled);
      setStep("form");
    } catch (err: any) {
      setPrefillError(err?.message || "Non sono riuscito a leggere i link. Puoi compilare a mano.");
    } finally {
      setPrefillLoading(false);
    }
  }

  const gmbIsShortlink = /^(https?:\/\/)?(share\.google|goo\.gl\/maps|maps\.app\.goo\.gl)\//i.test(prefillUrls.gmbUrl.trim());

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.12),transparent_55%)]" />
        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-amber/10 text-amber border border-amber/30 mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Powered by IA · Generazione gratuita
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.05]">
              Il tuo sito web pronto<br />in <span className="text-amber">30 secondi</span>.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
              Racconta la tua attività al nostro IA. Riceverai un sito vetrina già pronto, ottimizzato SEO,
              che potrai pubblicare subito o personalizzare con il nostro team.
            </p>

            {step === "intro" && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setStep("prefill")}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-amber text-amber-foreground font-semibold hover:opacity-90 transition shadow-lg shadow-amber/20"
                >
                  Crea il mio sito gratis <ArrowRight className="w-4 h-4" />
                </button>
                <a href="#how" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-border text-foreground/80 hover:bg-surface-elevated transition">
                  Come funziona
                </a>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {step === "intro" && (
        <>
          <section id="how" className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-6">
            {[
              { n: "1", t: "Compila il form", d: "Tipo di attività, nome, contatti, qualche dettaglio. Bastano 2 minuti." },
              { n: "2", t: "L'IA genera il sito", d: "Contenuti, struttura, SEO. Ricevi un link per vederlo in anteprima." },
              { n: "3", t: "Pubblica o personalizza", d: "Online subito a 19€/mese, oppure richiedi modifiche per 297€ una tantum." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl p-6 bg-surface-elevated border border-border/40">
                <div className="w-9 h-9 rounded-lg bg-amber/10 text-amber font-bold flex items-center justify-center mb-4">{s.n}</div>
                <h3 className="font-display text-xl font-semibold mb-2">{s.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </section>

          <section className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-6">
            <PricingCard
              title="Pubblica subito"
              price="19€"
              period="/mese"
              tagline="Sito generato dall'IA online in pochi minuti, senza modifiche."
              features={["Hosting incluso", "Sottodominio dedicato", "Dashboard cliente (orari, mappa, listino)", "SSL e backup automatici", "Aggiornamenti del template"]}
            />
            <PricingCard
              highlighted
              title="Personalizza con il team"
              price="297€"
              period="una tantum"
              tagline="+ 19€/mese dopo. Richiedi modifiche, immagini, sezioni extra prima della pubblicazione."
              features={["Tutto del piano base", "Modifiche su misura prima del go-live", "Tempi di risposta prioritari", "Revisione testi e immagini", "Ticket assistenza dedicati"]}
            />
          </section>
        </>
      )}

      {step === "prefill" && (
        <section ref={stepSectionRef} className="max-w-2xl mx-auto px-6 py-12 md:py-16 scroll-mt-20">
          <div className="rounded-2xl border border-border/40 bg-surface-elevated p-6 md:p-10">
            <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-amber/10 text-amber border border-amber/30 mb-5">
              <Wand2 className="w-3.5 h-3.5" /> Compila per me (opzionale)
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Partiamo dai tuoi link?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Incolla uno o più link: l'IA legge i contenuti e pre-compila il form per te. Potrai sempre rivedere e correggere prima di generare il sito. Tutti i campi sono opzionali.
            </p>

            <div className="space-y-4">
              <PrefillUrlField
                icon={Globe}
                label="URL del tuo sito attuale"
                hint="Da qui prendiamo nome, contatti, servizi, descrizione."
                placeholder="https://www.tuosito.it"
                value={prefillUrls.oldSiteUrl}
                onChange={(v) => setPrefillUrls((p) => ({ ...p, oldSiteUrl: v }))}
              />
              <PrefillUrlField
                icon={Sparkles}
                label="URL di un sito che ti piace"
                hint="Solo per ispirazione: colori e tono di voce. Non copiamo i contenuti."
                placeholder="https://www.sito-che-mi-piace.com"
                value={prefillUrls.inspirationUrl}
                onChange={(v) => setPrefillUrls((p) => ({ ...p, inspirationUrl: v }))}
              />
              <PrefillUrlField
                icon={MapPin}
                label="Link del tuo profilo Google My Business"
                hint="Indirizzo, telefono, orari dalla tua scheda Google Maps."
                placeholder="https://www.google.com/maps/place/…"
                value={prefillUrls.gmbUrl}
                onChange={(v) => setPrefillUrls((p) => ({ ...p, gmbUrl: v }))}
              />
              {gmbIsShortlink && (
                <div className="rounded-lg border border-amber/30 bg-amber/5 px-3 py-2 text-xs text-amber flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>I link condivisi (share.google, maps.app.goo.gl) non sono leggibili in automatico. Apri la scheda su Google Maps da browser desktop e copia l'URL completo (quello che inizia con <code>https://www.google.com/maps/place/…</code>).</span>
                </div>
              )}
            </div>

            {prefillError && <p className="text-sm text-destructive mt-4">{prefillError}</p>}

            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-6 mt-6 border-t border-border/40">
              <button
                type="button"
                onClick={() => { setPrefillUrls({ oldSiteUrl: "", inspirationUrl: "", gmbUrl: "" }); setPrefillAttempted(false); setStep("form"); }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Salto, compilo a mano
              </button>
              <button
                type="button"
                onClick={runPrefill}
                disabled={prefillLoading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber text-amber-foreground font-semibold disabled:opacity-60 hover:opacity-90 transition shadow-lg shadow-amber/20"
              >
                {prefillLoading ? <><Loader2 className="w-4 h-4 animate-spin"/> Sto leggendo i tuoi link…</> : <>Compila per me <Wand2 className="w-4 h-4"/></>}
              </button>
            </div>
          </div>
        </section>
      )}

      {step === "form" && (
        <section ref={stepSectionRef} className="max-w-3xl mx-auto px-6 py-12 scroll-mt-20">
          {prefilledFields.size > 0 ? (
            <div className="mb-5 rounded-xl border border-amber/30 bg-amber/5 p-4 flex items-start gap-3">
              <Wand2 className="w-4 h-4 text-amber mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Ho compilato {prefilledFields.size} {prefilledFields.size === 1 ? "campo" : "campi"} per te.</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Controlla che tutto sia corretto, poi modifica o completa quello che vuoi. Le fonti lette: {prefillSources.filter(s => s.ok).map(s => s.kind).join(", ") || "nessuna"}{prefillSources.some(s => !s.ok) ? ` · non lette: ${prefillSources.filter(s => !s.ok).map(s => s.kind).join(", ")}` : ""}.
                </p>
              </div>
            </div>
          ) : prefillAttempted ? (
            <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Non sono riuscito a estrarre nulla dai tuoi link.</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Probabilmente erano shortlink di Google Maps, pagine caricate via JavaScript o protette. Nessun problema: compila i campi qui sotto a mano, ci vogliono due minuti.
                </p>
              </div>
            </div>
          ) : null}
          <form onSubmit={onSubmit} className="space-y-8 rounded-2xl border border-border/40 bg-surface-elevated p-6 md:p-10">
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">Che tipo di attività hai?</h2>
              <p className="text-sm text-muted-foreground mb-5">Le sezioni del sito si adattano alla tua scelta.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {BUSINESS_TYPES.map((t) => {
                  const Icon = t.icon;
                  const active = form.businessType === t.id;
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => update("businessType", t.id)}
                      className={`text-left rounded-xl border p-4 transition ${active ? "border-amber bg-amber/10" : "border-border hover:border-foreground/30"}`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${active ? "text-amber" : "text-muted-foreground"}`} />
                      <div className="font-semibold text-sm">{t.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{t.hint}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Section title="La tua attività">
              <Field label="Nome attività *" required value={form.businessName} onChange={(v) => update("businessName", v)} placeholder="Bar da Mario" />
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Città" value={form.city} onChange={(v) => update("city", v)} placeholder="Milano" />
                <Field label="Indirizzo" value={form.address} onChange={(v) => update("address", v)} placeholder="Via Roma 12" />
              </div>
              <Field label="Telefono" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+39 02 1234567" />
              <Textarea label="Descrivi l'attività in poche frasi" value={form.description} onChange={(v) => update("description", v)} placeholder="Bar di quartiere aperto dal 1985..." />
              <Textarea label="Servizi / prodotti / piatti chiave" value={form.services} onChange={(v) => update("services", v)} placeholder="Cappuccino, brioches artigianali, aperitivo serale..." />
              <Field label="Orari indicativi" value={form.openingHours} onChange={(v) => update("openingHours", v)} placeholder="Lun-Sab 7:00-20:00, Dom chiuso" />
            </Section>

            <Section title="Sottodominio ed email">
              <div>
                <label className="block text-sm font-medium mb-1.5">Sottodominio *</label>
                <div className="flex items-center gap-2">
                  <input
                    required
                    value={form.subdomain}
                    onChange={(e) => update("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    onBlur={onSubdomainBlur}
                    placeholder="bar-da-mario"
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-amber"
                  />
                  <span className="text-muted-foreground text-sm">.deskinc.app</span>
                </div>
                {subStatus.checking && <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Controllo…</p>}
                {subStatus.available === true && <p className="text-xs text-emerald-500 mt-1.5">Disponibile</p>}
                {subStatus.available === false && <p className="text-xs text-destructive mt-1.5">{subStatus.reason || "Non disponibile"}</p>}
              </div>
              <Field type="email" label="La tua email *" required value={form.email} onChange={(v) => update("email", v)} placeholder="mario@example.com" />
              <p className="text-xs text-muted-foreground">Ti manderemo il link per vedere l'anteprima del sito.</p>
            </Section>

            <Section title="Colori (opzionale)">
              <div className="grid grid-cols-2 gap-4">
                <ColorField label="Primario" value={form.primaryColor} onChange={(v) => update("primaryColor", v)} />
                <ColorField label="Secondario" value={form.secondaryColor} onChange={(v) => update("secondaryColor", v)} />
              </div>
            </Section>

            <Textarea label="Note per il team (opzionale)" value={form.notes} onChange={(v) => update("notes", v)} placeholder="Vorrei un tono giovane, focus sull'asporto..." />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-border/40">
              <button type="button" onClick={() => setStep("intro")} className="px-5 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground">
                Annulla
              </button>
              <button
                type="submit"
                disabled={submitting || subStatus.available === false}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-amber text-amber-foreground font-semibold disabled:opacity-60 hover:opacity-90 transition"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin"/> Genero il sito…</> : <>Genera il mio sito <Sparkles className="w-4 h-4"/></>}
              </button>
            </div>
          </form>
        </section>
      )}

      {step === "success" && (
        <section className="max-w-2xl mx-auto px-6 py-20 text-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </motion.div>
          <h2 className="font-display text-3xl font-bold mb-3">Il tuo sito è pronto in anteprima</h2>
          <p className="text-muted-foreground mb-8">
            Abbiamo mandato un link a <strong>{form.email}</strong>. Crea il tuo account per vederlo, modificarlo e pubblicarlo.
          </p>
          <Link
            to="/auth"
            search={{ mode: "signup", redirect: createdSiteId ? `/account/sites/${createdSiteId}` : "/account", email: form.email } as any}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-amber text-amber-foreground font-semibold hover:opacity-90 transition"
          >
            Crea il mio account <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      )}
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-amber"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-amber resize-y"
      />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-12 h-10 rounded border border-border bg-background cursor-pointer" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono" />
      </div>
    </div>
  );
}

function PricingCard({ title, price, period, tagline, features, highlighted }: { title: string; price: string; period: string; tagline: string; features: string[]; highlighted?: boolean }) {
  return (
    <div className={`rounded-2xl p-7 border ${highlighted ? "border-amber bg-amber/5" : "border-border bg-surface-elevated"}`}>
      <h3 className="font-display text-2xl font-bold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-5">{tagline}</p>
      <div className="flex items-end gap-1 mb-6">
        <span className="font-display text-4xl font-bold">{price}</span>
        <span className="text-muted-foreground text-sm pb-1.5">{period}</span>
      </div>
      <ul className="space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${highlighted ? "text-amber" : "text-muted-foreground"}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PrefillUrlField({ icon: Icon, label, hint, placeholder, value, onChange }: { icon: React.ComponentType<{ className?: string }>; label: string; hint: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
        {label}
      </label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-amber"
      />
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}
