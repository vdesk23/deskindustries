import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";

export const Route = createFileRoute("/pacchetti")({
  head: () => ({
    meta: [
      { title: "Pacchetti COCO Lite e Pro — Pricing trasparente | Desk Industries" },
      {
        name: "description",
        content:
          "Due pacchetti pensati per la crescita della tua attività locale: COCO Lite a €197/mese e COCO Pro a €997/mese. Nessun costo nascosto.",
      },
      { property: "og:title", content: "Pacchetti COCO — Desk Industries" },
      {
        property: "og:description",
        content: "COCO Lite €197 e COCO Pro €997. Pricing trasparente, nessuna sorpresa.",
      },
    ],
  }),
  component: PacchettiPage,
});

const PLANS = [
  {
    name: "COCO Lite",
    price: "197",
    priceId: "coco_lite_monthly",
    tagline: "Le fondamenta digitali della tua attività",
    description:
      "Tutto quello che serve per esistere online in modo professionale, senza pensieri tecnici.",
    features: [
      "Gestione sito web",
      "Google Workspace (email aziendale)",
      "Google Analytics, Search Console, Tag Manager",
      "Gestione Google My Business",
      "Tutti i costi di gestione inclusi",
      "Supporto e assistenza sulle pagine generate",
    ],
    highlighted: false,
  },
  {
    name: "COCO Pro",
    price: "997",
    priceId: "coco_pro_monthly",
    tagline: "Crescita accelerata, presenza completa",
    description:
      "Per attività che vogliono accelerare. Aggiungi visibilità social, automazioni e una squadra strategica al tuo fianco.",
    features: [
      "Tutto ciò che è incluso in COCO Lite",
      "Gestione di una piattaforma social",
      "4 pubblicazioni a settimana",
      "Report settimanale dettagliato",
      "Call strategica mensile",
      "Gruppo di supporto su Google Chat",
      "Email marketing & automation",
    ],
    highlighted: true,
  },
] as const;

const COMPARISON = [
  { feature: "Gestione sito web", lite: true, pro: true },
  { feature: "Google Workspace", lite: true, pro: true },
  { feature: "Analytics, Search Console, Tag Manager", lite: true, pro: true },
  { feature: "Google My Business", lite: true, pro: true },
  { feature: "Costi di gestione inclusi", lite: true, pro: true },
  { feature: "Supporto pagine generate", lite: true, pro: true },
  { feature: "Gestione social media", lite: false, pro: true },
  { feature: "4 pubblicazioni / settimana", lite: false, pro: true },
  { feature: "Report settimanale", lite: false, pro: true },
  { feature: "Call strategica mensile", lite: false, pro: true },
  { feature: "Supporto Google Chat", lite: false, pro: true },
  { feature: "Email marketing & automation", lite: false, pro: true },
];

const FAQ = [
  {
    q: "Sono previsti costi di attivazione?",
    a: "No. Il prezzo mensile è tutto compreso. Eventuali costi di setup straordinario vengono sempre concordati in anticipo e per iscritto.",
  },
  {
    q: "Posso passare da Lite a Pro in qualsiasi momento?",
    a: "Sì. L'upgrade è immediato e paghi solo la differenza dal mese successivo. Nessuna penale.",
  },
  {
    q: "Quanto dura il contratto?",
    a: "Il piano è mensile con preavviso di 30 giorni. Crediamo nei risultati, non nei vincoli contrattuali.",
  },
  {
    q: "Come si paga? Carta o bonifico?",
    a: "Accettiamo entrambi. Carta di credito tramite checkout sicuro o bonifico bancario con fattura elettronica.",
  },
  {
    q: "Cosa succede se ho già un sito o profili social?",
    a: "Perfetto. Li analizziamo, li ottimizziamo e li integriamo nel piano. Non serve ripartire da zero.",
  },
  {
    q: "Avete pacchetti su misura?",
    a: "Sì. Per attività con esigenze specifiche (multi-sede, e-commerce, settori particolari) costruiamo offerte dedicate. Contattaci.",
  },
];

