import { draftBeforeLoad } from "@/lib/draft-route";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Mail,
  MessageCircle,
  Phone,
  Globe,
  Instagram,
  Sparkles,
  Target,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/contatti")({
  beforeLoad: draftBeforeLoad,
  head: () => ({
    meta: [
      { title: "Contatti — Richiedi una proposta su misura | Desk Industries" },
      {
        name: "description",
        content:
          "Compila il modulo intelligente di Desk Industries: ti rispondiamo entro 24h con una proposta cucita sulla tua attività.",
      },
      { property: "og:title", content: "Contatti — Desk Industries" },
      {
        property: "og:description",
        content: "Modulo qualificato in 4 passi + creazione del tuo account sulla piattaforma.",
      },
    ],
  }),
  component: ContattiPage,
});

const SERVICES = [
  { id: "coco-web", label: "Coco Web", icon: Globe, hint: "Sito, SEO, automazioni" },
  { id: "coco-social", label: "Coco Social", icon: Instagram, hint: "Contenuti, format, branding" },
  { id: "cocoaching", label: "CoCoaching", icon: GraduationCap, hint: "5 ore di coaching" },
  { id: "cocoaching-executive", label: "CoCoaching Executive", icon: Sparkles, hint: "10 ore con il founder" },
] as const;

const SECTORS = [
  { value: "barbieri", label: "Barbieri" },
  { value: "tatuatori", label: "Tatuatori" },
  { value: "pizzerie", label: "Pizzerie" },
  { value: "centri-estetici", label: "Centri estetici" },
  { value: "palestre", label: "Palestre" },
  { value: "studi-professionisti", label: "Studi di Professionisti" },
  { value: "altro", label: "Altro" },
];

const GOALS = [
  { id: "nuovi-clienti", label: "Acquisire nuovi clienti" },
  { id: "fidelizzare", label: "Fidelizzare i clienti esistenti" },
  { id: "autorevolezza", label: "Costruire autorevolezza online" },
  { id: "vendite-online", label: "Aumentare le vendite online" },
  { id: "automatizzare", label: "Automatizzare processi ripetitivi" },
  { id: "team", label: "Formare il team interno" },
];

const WEB_NEEDS = [
  { id: "nuovo-sito", label: "Nuovo sito web" },
  { id: "redesign", label: "Restyling del sito esistente" },
  { id: "seo", label: "SEO / posizionamento Google" },
  { id: "ecommerce", label: "Ecommerce / vendita online" },
  { id: "automazioni", label: "Automazioni e integrazioni" },
  { id: "compliance", label: "Compliance legale (privacy, cookie)" },
];

const SOCIAL_NEEDS = [
  { id: "contenuti", label: "Pubblicazione contenuti continuativa" },
  { id: "produzione", label: "Produzione foto/video" },
  { id: "format", label: "Ideazione format proprietari" },
  { id: "branding", label: "Branding e identità visiva" },
  { id: "ads", label: "Campagne pubblicitarie social" },
  { id: "ricerca", label: "Ricerca di mercato e competitor" },
];

const submitSchema = z.object({
  selectedServices: z.array(z.string()).min(1, "Seleziona almeno un servizio"),
  expectedGoals: z.array(z.string()).min(1, "Seleziona almeno un obiettivo"),
  lookingFor: z.string().trim().min(5, "Spiega in poche parole").max(500),
  name: z.string().trim().min(2, "Inserisci il tuo nome").max(80),
  email: z.string().trim().email("Email non valida").max(255),
  password: z.string().min(8, "Minimo 8 caratteri").max(72),
  sector: z.string().min(1, "Seleziona un settore"),
});

type Step = 0 | 1 | 2 | 3;

const TOTAL_STEPS = 4;

function ContattiPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [expectedGoals, setExpectedGoals] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState("");

  const [hasWebsite, setHasWebsite] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [webNeeds, setWebNeeds] = useState<string[]>([]);

  const [hasSocial, setHasSocial] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [socialNeeds, setSocialNeeds] = useState<string[]>([]);

  const [coachingFocus, setCoachingFocus] = useState("");
  const [companyResources, setCompanyResources] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [sector, setSector] = useState("");
  const [contactPreference, setContactPreference] = useState<"email" | "phone" | "whatsapp">("email");
  const [password, setPassword] = useState("");
  const [createAccount, setCreateAccount] = useState(true);
  const [message, setMessage] = useState("");

  const showWeb = selectedServices.includes("coco-web");
  const showSocial = selectedServices.includes("coco-social");
  const showCoaching =
    selectedServices.includes("cocoaching") ||
    selectedServices.includes("cocoaching-executive");

  // Build dynamic step list based on selections
  const dynamicSteps = useMemo(() => {
    const steps: { key: string; title: string }[] = [
      { key: "services", title: "Aree di intervento" },
      { key: "goals", title: "Obiettivi" },
    ];
    if (showWeb) steps.push({ key: "web", title: "Coco Web" });
    if (showSocial) steps.push({ key: "social", title: "Coco Social" });
    if (showCoaching) steps.push({ key: "coaching", title: "Coaching" });
    steps.push({ key: "contact", title: "I tuoi dati" });
    return steps;
  }, [showWeb, showSocial, showCoaching]);

  const currentKey = dynamicSteps[step]?.key ?? "services";
  const isLastStep = step === dynamicSteps.length - 1;
  const progress = Math.round(((step + 1) / dynamicSteps.length) * 100);

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const canProceed = (): boolean => {
    switch (currentKey) {
      case "services":
        return selectedServices.length > 0;
      case "goals":
        return expectedGoals.length > 0 && lookingFor.trim().length >= 5;
      case "web":
        return hasWebsite !== "" && webNeeds.length > 0;
      case "social":
        return hasSocial !== "" && socialNeeds.length > 0;
      case "coaching":
        return coachingFocus.trim().length >= 5;
      case "contact":
        return (
          name.trim().length >= 2 &&
          /\S+@\S+\.\S+/.test(email) &&
          sector !== "" &&
          (!createAccount || password.length >= 8)
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error("Completa i campi richiesti per continuare");
      return;
    }
    if (!isLastStep) setStep((s) => Math.min(s + 1, dynamicSteps.length - 1) as Step);
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1) as Step);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canProceed()) {
      toast.error("Controlla i campi del modulo");
      return;
    }

    const payload = {
      name,
      email,
      phone,
      business,
      sector,
      selectedServices,
      expectedGoals,
      lookingFor,
      hasWebsite: showWeb ? hasWebsite : undefined,
      websiteUrl: showWeb ? websiteUrl : undefined,
      webNeeds: showWeb ? webNeeds : [],
      hasSocial: showSocial ? hasSocial : undefined,
      socialLinks: showSocial ? socialLinks : undefined,
      socialNeeds: showSocial ? socialNeeds : [],
      coachingFocus: showCoaching ? coachingFocus : undefined,
      companyResources: showCoaching ? companyResources : undefined,
      contactPreference,
      message,
      createAccount,
      password: createAccount ? password : undefined,
      fullName: name,
    };

    const validation = submitSchema.safeParse(payload);
    if (!validation.success) {
      toast.error("Controlla i campi del modulo");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/public/lead-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Errore durante l'invio");
      }

      // If account was created, sign the user in immediately
      if (data.accountCreated && createAccount) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) {
          console.warn("Auto sign-in failed:", signInErr.message);
        }
      }

      setSubmitted(true);
      toast.success("Richiesta inviata! Ti rispondiamo entro 24h.");

      // If signed in, offer to navigate to account after a brief delay
      if (data.accountCreated) {
        setTimeout(() => {
          navigate({ to: "/account" });
        }, 2500);
      }
    } catch (err) {
      const msg = (err as Error).message;
      toast.error(msg || "Errore durante l'invio. Riprova.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="min-h-[70vh] flex items-center justify-center px-5 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full p-10 lg:p-14 rounded-3xl border border-amber bg-surface-elevated text-center"
        >
          <div className="size-16 rounded-full bg-amber-soft flex items-center justify-center mx-auto mb-6">
            <Check className="size-8 text-amber" />
          </div>
          <h2 className="text-3xl font-display font-semibold mb-3">
            Richiesta ricevuta
          </h2>
          <p className="text-muted-foreground mb-6">
            Ti abbiamo mandato una mail di conferma. Un membro del team Desk Industries
            ti risponderà entro <strong className="text-foreground">24 ore lavorative</strong>.
          </p>
          {createAccount && (
            <p className="text-sm text-muted-foreground">
              Stiamo aprendo la tua area personale…
            </p>
          )}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="amber">
              <a href="/account">Vai alla mia area</a>
            </Button>
            <Button asChild variant="outline">
              <a
                href="https://wa.me/393493251100?text=Ho%20appena%20inviato%20il%20modulo%20su%20deskindustries.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle /> Scrivici su WhatsApp
              </a>
            </Button>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grain pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-20 pb-12 lg:pt-28 lg:pb-16">
          <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
            Contatti — Modulo intelligente
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium leading-[0.95] tracking-tight text-balance max-w-4xl">
            Raccontaci la tua attività in{" "}
            <span className="italic text-amber font-normal">4 passi</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Più ci dici, più la nostra proposta sarà cucita addosso a te.
            A fine modulo crei il tuo account per seguire la richiesta.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-8">
              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-display tracking-wider uppercase text-muted-foreground">
                    Passo {step + 1} di {dynamicSteps.length} · {dynamicSteps[step]?.title}
                  </span>
                  <span className="text-amber font-medium">{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                  <motion.div
                    className="h-full bg-amber"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </div>

              <form
                onSubmit={isLastStep ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}
                className="p-7 lg:p-10 rounded-3xl border border-border bg-surface-elevated"
                noValidate
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentKey}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                  >
                    {currentKey === "services" && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-display font-medium tracking-tight mb-2">
                            Su quali aree vuoi lavorare?
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Seleziona una o più aree. Le domande successive si adattano alle tue scelte.
                          </p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {SERVICES.map((s) => {
                            const Icon = s.icon;
                            const active = selectedServices.includes(s.id);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => toggle(selectedServices, setSelectedServices, s.id)}
                                className={`text-left p-5 rounded-2xl border transition-all ${
                                  active
                                    ? "border-amber bg-amber-soft shadow-amber"
                                    : "border-border bg-background hover:border-foreground/40"
                                }`}
                                aria-pressed={active}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-amber text-amber-foreground" : "bg-surface-elevated text-muted-foreground"}`}>
                                    <Icon className="size-5" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-display font-semibold">{s.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{s.hint}</p>
                                  </div>
                                  {active && <Check className="size-5 text-amber shrink-0" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {currentKey === "goals" && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-display font-medium tracking-tight mb-2">
                            Quali risultati vuoi ottenere?
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Seleziona tutti gli obiettivi rilevanti per la tua attività.
                          </p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {GOALS.map((g) => {
                            const active = expectedGoals.includes(g.id);
                            return (
                              <label
                                key={g.id}
                                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                  active ? "border-amber bg-amber-soft" : "border-border bg-background hover:border-foreground/40"
                                }`}
                              >
                                <Checkbox
                                  checked={active}
                                  onCheckedChange={() => toggle(expectedGoals, setExpectedGoals, g.id)}
                                  className="mt-0.5"
                                />
                                <span className="text-sm font-medium">{g.label}</span>
                              </label>
                            );
                          })}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lookingFor">Cosa stai cercando esattamente? *</Label>
                          <Textarea
                            id="lookingFor"
                            value={lookingFor}
                            onChange={(e) => setLookingFor(e.target.value)}
                            maxLength={500}
                            rows={4}
                            placeholder="Es: voglio rifare il sito, riempire l'agenda, smettere di gestire i social da solo…"
                          />
                          <p className="text-xs text-muted-foreground">
                            {lookingFor.length}/500
                          </p>
                        </div>
                      </div>
                    )}

                    {currentKey === "web" && (
                      <div className="space-y-6">
                        <div className="flex items-start gap-3">
                          <div className="size-10 rounded-lg bg-amber-soft flex items-center justify-center shrink-0">
                            <Globe className="size-5 text-amber" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-display font-medium tracking-tight">
                              Coco Web
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                              Capiamo da dove parti per la componente web.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label>Hai già un sito web? *</Label>
                          <RadioGroup value={hasWebsite} onValueChange={setHasWebsite} className="grid sm:grid-cols-2 gap-3">
                            {[
                              { v: "no", l: "No, non ce l'ho" },
                              { v: "yes-good", l: "Sì, e funziona bene" },
                              { v: "yes-needs-improvement", l: "Sì, ma va migliorato" },
                              { v: "wip", l: "Lo sto facendo ora" },
                            ].map((o) => (
                              <label
                                key={o.v}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                  hasWebsite === o.v ? "border-amber bg-amber-soft" : "border-border bg-background hover:border-foreground/40"
                                }`}
                              >
                                <RadioGroupItem value={o.v} />
                                <span className="text-sm">{o.l}</span>
                              </label>
                            ))}
                          </RadioGroup>
                        </div>

                        {(hasWebsite === "yes-good" || hasWebsite === "yes-needs-improvement") && (
                          <div className="space-y-2">
                            <Label htmlFor="websiteUrl">URL del tuo sito attuale</Label>
                            <Input
                              id="websiteUrl"
                              type="url"
                              value={websiteUrl}
                              onChange={(e) => setWebsiteUrl(e.target.value)}
                              placeholder="https://"
                              maxLength={255}
                            />
                          </div>
                        )}

                        <div className="space-y-3">
                          <Label>Su cosa serve lavorare? *</Label>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {WEB_NEEDS.map((n) => {
                              const active = webNeeds.includes(n.id);
                              return (
                                <label
                                  key={n.id}
                                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                    active ? "border-amber bg-amber-soft" : "border-border bg-background hover:border-foreground/40"
                                  }`}
                                >
                                  <Checkbox
                                    checked={active}
                                    onCheckedChange={() => toggle(webNeeds, setWebNeeds, n.id)}
                                    className="mt-0.5"
                                  />
                                  <span className="text-sm">{n.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentKey === "social" && (
                      <div className="space-y-6">
                        <div className="flex items-start gap-3">
                          <div className="size-10 rounded-lg bg-amber-soft flex items-center justify-center shrink-0">
                            <Instagram className="size-5 text-amber" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-display font-medium tracking-tight">
                              Coco Social
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                              Vediamo che presenza social hai oggi.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label>Hai già profili social attivi? *</Label>
                          <RadioGroup value={hasSocial} onValueChange={setHasSocial} className="grid sm:grid-cols-2 gap-3">
                            {[
                              { v: "no", l: "No, parto da zero" },
                              { v: "yes-active", l: "Sì, e li gestisco" },
                              { v: "yes-dormant", l: "Sì, ma li trascuro" },
                              { v: "yes-pro", l: "Sì, gestiti da terzi" },
                            ].map((o) => (
                              <label
                                key={o.v}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                  hasSocial === o.v ? "border-amber bg-amber-soft" : "border-border bg-background hover:border-foreground/40"
                                }`}
                              >
                                <RadioGroupItem value={o.v} />
                                <span className="text-sm">{o.l}</span>
                              </label>
                            ))}
                          </RadioGroup>
                        </div>

                        {hasSocial && hasSocial !== "no" && (
                          <div className="space-y-2">
                            <Label htmlFor="socialLinks">Link o handle dei tuoi profili</Label>
                            <Textarea
                              id="socialLinks"
                              value={socialLinks}
                              onChange={(e) => setSocialLinks(e.target.value)}
                              maxLength={500}
                              rows={2}
                              placeholder="@iltuonomeinstagram, link Facebook, TikTok…"
                            />
                          </div>
                        )}

                        <div className="space-y-3">
                          <Label>Su cosa serve lavorare? *</Label>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {SOCIAL_NEEDS.map((n) => {
                              const active = socialNeeds.includes(n.id);
                              return (
                                <label
                                  key={n.id}
                                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                    active ? "border-amber bg-amber-soft" : "border-border bg-background hover:border-foreground/40"
                                  }`}
                                >
                                  <Checkbox
                                    checked={active}
                                    onCheckedChange={() => toggle(socialNeeds, setSocialNeeds, n.id)}
                                    className="mt-0.5"
                                  />
                                  <span className="text-sm">{n.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentKey === "coaching" && (
                      <div className="space-y-6">
                        <div className="flex items-start gap-3">
                          <div className="size-10 rounded-lg bg-amber-soft flex items-center justify-center shrink-0">
                            <GraduationCap className="size-5 text-amber" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-display font-medium tracking-tight">
                              Coaching
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                              Aiutaci a preparare il percorso giusto per te.
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="coachingFocus">Su cosa vuoi concentrarti? *</Label>
                          <Textarea
                            id="coachingFocus"
                            value={coachingFocus}
                            onChange={(e) => setCoachingFocus(e.target.value)}
                            maxLength={500}
                            rows={4}
                            placeholder="Es: strategia digitale, posizionamento, gestione del team, scelta dei canali…"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companyResources">Hai risorse interne da affiancare?</Label>
                          <Textarea
                            id="companyResources"
                            value={companyResources}
                            onChange={(e) => setCompanyResources(e.target.value)}
                            maxLength={500}
                            rows={3}
                            placeholder="Es: 1 marketing manager, 1 social media interno, nessuno per ora…"
                          />
                        </div>
                      </div>
                    )}

                    {currentKey === "contact" && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-display font-medium tracking-tight mb-2">
                            Ultimo passo: i tuoi dati
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Crei contestualmente il tuo account sulla piattaforma per seguire la richiesta.
                          </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nome e cognome *</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Telefono</Label>
                            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} placeholder="Opzionale" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="business">Nome attività</Label>
                            <Input id="business" value={business} onChange={(e) => setBusiness(e.target.value)} maxLength={120} placeholder="Opzionale" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Settore *</Label>
                          <Select value={sector} onValueChange={setSector}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona" />
                            </SelectTrigger>
                            <SelectContent>
                              {SECTORS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label>Come preferisci essere ricontattato?</Label>
                          <RadioGroup
                            value={contactPreference}
                            onValueChange={(v) => setContactPreference(v as typeof contactPreference)}
                            className="grid sm:grid-cols-3 gap-3"
                          >
                            {[
                              { v: "email", l: "Email", icon: Mail },
                              { v: "phone", l: "Telefono", icon: Phone },
                              { v: "whatsapp", l: "WhatsApp", icon: MessageCircle },
                            ].map((o) => {
                              const Icon = o.icon;
                              const active = contactPreference === o.v;
                              return (
                                <label
                                  key={o.v}
                                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                                    active ? "border-amber bg-amber-soft" : "border-border bg-background hover:border-foreground/40"
                                  }`}
                                >
                                  <RadioGroupItem value={o.v} />
                                  <Icon className="size-4" />
                                  <span className="text-sm">{o.l}</span>
                                </label>
                              );
                            })}
                          </RadioGroup>
                        </div>

                        <div className="rounded-2xl border border-amber/30 bg-amber-soft/40 p-5">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <Checkbox
                              checked={createAccount}
                              onCheckedChange={(v) => setCreateAccount(v === true)}
                              className="mt-0.5"
                            />
                            <div>
                              <p className="font-display font-semibold">Crea il mio account ora</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Accederai alla tua area dove troverai la nostra proposta, i materiali e gli aggiornamenti del progetto.
                              </p>
                            </div>
                          </label>
                          {createAccount && (
                            <div className="mt-4 space-y-2">
                              <Label htmlFor="password">Password account *</Label>
                              <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                                maxLength={72}
                                placeholder="Minimo 8 caratteri"
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Note aggiuntive</Label>
                          <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={1000}
                            rows={3}
                            placeholder="Scadenze, vincoli, preferenze… (opzionale)"
                          />
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Inviando accetti la nostra privacy policy. La richiesta sarà inoltrata a master@deskindustries.com.
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-10 flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    disabled={step === 0 || submitting}
                    className={step === 0 ? "invisible" : ""}
                  >
                    <ArrowLeft /> Indietro
                  </Button>
                  {!isLastStep ? (
                    <Button type="submit" variant="amber" size="lg">
                      Continua <ArrowRight />
                    </Button>
                  ) : (
                    <Button type="submit" variant="hero" size="lg" disabled={submitting}>
                      {submitting ? "Invio in corso…" : "Invia richiesta"} {!submitting && <ArrowRight />}
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* Side info */}
            <div className="lg:col-span-4 space-y-5">
              <div className="p-6 rounded-2xl border border-amber/30 bg-gradient-to-br from-surface-elevated to-surface">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="size-4 text-amber" />
                  <h3 className="font-display font-semibold text-sm uppercase tracking-wider">Modulo intelligente</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Le domande cambiano in base ai servizi che selezioni. Più contesto ci dai,
                  più la nostra proposta sarà precisa e veloce.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-surface-elevated">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="size-4 text-amber" />
                  <h3 className="font-display font-semibold text-sm uppercase tracking-wider">Cosa succede dopo</h3>
                </div>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="size-6 rounded-full bg-amber-soft text-amber font-display font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>Ricevi la conferma via email entro pochi minuti.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="size-6 rounded-full bg-amber-soft text-amber font-display font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>Il team analizza la tua richiesta e prepara la proposta.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="size-6 rounded-full bg-amber-soft text-amber font-display font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span>Ti contattiamo entro <strong className="text-foreground">24h lavorative</strong>.</span>
                  </li>
                </ol>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-surface-elevated">
                <h3 className="font-display font-semibold text-sm uppercase tracking-wider mb-3">Preferisci scriverci subito?</h3>
                <div className="space-y-2 text-sm">
                  <a
                    href="mailto:master@deskindustries.com"
                    className="flex items-center gap-2 text-muted-foreground hover:text-amber transition-colors"
                  >
                    <Mail className="size-4" /> master@deskindustries.com
                  </a>
                  <a
                    href="https://wa.me/393493251100"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-amber transition-colors"
                  >
                    <MessageCircle className="size-4" /> WhatsApp 349 325 1100
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
