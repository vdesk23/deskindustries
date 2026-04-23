import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, LogOut, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getStripeEnvironment } from "@/lib/stripe";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Area clienti — Desk Industries" },
      { name: "description", content: "Gestisci il tuo abbonamento e i tuoi dati." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AccountPage,
});

interface Subscription {
  id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  product_id: string;
  price_id: string;
  stripe_customer_id: string;
}

interface Purchase {
  id: string;
  stripe_session_id: string;
  amount_total: number | null;
  currency: string | null;
  mode: string | null;
  created_at: string;
}

function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", search: { redirect: "/account", mode: "login" }, replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("purchases")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      setSubs((s as Subscription[]) || []);
      setPurchases((p as Purchase[]) || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {
          returnUrl: `${window.location.origin}/account`,
          environment: getStripeEnvironment(),
        },
      });
      if (error || !data?.url) throw new Error(error?.message || "Errore portale");
      window.open(data.url, "_blank");
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setPortalLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  const activeSubs = subs.filter(
    (s) =>
      ["active", "trialing"].includes(s.status) &&
      (!s.current_period_end || new Date(s.current_period_end) > new Date())
  );

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-12">
          <div>
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-3">
              Area clienti
            </p>
            <h1 className="text-4xl lg:text-5xl font-display font-medium tracking-tight">
              Ciao{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="size-4" /> Esci
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Caricamento abbonamenti...</p>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-border bg-surface-elevated p-8 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="size-5 text-amber" />
                <h2 className="text-xl font-display font-semibold">I tuoi abbonamenti</h2>
              </div>

              {activeSubs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-6">
                    Non hai abbonamenti attivi al momento.
                  </p>
                  <Link to="/pacchetti">
                    <Button variant="amber">
                      Esplora i servizi COCO <ArrowRight />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSubs.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-border bg-background p-5 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-display font-semibold text-lg">
                          {s.price_id || "Servizio COCO"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Stato:{" "}
                          <span className="text-foreground capitalize">{s.status}</span>
                          {s.current_period_end && (
                            <>
                              {" · "}
                              {s.cancel_at_period_end ? "Termina il" : "Rinnovo il"}{" "}
                              <span className="text-foreground">
                                {new Date(s.current_period_end).toLocaleDateString("it-IT")}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={openPortal}
                    disabled={portalLoading}
                    className="w-full sm:w-auto"
                  >
                    {portalLoading ? "Apertura..." : "Gestisci abbonamento"}{" "}
                    <ExternalLink className="size-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Si apre il portale sicuro Stripe per cambiare piano, aggiornare la carta o cancellare.
                  </p>
                </div>
              )}
            </motion.div>

            {purchases.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="rounded-3xl border border-border bg-surface-elevated p-8"
              >
                <h2 className="text-xl font-display font-semibold mb-4">Storico acquisti</h2>
                <div className="space-y-2">
                  {purchases.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-b-0 text-sm"
                    >
                      <div>
                        <p className="text-foreground">
                          {p.mode === "subscription" ? "Abbonamento" : "Pagamento"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        {p.amount_total != null && p.currency && (
                          <p className="font-display font-semibold">
                            {(p.amount_total / 100).toLocaleString("it-IT", {
                              style: "currency",
                              currency: p.currency.toUpperCase(),
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
