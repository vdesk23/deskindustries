import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, MapPin, Globe, Check } from "lucide-react";
import { z } from "zod";
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
import { toast } from "sonner";

export const Route = createFileRoute("/contatti")({
  head: () => ({
    meta: [
      { title: "Contatti — Prenota la tua call gratuita | Desk Industries" },
      {
        name: "description",
        content:
          "Contatta Desk Industries per una call gratuita di 30 minuti. Scopri come il metodo COCO può portare clienti reali nella tua attività.",
      },
      { property: "og:title", content: "Contatti — Desk Industries" },
      {
        property: "og:description",
        content: "Una call gratuita di 30 minuti per analizzare la tua attività.",
      },
    ],
  }),
  component: ContattiPage,
});

const contactSchema = z.object({
  name: z.string().trim().min(2, "Inserisci il tuo nome").max(80, "Massimo 80 caratteri"),
  email: z.string().trim().email("Email non valida").max(255, "Massimo 255 caratteri"),
  business: z.string().trim().max(120, "Massimo 120 caratteri").optional(),
  sector: z.string().min(1, "Seleziona un settore"),
  plan: z.string().min(1, "Seleziona un interesse"),
  message: z
    .string()
    .trim()
    .min(10, "Almeno 10 caratteri")
    .max(1000, "Massimo 1000 caratteri"),
});

function ContattiPage() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    business: "",
    sector: "",
    plan: "",
    message: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Controlla i campi del form");
      return;
    }

    // TODO: integrare invio email/CRM quando sarà attivo Lovable Cloud
    console.info("Contact form submitted", result.data);
    setSubmitted(true);
    toast.success("Richiesta inviata! Ti rispondiamo entro 24h.");
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grain pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-20">
          <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
            Contatti
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-medium leading-[0.95] tracking-tight text-balance max-w-4xl">
            Iniziamo da una{" "}
            <span className="italic text-amber font-normal">conversazione</span>.
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            30 minuti gratuiti per capire se siamo l'agenzia giusta per te.
            Niente venditori, niente pressioni.
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-7">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-10 lg:p-14 rounded-3xl border border-amber bg-surface-elevated text-center"
                >
                  <div className="size-16 rounded-full bg-amber-soft flex items-center justify-center mx-auto mb-6">
                    <Check className="size-8 text-amber" />
                  </div>
                  <h2 className="text-3xl font-display font-semibold mb-3">
                    Richiesta ricevuta
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Ti rispondiamo entro 24 ore lavorative all'email che ci hai indicato.
                  </p>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="p-8 lg:p-10 rounded-3xl border border-border bg-surface-elevated space-y-6"
                  noValidate
                >
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome e cognome *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        maxLength={80}
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        maxLength={255}
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business">Nome attività</Label>
                    <Input
                      id="business"
                      value={formData.business}
                      onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                      maxLength={120}
                      placeholder="Opzionale"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>Settore *</Label>
                      <Select
                        value={formData.sector}
                        onValueChange={(v) => setFormData({ ...formData, sector: v })}
                      >
                        <SelectTrigger aria-invalid={!!errors.sector}>
                          <SelectValue placeholder="Seleziona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="barbieri">Barbieri</SelectItem>
                          <SelectItem value="tatuatori">Tatuatori</SelectItem>
                          <SelectItem value="pizzerie">Pizzerie</SelectItem>
                          <SelectItem value="centri-estetici">Centri estetici</SelectItem>
                          <SelectItem value="palestre">Palestre</SelectItem>
                          <SelectItem value="altro">Altro</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.sector && (
                        <p className="text-xs text-destructive">{errors.sector}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Sono interessato a *</Label>
                      <Select
                        value={formData.plan}
                        onValueChange={(v) => setFormData({ ...formData, plan: v })}
                      >
                        <SelectTrigger aria-invalid={!!errors.plan}>
                          <SelectValue placeholder="Seleziona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lite">COCO Lite — €197/mese</SelectItem>
                          <SelectItem value="pro">COCO Pro — €997/mese</SelectItem>
                          <SelectItem value="custom">Soluzione su misura</SelectItem>
                          <SelectItem value="info">Solo informazioni</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.plan && (
                        <p className="text-xs text-destructive">{errors.plan}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Raccontaci della tua attività *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      maxLength={1000}
                      rows={5}
                      placeholder="Da quanto tempo sei aperto, cosa vendi, qual è il tuo obiettivo principale..."
                      aria-invalid={!!errors.message}
                    />
                    {errors.message && (
                      <p className="text-xs text-destructive">{errors.message}</p>
                    )}
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    Invia richiesta <ArrowRight />
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Inviando accetti la nostra privacy policy. Non condividiamo i tuoi dati.
                  </p>
                </form>
              )}
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="p-7 rounded-2xl border border-border bg-surface-elevated">
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-lg bg-amber-soft flex items-center justify-center shrink-0">
                    <Mail className="size-5 text-amber" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">Email</h3>
                    <a
                      href="mailto:hello@deskindustries.com"
                      className="text-muted-foreground hover:text-amber transition-colors"
                    >
                      hello@deskindustries.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-7 rounded-2xl border border-border bg-surface-elevated">
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-lg bg-amber-soft flex items-center justify-center shrink-0">
                    <Globe className="size-5 text-amber" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">Sito ufficiale</h3>
                    <a
                      href="https://www.deskindustries.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-amber transition-colors"
                    >
                      www.deskindustries.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-7 rounded-2xl border border-border bg-surface-elevated">
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-lg bg-amber-soft flex items-center justify-center shrink-0">
                    <MapPin className="size-5 text-amber" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">Sede</h3>
                    <p className="text-muted-foreground">
                      Desk Industries SRLS
                      <br />
                      Italia
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-7 rounded-2xl border border-amber/30 bg-gradient-to-br from-surface-elevated to-surface">
                <h3 className="font-display font-semibold mb-2">Tempi di risposta</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Rispondiamo a tutte le richieste entro{" "}
                  <span className="text-foreground font-medium">24 ore lavorative</span>.
                  Le call gratuite si tengono dal lunedì al venerdì, 9:00–18:00.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
