import { draftBeforeLoad, draftHead } from "@/lib/draft-route";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Copy,
  Download,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Crown,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { getStripeEnvironment } from "@/lib/stripe";
import {
  generateArticlePdf,
  generateGuidePdf,
  type OptimizedResult,
} from "@/lib/seo-optimizer-pdf";

export const Route = createFileRoute("/tools/ottimizzatore-seo")({
  beforeLoad: draftBeforeLoad,
  head: () => draftHead,
  head: () => ({
    meta: [
      { title: "Tool · Ottimizzatore SEO/AIO — Desk Industries" },
      {
        name: "description",
        content:
          "Ottimizza i tuoi articoli per Google e per le AI generative. Meta description, slug, permalink e ALT inclusi.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OttimizzatoreSeoPage,
});

type Quota = {
  unlimited: boolean;
  plan: "free" | "starter" | "pro";
  limit: number;
  used_this_month: number;
  extra_credits: number;
};

type HistoryItem = {
  id: string;
  created_at: string;
  title: string | null;
  preview: string | null;
  is_extra: boolean;
};

const PLAN_LABEL: Record<Quota["plan"], string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

const MAX_CHARS = 30000;

function OttimizzatoreSeoPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [article, setArticle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizedResult | null>(null);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", search: { redirect: "/tools/ottimizzatore-seo", mode: "login" }, replace: true });
    }
  }, [user, authLoading, navigate]);

  const loadQuota = useCallback(async () => {
    if (!user) return;
    setQuotaLoading(true);
    const { data, error } = await supabase.functions.invoke("seo-quota");
    if (!error && data) {
      setQuota(data.quota as Quota);
      setHistory((data.history as HistoryItem[]) || []);
    }
    setQuotaLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) loadQuota();
  }, [user, loadQuota]);

  const handleOptimize = async () => {
    if (!article.trim()) {
      toast.error("Incolla un articolo prima di ottimizzare.");
      return;
    }
    if (article.length > MAX_CHARS) {
      toast.error(`Articolo troppo lungo (max ${MAX_CHARS.toLocaleString("it-IT")} caratteri).`);
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("optimize-seo-article", {
        body: { article, keyword, tone },
      });

      if (error) {
        // FunctionsHttpError carries response context
        const ctx = (error as { context?: { json?: () => Promise<{ error?: string; message?: string }> } }).context;
        let payload: { error?: string; message?: string } | undefined;
        try {
          payload = await ctx?.json?.();
        } catch {
          /* ignore */
        }
        if (payload?.error === "quota_exceeded") {
          toast.error(payload.message || "Quota esaurita.");
          await loadQuota();
        } else {
          toast.error(payload?.error || error.message || "Errore durante l'ottimizzazione.");
        }
        return;
      }

      setResult(data.result as OptimizedResult);
      setQuota(data.quota as Quota);
      toast.success(data.consumed_extra ? "Ottimizzato (credito extra usato)" : "Articolo ottimizzato!");
      // Refresh history
      loadQuota();
    } catch (e) {
      toast.error((e as Error).message || "Errore inatteso");
    } finally {
      setLoading(false);
    }
  };

  const copyOptimized = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.optimized_markdown);
    toast.success("Copiato negli appunti");
  };

  const downloadArticle = () => {
    if (!result) return;
    const doc = generateArticlePdf(result);
    doc.save(`articolo-ottimizzato-${result.slug || Date.now()}.pdf`);
  };

  const downloadGuide = () => {
    if (!result) return;
    const doc = generateGuidePdf(result);
    doc.save(`guida-seo-${result.slug || Date.now()}.pdf`);
  };

  const buyExtra = async () => setCheckoutPriceId("seo_optimizer_extra_article");
  const upgradeStarter = () => setCheckoutPriceId("seo_optimizer_starter");
  const upgradePro = () => setCheckoutPriceId("seo_optimizer_pro");

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-amber" />
      </div>
    );
  }

  const used = quota?.used_this_month ?? 0;
  const limit = quota?.limit ?? 3;
  const isExhausted = !quota?.unlimited && used >= limit && (quota?.extra_credits ?? 0) === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/account"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" /> Area clienti
          </Link>
          {quota && !quotaLoading && (
            <div className="flex items-center gap-3 text-sm">
              {quota.unlimited ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/15 text-amber px-3 py-1 font-medium">
                  <Crown className="h-3.5 w-3.5" /> Accesso illimitato
                </span>
              ) : (
                <>
                  <span className="rounded-full bg-surface-elevated px-3 py-1 font-medium">
                    Piano {PLAN_LABEL[quota.plan]}
                  </span>
                  <span className="text-muted-foreground">
                    {used}/{limit} articoli · {quota.extra_credits} extra
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl sm:text-5xl font-display font-semibold tracking-tight">
            Ottimizzatore SEO<span className="text-amber">/</span>AIO
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Incolla il tuo articolo, ricevi una versione ottimizzata per Google e per le AI generative:
            struttura, meta description, slug, permalink e idee per gli ALT delle immagini.
          </p>
        </motion.div>

        {isExhausted && !checkoutPriceId && (
          <PricingGate
            currentPlan={quota?.plan ?? "free"}
            onBuyExtra={buyExtra}
            onStarter={upgradeStarter}
            onPro={upgradePro}
          />
        )}

        {checkoutPriceId && user && (
          <div className="mt-8 rounded-2xl border border-border bg-surface-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">Completa il pagamento</h2>
              <button
                onClick={() => setCheckoutPriceId(null)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Annulla
              </button>
            </div>
            <StripeEmbeddedCheckout
              priceId={checkoutPriceId}
              customerEmail={user.email}
              returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}&back=/tools/ottimizzatore-seo`}
            />
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="rounded-2xl border border-border bg-surface-elevated p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-amber" />
              <h2 className="font-display text-xl font-semibold">Il tuo articolo</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label htmlFor="keyword" className="text-xs">Keyword principale (opzionale)</Label>
                <Input
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="es. marketing locale"
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="tone" className="text-xs">Tono (opzionale)</Label>
                <Input
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="es. professionale, amichevole"
                  maxLength={50}
                />
              </div>
            </div>

            <Label htmlFor="article" className="text-xs">Articolo (Markdown supportato)</Label>
            <Textarea
              id="article"
              value={article}
              onChange={(e) => setArticle(e.target.value)}
              placeholder="Incolla qui il tuo articolo già formattato..."
              className="min-h-[420px] font-mono text-sm mt-1"
              maxLength={MAX_CHARS}
            />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>
                {article.length.toLocaleString("it-IT")}/{MAX_CHARS.toLocaleString("it-IT")} caratteri
              </span>
              {article.length > MAX_CHARS * 0.9 && (
                <span className="text-amber">Sei vicino al limite</span>
              )}
            </div>

            <Button
              onClick={handleOptimize}
              disabled={loading || !article.trim() || isExhausted}
              variant="amber"
              size="lg"
              className="w-full mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Ottimizzazione in corso...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Ottimizza articolo
                </>
              )}
            </Button>
          </div>

          {/* Result */}
          <div className="rounded-2xl border border-border bg-surface-elevated p-6 min-h-[500px]">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                <FileText className="h-12 w-12 mb-4 opacity-40" />
                <p className="font-medium">Il risultato apparirà qui</p>
                <p className="text-sm mt-1">Articolo ottimizzato, guida modifiche e meta SEO</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-amber mb-4" />
                <p className="font-medium">Stiamo ottimizzando il tuo articolo...</p>
                <p className="text-sm text-muted-foreground mt-1">Può richiedere 10-30 secondi</p>
              </div>
            )}

            {result && (
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button onClick={copyOptimized} variant="outline" size="sm">
                    <Copy className="h-4 w-4" /> Copia
                  </Button>
                  <Button onClick={downloadArticle} variant="outline" size="sm">
                    <Download className="h-4 w-4" /> Articolo PDF
                  </Button>
                  <Button onClick={downloadGuide} variant="amber" size="sm">
                    <Download className="h-4 w-4" /> Guida PDF
                  </Button>
                </div>

                <Tabs defaultValue="article" className="w-full">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="article">Articolo</TabsTrigger>
                    <TabsTrigger value="seo">SEO Meta</TabsTrigger>
                    <TabsTrigger value="changes">Modifiche</TabsTrigger>
                  </TabsList>

                  <TabsContent value="article" className="mt-4">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans bg-background rounded-lg p-4 max-h-[480px] overflow-auto">
                      {result.optimized_markdown}
                    </pre>
                  </TabsContent>

                  <TabsContent value="seo" className="mt-4 space-y-4">
                    <SeoField label="Meta description" value={result.meta_description} />
                    <SeoField label="Slug" value={result.slug} />
                    <SeoField label="Permalink" value={result.permalink_suggestion} />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-2">IDEE ALT</p>
                      <div className="space-y-2">
                        {result.alt_ideas.map((a, i) => (
                          <div key={i} className="rounded-lg bg-background p-3 text-sm">
                            <p className="text-xs text-muted-foreground">{a.context}</p>
                            <p className="mt-1">{a.alt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="changes" className="mt-4">
                    <div className="space-y-3 max-h-[480px] overflow-auto">
                      {result.changes.map((c, i) => (
                        <div key={i} className="rounded-lg bg-background p-3 text-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="rounded-full bg-amber/15 text-amber px-2 py-0.5 text-xs font-medium">
                              {c.type}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs">{c.reason}</p>
                          {c.before && (
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-muted-foreground mb-1">Prima</p>
                                <p className="line-through opacity-60">{c.before}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">Dopo</p>
                                <p className="text-foreground">{c.after}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <Accordion type="single" collapsible className="mt-8">
            <AccordionItem value="history" className="rounded-2xl border border-border bg-surface-elevated px-6">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-display font-semibold">
                  Ultime ottimizzazioni ({history.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="divide-y divide-border">
                  {history.map((h) => (
                    <li key={h.id} className="py-3 flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-amber mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{h.title || "(senza titolo)"}</p>
                        <p className="text-xs text-muted-foreground truncate">{h.preview}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(h.created_at).toLocaleDateString("it-IT")}
                        {h.is_extra && <span className="ml-2 text-amber">extra</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </div>
  );
}

function SeoField({ label, value }: { label: string; value: string }) {
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copiato`);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <button onClick={copy} className="text-xs text-amber hover:underline">copia</button>
      </div>
      <p className="rounded-lg bg-background p-3 text-sm break-words">{value || <em className="opacity-60">—</em>}</p>
    </div>
  );
}

function PricingGate({
  currentPlan,
  onBuyExtra,
  onStarter,
  onPro,
}: {
  currentPlan: Quota["plan"];
  onBuyExtra: () => void;
  onStarter: () => void;
  onPro: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-2xl border border-amber/30 bg-amber/5 p-6"
    >
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="h-5 w-5 text-amber shrink-0 mt-0.5" />
        <div>
          <h3 className="font-display font-semibold">Hai esaurito gli articoli del mese</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Acquista un articolo extra a 1€, oppure passa a un piano superiore.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <PricingCard
          title="Articolo extra"
          price="1€"
          subtitle="una tantum"
          features={["Singolo articolo aggiuntivo", "Si somma al tuo piano"]}
          cta="Acquista"
          onClick={onBuyExtra}
        />
        <PricingCard
          title="Starter"
          price="4,99€"
          subtitle="/mese"
          features={["10 articoli al mese", "+1€ per articolo extra"]}
          cta={currentPlan === "starter" ? "Piano attuale" : "Attiva Starter"}
          onClick={onStarter}
          disabled={currentPlan === "starter"}
        />
        <PricingCard
          title="Pro"
          price="9,99€"
          subtitle="/mese"
          features={["25 articoli al mese", "+1€ per articolo extra"]}
          cta={currentPlan === "pro" ? "Piano attuale" : "Attiva Pro"}
          onClick={onPro}
          disabled={currentPlan === "pro"}
          highlight
        />
      </div>
    </motion.div>
  );
}

function PricingCard({
  title,
  price,
  subtitle,
  features,
  cta,
  onClick,
  disabled,
  highlight,
}: {
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  cta: string;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-amber bg-background" : "border-border bg-background/60"
      }`}
    >
      <div className="flex items-center gap-2">
        {highlight && <Zap className="h-4 w-4 text-amber" />}
        <h4 className="font-display font-semibold">{title}</h4>
      </div>
      <p className="mt-2">
        <span className="text-2xl font-display font-semibold">{price}</span>
        <span className="text-sm text-muted-foreground"> {subtitle}</span>
      </p>
      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-amber mt-0.5 shrink-0" /> {f}
          </li>
        ))}
      </ul>
      <Button
        onClick={onClick}
        disabled={disabled}
        variant={highlight ? "amber" : "outline"}
        size="sm"
        className="w-full mt-4"
      >
        {cta}
      </Button>
    </div>
  );
}
