import { draftBeforeLoad, draftHead } from "@/lib/draft-route";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Download,
  FileUp,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
  Users,
  Pin,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/tools/piano-contenuti")({
  beforeLoad: draftBeforeLoad,
  head: () => draftHead,
  head: () => ({
    meta: [
      { title: "Tool · Piano Contenuti — Desk Industries" },
      {
        name: "description",
        content:
          "Modulo guidato per costruire il piano contenuti social: anagrafica, posizionamento, post pinnati, planner settimanale e briefing Reel.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PianoContenutiPage,
});

const GIORNI = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"] as const;

type PlannerRow = {
  giorno: string;
  tipologia: string;
  formato: string;
  gancio: string;
  cta: string;
};

type Briefing = {
  titolo: string;
  tipologia: string;
  formato: string;
  cta: string;
  gancio: string;
  messaggio: string;
  location: string;
  editing: string;
};

type FormData = {
  clienteNome: string;
  brandNome: string;
  clienteEmail: string;
  clienteTel: string;
  profiloSocial: string;
  dataCompilazione: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  pinAutorevolezza: string;
  pinChiSei: string;
  pinTestimonianze: string;
  planner: PlannerRow[];
  briefings: Briefing[];
};

const emptyBriefing: Briefing = {
  titolo: "",
  tipologia: "",
  formato: "",
  cta: "",
  gancio: "",
  messaggio: "",
  location: "",
  editing: "",
};

const initialPlanner = (): PlannerRow[] =>
  GIORNI.map((g) => ({ giorno: g, tipologia: "", formato: "", gancio: "", cta: "" }));

const initialState = (email = "", name = ""): FormData => ({
  clienteNome: name,
  brandNome: "",
  clienteEmail: email,
  clienteTel: "",
  profiloSocial: "",
  dataCompilazione: new Date().toISOString().slice(0, 10),
  q1: "",
  q2: "",
  q3: "",
  q4: "",
  q5: "",
  q6: "",
  q7: "",
  pinAutorevolezza: "",
  pinChiSei: "",
  pinTestimonianze: "",
  planner: initialPlanner(),
  briefings: [{ ...emptyBriefing }],
});

const STORAGE_KEY = "desk:piano-contenuti:draft";

const QUESTIONS: Array<{ key: keyof FormData; label: string; n: string }> = [
  { key: "q1", label: "Perché ti dovrei seguire?", n: "01" },
  { key: "q2", label: "Cosa hai di unico?", n: "02" },
  { key: "q3", label: "Qual è il messaggio che vuoi mandare?", n: "03" },
  { key: "q4", label: "La tua storia: come hai iniziato?", n: "04" },
  { key: "q5", label: "Le tue passioni e la tua visione nel lavoro?", n: "05" },
  { key: "q6", label: "Descrivi il tuo cliente ideale.", n: "06" },
  { key: "q7", label: "Nicchia specifica fra i clienti ideali.", n: "07" },
];

function PianoContenutiPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<FormData>(() => initialState());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Auth gate
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({
        to: "/auth",
        search: { redirect: "/tools/piano-contenuti", mode: "login" },
        replace: true,
      });
    }
  }, [user, authLoading, navigate]);

  // Hydrate from localStorage or user defaults
  useEffect(() => {
    if (!user) return;
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<FormData>;
        setData((prev) => ({ ...prev, ...parsed }));
        return;
      } catch {
        /* ignore */
      }
    }
    setData(
      initialState(
        user.email ?? "",
        (user.user_metadata?.full_name as string) ?? "",
      ),
    );
  }, [user]);

  // Auto-save draft
  useEffect(() => {
    if (!user) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setSavedAt(new Date());
      } catch {
        /* ignore */
      }
    }, 600);
    return () => clearTimeout(id);
  }, [data, user]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const updatePlanner = (i: number, field: keyof PlannerRow, value: string) =>
    setData((d) => {
      const planner = [...d.planner];
      planner[i] = { ...planner[i], [field]: value };
      return { ...d, planner };
    });

  const updateBriefing = (i: number, field: keyof Briefing, value: string) =>
    setData((d) => {
      const briefings = [...d.briefings];
      briefings[i] = { ...briefings[i], [field]: value };
      return { ...d, briefings };
    });

  const addBriefing = () =>
    setData((d) => ({ ...d, briefings: [...d.briefings, { ...emptyBriefing }] }));

  const removeBriefing = (i: number) =>
    setData((d) => ({
      ...d,
      briefings: d.briefings.filter((_, idx) => idx !== i),
    }));

  const downloadDraft = async () => {
    try {
      const { buildContentPlanPdf, contentPlanPdfFilename } = await import(
        "@/lib/content-plan-pdf"
      );
      const pdf = buildContentPlanPdf(data);
      pdf.save(contentPlanPdfFilename(data));
      toast.success("PDF scaricato");
    } catch (err) {
      toast.error("Errore generazione PDF");
      console.error(err);
    }
  };

  const importDraft = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const m = /DESK_FORM_DATA\s*([\s\S]*?)\s*-->/.exec(text);
        const jsonText = m ? m[1] : text;
        const parsed = JSON.parse(jsonText) as Partial<FormData>;
        setData((d) => ({
          ...d,
          ...parsed,
          planner:
            Array.isArray(parsed.planner) && parsed.planner.length === 7
              ? (parsed.planner as PlannerRow[])
              : d.planner,
          briefings:
            Array.isArray(parsed.briefings) && parsed.briefings.length
              ? (parsed.briefings as Briefing[])
              : d.briefings,
        }));
        toast.success("Bozza importata");
      } catch {
        toast.error("File non valido");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const submit = async () => {
    if (!data.clienteEmail || !/.+@.+\..+/.test(data.clienteEmail)) {
      toast.error("Inserisci una email valida");
      return;
    }
    setSubmitting(true);
    try {
      const { data: sessionRes } = await supabase.auth.getSession();
      const token = sessionRes.session?.access_token;
      if (!token) throw new Error("Sessione scaduta — accedi di nuovo");

      // Genera PDF brandizzato
      const { buildContentPlanPdf, contentPlanPdfFilename } = await import(
        "@/lib/content-plan-pdf"
      );
      const pdf = buildContentPlanPdf(data);
      const pdfBase64 = pdf.output("datauristring").split(",")[1];
      const pdfFilename = contentPlanPdfFilename(data);

      const res = await fetch("/api/public/content-plan-submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...data, pdfBase64, pdfFilename }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Errore ${res.status}`);
      setSubmitted(true);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <section className="py-24">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-border bg-surface-elevated p-12"
          >
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-amber-soft">
              <CheckCircle2 className="size-8 text-amber" />
            </div>
            <h1 className="text-3xl font-display font-medium tracking-tight mb-3">
              Piano inviato al team
            </h1>
            <p className="text-muted-foreground mb-8">
              Marketing &amp; content lo ricevono ora. Ti scriviamo entro 2 giorni
              lavorativi per la call di allineamento.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/account">
                <Button variant="outline">Torna all'area clienti</Button>
              </Link>
              <Button
                variant="amber"
                onClick={() => {
                  setSubmitted(false);
                  setData(
                    initialState(
                      user.email ?? "",
                      (user.user_metadata?.full_name as string) ?? "",
                    ),
                  );
                }}
              >
                Compila un nuovo piano
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-20 pb-40">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <Link
          to="/account"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="size-4" /> Area clienti
        </Link>

        <div className="mb-10">
          <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-3">
            Tool gratuito · Desk Industries
          </p>
          <h1 className="text-4xl lg:text-5xl font-display font-medium tracking-tight">
            Piano Contenuti
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Modulo guidato in 5 sezioni. Compila anche solo parzialmente: la bozza
            si salva in automatico nel tuo browser. Quando sei pronto, invia tutto
            al team con un clic.
          </p>
        </div>

        <Accordion
          type="multiple"
          defaultValue={["s1"]}
          className="space-y-4"
        >
          {/* SECTION 1 — Anagrafica */}
          <Section value="s1" number="1" title="Anagrafica cliente" icon={User}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nome e cognome">
                <Input
                  value={data.clienteNome}
                  onChange={(e) => set("clienteNome", e.target.value)}
                  placeholder="Es. Mario Rossi"
                />
              </Field>
              <Field label="Nome del brand / attività">
                <Input
                  value={data.brandNome}
                  onChange={(e) => set("brandNome", e.target.value)}
                  placeholder="Es. Studio Rossi Nutrizione"
                />
              </Field>
              <Field label="Email di contatto" required>
                <Input
                  type="email"
                  value={data.clienteEmail}
                  onChange={(e) => set("clienteEmail", e.target.value)}
                  placeholder="nome@dominio.it"
                  required
                />
              </Field>
              <Field label="Telefono / WhatsApp" hint="Opzionale">
                <Input
                  value={data.clienteTel}
                  onChange={(e) => set("clienteTel", e.target.value)}
                />
              </Field>
              <Field label="Profilo social principale">
                <Input
                  value={data.profiloSocial}
                  onChange={(e) => set("profiloSocial", e.target.value)}
                  placeholder="@username"
                />
              </Field>
              <Field label="Data di compilazione">
                <Input
                  type="date"
                  value={data.dataCompilazione}
                  onChange={(e) => set("dataCompilazione", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          {/* SECTION 2 — Posizionamento */}
          <Section
            value="s2"
            number="2"
            title="Setup account · Intervista di posizionamento"
            icon={Users}
          >
            <p className="text-sm text-muted-foreground mb-6">
              Rispondi di getto. Non servono risposte perfette: servono risposte
              vere.
            </p>
            <div className="space-y-5">
              {QUESTIONS.map((q) => (
                <div key={q.key}>
                  <Label className="flex items-baseline gap-2 mb-2">
                    <span className="text-amber text-xs font-mono tracking-widest">
                      {q.n}
                    </span>
                    <span className="text-foreground font-medium">{q.label}</span>
                  </Label>
                  {q.key === "q7" ? (
                    <Input
                      value={(data[q.key] as string) ?? ""}
                      onChange={(e) => set(q.key as any, e.target.value as any)}
                      placeholder="Es. nutrizionista per vegani"
                    />
                  ) : (
                    <Textarea
                      value={(data[q.key] as string) ?? ""}
                      onChange={(e) => set(q.key as any, e.target.value as any)}
                      rows={3}
                    />
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* SECTION 3 — Post pinnati */}
          <Section
            value="s3"
            number="3"
            title="Setup account · Contenuti per i 3 post pinnati"
            icon={Pin}
          >
            <p className="text-sm text-muted-foreground mb-6">
              I tre post pinnati sono l'anteprima del profilo: autorevolezza,
              identità, prove sociali.
            </p>
            <div className="space-y-4">
              <PinCard
                title="Post 1 · Autorevolezza"
                desc="Perché sei rilevante per il target. Numeri, risultati, esperienza."
              >
                <Textarea
                  value={data.pinAutorevolezza}
                  onChange={(e) => set("pinAutorevolezza", e.target.value)}
                  rows={3}
                  placeholder="Punti di forza e credenziali"
                />
              </PinCard>
              <PinCard
                title="Post 2 · Chi sei"
                desc="Presentazione personale: mission, visione, perché fai quello che fai."
              >
                <Textarea
                  value={data.pinChiSei}
                  onChange={(e) => set("pinChiSei", e.target.value)}
                  rows={3}
                  placeholder="Breve presentazione"
                />
              </PinCard>
              <PinCard
                title="Post 3 · Testimonianze"
                desc="Prova sociale: messaggi, recensioni, risultati reali di clienti."
              >
                <Textarea
                  value={data.pinTestimonianze}
                  onChange={(e) => set("pinTestimonianze", e.target.value)}
                  rows={3}
                  placeholder="Materiali disponibili"
                />
              </PinCard>
            </div>
          </Section>

          {/* SECTION 4 — Planner */}
          <Section
            value="s4"
            number="4"
            title="Piano contenuti · Planner settimanale"
            icon={Calendar}
          >
            <p className="text-sm text-muted-foreground mb-2">
              Obiettivo minimo: 3 Reel a settimana, alternando le tipologie.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              <span className="text-foreground/80">Tipologia:</span> Educativo ·
              Dimostrativo · Story-telling &nbsp;·&nbsp;
              <span className="text-foreground/80">Formato:</span> Statico o
              Dinamico
            </p>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-surface-elevated text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left p-3 font-display font-medium">Giorno</th>
                    <th className="text-left p-3 font-display font-medium">Tipologia</th>
                    <th className="text-left p-3 font-display font-medium">Formato</th>
                    <th className="text-left p-3 font-display font-medium">Gancio / Titolo</th>
                    <th className="text-left p-3 font-display font-medium">CTA &amp; hashtag</th>
                  </tr>
                </thead>
                <tbody>
                  {data.planner.map((row, i) => (
                    <tr key={row.giorno} className="border-t border-border">
                      <td className="p-2 font-display font-semibold text-amber">{row.giorno}</td>
                      <td className="p-2">
                        <Select
                          value={row.tipologia || "_none"}
                          onValueChange={(v) =>
                            updatePlanner(i, "tipologia", v === "_none" ? "" : v)
                          }
                        >
                          <SelectTrigger className="h-9 border-transparent bg-transparent hover:bg-surface-elevated">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_none">—</SelectItem>
                            <SelectItem value="E - Educativo">E · Educativo</SelectItem>
                            <SelectItem value="D - Dimostrativo">D · Dimostrativo</SelectItem>
                            <SelectItem value="S - Story-telling">S · Story-telling</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Select
                          value={row.formato || "_none"}
                          onValueChange={(v) =>
                            updatePlanner(i, "formato", v === "_none" ? "" : v)
                          }
                        >
                          <SelectTrigger className="h-9 border-transparent bg-transparent hover:bg-surface-elevated">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_none">—</SelectItem>
                            <SelectItem value="Statico">Statico</SelectItem>
                            <SelectItem value="Dinamico">Dinamico</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input
                          value={row.gancio}
                          onChange={(e) => updatePlanner(i, "gancio", e.target.value)}
                          placeholder="Gancio/titolo"
                          className="h-9 border-transparent bg-transparent hover:bg-surface-elevated"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={row.cta}
                          onChange={(e) => updatePlanner(i, "cta", e.target.value)}
                          placeholder="CTA, #hashtag"
                          className="h-9 border-transparent bg-transparent hover:bg-surface-elevated"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* SECTION 5 — Briefing */}
          <Section
            value="s5"
            number="5"
            title="Piano contenuti · Briefing singoli Reel"
            icon={ClipboardList}
          >
            <p className="text-sm text-muted-foreground mb-6">
              Un blocco per ciascun Reel. Aggiungine quanti ne servono.
            </p>
            <div className="space-y-4">
              {data.briefings.map((b, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-surface-elevated p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-display tracking-[0.2em] text-amber uppercase">
                      Reel #{i + 1}
                    </p>
                    {data.briefings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBriefing(i)}
                        className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                      >
                        <Trash2 className="size-3.5" /> Rimuovi
                      </button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Titolo di lavoro">
                      <Input
                        value={b.titolo}
                        onChange={(e) => updateBriefing(i, "titolo", e.target.value)}
                      />
                    </Field>
                    <Field label="Tipologia">
                      <Select
                        value={b.tipologia || "_none"}
                        onValueChange={(v) =>
                          updateBriefing(i, "tipologia", v === "_none" ? "" : v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">—</SelectItem>
                          <SelectItem value="Educativo">Educativo</SelectItem>
                          <SelectItem value="Dimostrativo">Dimostrativo</SelectItem>
                          <SelectItem value="Story-telling">Story-telling</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Formato">
                      <Select
                        value={b.formato || "_none"}
                        onValueChange={(v) =>
                          updateBriefing(i, "formato", v === "_none" ? "" : v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">—</SelectItem>
                          <SelectItem value="Statico">Statico</SelectItem>
                          <SelectItem value="Dinamico">Dinamico</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="CTA finale">
                      <Input
                        value={b.cta}
                        onChange={(e) => updateBriefing(i, "cta", e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field label="Promessa / gancio nei primi 3 secondi">
                    <Input
                      value={b.gancio}
                      onChange={(e) => updateBriefing(i, "gancio", e.target.value)}
                    />
                  </Field>
                  <Field label="Messaggio centrale" hint="Una frase">
                    <Input
                      value={b.messaggio}
                      onChange={(e) => updateBriefing(i, "messaggio", e.target.value)}
                    />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Location / outfit">
                      <Input
                        value={b.location}
                        onChange={(e) => updateBriefing(i, "location", e.target.value)}
                      />
                    </Field>
                    <Field label="Note editing">
                      <Input
                        value={b.editing}
                        onChange={(e) => updateBriefing(i, "editing", e.target.value)}
                      />
                    </Field>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addBriefing}
                className="w-full rounded-2xl border border-dashed border-amber/60 bg-amber-soft px-4 py-3 text-sm font-display font-medium text-amber hover:brightness-110 transition flex items-center justify-center gap-2"
              >
                <Plus className="size-4" /> Aggiungi briefing Reel
              </button>
            </div>
          </Section>
        </Accordion>
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl bg-background/85 border-t border-border">
        <div className="mx-auto max-w-3xl px-5 lg:px-8 py-4 flex flex-wrap items-center gap-3">
          <p className="text-xs text-muted-foreground flex-1 min-w-full lg:min-w-0">
            {savedAt ? (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-amber" /> Bozza salvata
                automaticamente alle{" "}
                {savedAt.toLocaleTimeString("it-IT", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            ) : (
              "Bozza non ancora salvata"
            )}
          </p>
          <input
            id="planFile"
            type="file"
            accept=".json,.txt,application/json,text/plain"
            className="hidden"
            onChange={importDraft}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => document.getElementById("planFile")?.click()}
          >
            <FileUp className="size-4" /> Importa
          </Button>
          <Button variant="outline" size="sm" onClick={downloadDraft}>
            <Download className="size-4" /> Scarica PDF
          </Button>
          <Button
            variant="amber"
            size="sm"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? (
              "Invio..."
            ) : (
              <>
                <Send className="size-4" /> Invia al team
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}

function Section({
  value,
  number,
  title,
  icon: Icon,
  children,
}: {
  value: string;
  number: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="rounded-3xl border border-border bg-surface-elevated px-6 data-[state=open]:shadow-elevated"
    >
      <AccordionTrigger className="hover:no-underline py-5">
        <div className="flex items-center gap-4 text-left">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber text-amber-foreground font-display font-bold text-sm">
            {number}
          </span>
          <span className="flex items-center gap-2 font-display font-semibold text-base text-foreground">
            <Icon className="size-4 text-amber" />
            {title}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-6 pt-2">{children}</AccordionContent>
    </AccordionItem>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 mb-3">
      <Label className="text-xs font-display font-medium text-foreground/90">
        {label}
        {required && <span className="text-amber ml-1">*</span>}
        {hint && <span className="ml-2 text-muted-foreground font-normal">({hint})</span>}
      </Label>
      {children}
    </div>
  );
}

function PinCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-5">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="size-3.5 text-amber" />
        <h4 className="font-display font-semibold text-sm">{title}</h4>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{desc}</p>
      {children}
    </div>
  );
}