function PacchettiPage() {
  const [checkoutPlan, setCheckoutPlan] = useState<{ name: string; priceId: string } | null>(null);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grain pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-5 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-20 text-center">
          <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
            Pacchetti
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-medium leading-[0.95] tracking-tight text-balance">
            Pricing trasparente.{" "}
            <span className="italic text-amber font-normal">Nessuna sorpresa.</span>
          </h1>
          <p className="mt-8 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
            Due piani pensati per accompagnarti dalla prima saracinesca alzata
            fino alla scalata. Cambia quando vuoi.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`relative p-8 lg:p-10 rounded-3xl border ${
                  plan.highlighted
                    ? "border-amber bg-gradient-to-br from-surface-elevated to-surface shadow-amber"
                    : "border-border bg-surface-elevated"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-8 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber text-amber-foreground text-xs font-display font-semibold">
                    <Sparkles className="size-3" /> Consigliato
                  </div>
                )}
                <h2 className="text-3xl font-display font-semibold">{plan.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-6xl font-display font-medium">€{plan.price}</span>
                  <span className="text-muted-foreground">/mese</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {plan.description}
                </p>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check className="size-4 text-amber mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlighted ? "amber" : "outline"}
                  className="w-full mt-10"
                  size="lg"
                  onClick={() => setCheckoutPlan({ name: plan.name, priceId: plan.priceId })}
                >
                  Inizia con {plan.name} <ArrowRight />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
              Confronto rapido
            </p>
            <h2 className="text-3xl lg:text-5xl font-display font-medium tracking-tight text-balance">
              Cosa cambia tra Lite e Pro
            </h2>
          </div>

          <div className="rounded-3xl border border-border bg-background overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-4 border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
              <div className="col-span-6">Funzionalità</div>
              <div className="col-span-3 text-center">Lite</div>
              <div className="col-span-3 text-center text-amber">Pro</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-12 px-6 py-4 border-b border-border last:border-b-0 text-sm items-center"
              >
                <div className="col-span-6">{row.feature}</div>
                <div className="col-span-3 flex justify-center">
                  {row.lite ? (
                    <Check className="size-5 text-amber" />
                  ) : (
                    <X className="size-5 text-muted-foreground/40" />
                  )}
                </div>
                <div className="col-span-3 flex justify-center">
                  {row.pro ? (
                    <Check className="size-5 text-amber" />
                  ) : (
                    <X className="size-5 text-muted-foreground/40" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 border-t border-border">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
              Domande frequenti
            </p>
            <h2 className="text-3xl lg:text-5xl font-display font-medium tracking-tight text-balance">
              Le risposte a quello che ti stai chiedendo
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group p-6 rounded-2xl bg-surface-elevated border border-border open:border-amber/50 transition-colors"
              >
                <summary className="flex justify-between items-center cursor-pointer text-lg font-display font-semibold list-none">
                  {item.q}
                  <span className="text-amber group-open:rotate-45 transition-transform text-2xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 lg:py-32 border-t border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-display font-medium tracking-tight text-balance">
            Non sai quale scegliere?{" "}
            <span className="italic text-amber font-normal">Te lo diciamo noi.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            30 minuti gratis per analizzare la tua attività e consigliarti il piano giusto.
          </p>
          <div className="mt-10">
            <Link to="/contatti">
              <Button variant="hero" size="xl">
                Prenota la tua call gratuita <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Dialog
        open={!!checkoutPlan}
        onOpenChange={(open) => {
          if (!open) {
            setCheckoutPlan(null);
            setAcceptedTerms(false);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Sottoscrivi {checkoutPlan?.name}
            </DialogTitle>
          </DialogHeader>

          {checkoutPlan && !acceptedTerms && (
            <div className="space-y-6 pt-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Prima di procedere al pagamento, è necessario accettare le condizioni
                contrattuali e l'informativa sulla privacy.
              </p>

              <label className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-surface-elevated cursor-pointer hover:border-amber/50 transition-colors">
                <Checkbox
                  checked={termsChecked}
                  onCheckedChange={(v) => setTermsChecked(v === true)}
                  className="mt-0.5"
                />
                <span className="text-sm leading-relaxed">
                  Ho letto e accetto i{" "}
                  <Link to="/termini" target="_blank" className="text-amber hover:underline font-medium">
                    Termini e Condizioni
                  </Link>{" "}
                  e la{" "}
                  <Link to="/privacy" target="_blank" className="text-amber hover:underline font-medium">
                    Privacy Policy
                  </Link>
                  . Acconsento all'inizio immediato del servizio digitale e dichiaro
                  di rinunciare al diritto di recesso una volta erogato (art. 59 Codice del Consumo).
                </span>
              </label>

              <Button
                variant="amber"
                size="lg"
                className="w-full"
                disabled={!termsChecked}
                onClick={() => setAcceptedTerms(true)}
              >
                Procedi al pagamento <ArrowRight />
              </Button>
            </div>
          )}

          {checkoutPlan && acceptedTerms && (
            <StripeEmbeddedCheckout
              key={checkoutPlan.priceId}
              priceId={checkoutPlan.priceId}
              returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
