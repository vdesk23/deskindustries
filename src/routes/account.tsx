import { createFileRoute, useNavigate, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, LogOut, Sparkles, FileText, Globe, Rocket, CreditCard, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getStripeEnvironment } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { listMyFolliaSites } from "@/lib/follia-account.functions";
import { checkIsAdmin } from "@/lib/follia-admin.functions";

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

type FolliaSite = {
  id: string;
  subdomain: string;
  custom_domain: string | null;
  business_type: string;
  business_data: { name?: string } & Record<string, unknown>;
  status: string;
  request_status: string;
  plan: string | null;
  has_full_assistance: boolean;
  published_url: string | null;
  created_at: string;
};

const REQUEST_STATUS_LABEL: Record<string, string> = {
  new: "Richiesta ricevuta",
  in_progress: "In lavorazione",
  awaiting_payment: "Pronto per pagamento",
  live: "Online",
  archived: "Archiviato",
};

function AccountPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const fetchSites = useServerFn(listMyFolliaSites);
  const checkAdmin = useServerFn(checkIsAdmin);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [folliaSites, setFolliaSites] = useState<FolliaSite[]>([]);
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
      const [{ data: s }, { data: p }, sitesRes, adminRes] = await Promise.all([
        supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("purchases").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        fetchSites().catch(() => ({ sites: [] as FolliaSite[] })),
        checkAdmin().catch(() => ({ isAdmin: false })),
      ]);
      setSubs((s as Subscription[]) || []);
      setPurchases((p as Purchase[]) || []);
      setFolliaSites(((sitesRes as { sites: FolliaSite[] }).sites) || []);
      setIsAdmin(!!(adminRes as { isAdmin: boolean }).isAdmin);
      setLoading(false);
    };
    load();
  }, [user, fetchSites, checkAdmin]);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { returnUrl: `${window.location.origin}/account`, environment: getStripeEnvironment() },
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
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Caricamento...</p></div>;
  }

  if (pathname !== "/account") return <Outlet />;

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
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-3">Area clienti</p>
            <h1 className="text-4xl lg:text-5xl font-display font-medium tracking-tight">
              Ciao{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button asChild variant="outline" size="sm"><Link to="/admin">Admin</Link></Button>
            )}
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="size-4" /> Esci</Button>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Caricamento...</p>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.03 }} className="rounded-3xl border border-border bg-surface-elevated p-8 mb-6">
              <div className="flex items-center gap-2 mb-1"><Globe className="size-5 text-amber" /><h2 className="text-xl font-display font-semibold">Le tue richieste Foll.IA</h2></div>
              <p className="text-sm text-muted-foreground mb-6">Stato del tuo sito web e azioni disponibili.</p>

              {folliaSites.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">Non hai ancora una richiesta Foll.IA.</p>
                  <Button asChild variant="amber"><Link to="/follia">Inizia una richiesta <ArrowRight className="size-4" /></Link></Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {folliaSites.map((s) => {
                    const siteName = s.business_data?.name || s.subdomain;
                    const status = s.request_status || "new";
                    const isLive = status === "live" && !!s.published_url;
                    const isAwaitingPayment = status === "awaiting_payment";
                    return (
                      <div key={s.id} className="rounded-2xl border border-border bg-background/40 p-5">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-[200px]">
                            <p className={`text-[10px] font-display tracking-[0.3em] uppercase mb-2 ${isLive ? "text-emerald-500" : isAwaitingPayment ? "text-amber" : "text-muted-foreground"}`}>
                              {REQUEST_STATUS_LABEL[status] || status}
                            </p>
                            <h3 className="font-display font-semibold text-lg mb-1">{siteName}</h3>
                            <p className="text-xs text-muted-foreground">{s.custom_domain || s.published_url || `${s.subdomain}.deskinc.app (richiesto)`}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {isLive && s.published_url && (
                              <Button asChild variant="amber" size="sm">
                                <a href={s.published_url} target="_blank" rel="noreferrer">
                                  <ExternalLink className="size-4" /> Visita sito online
                                </a>
                              </Button>
                            )}
                            {isAwaitingPayment && (
                              <Button asChild variant="amber" size="sm">
                                <Link to="/account/sites/$siteId" params={{ siteId: s.id }}>
                                  <CreditCard className="size-4" /> Procedi al pagamento
                                </Link>
                              </Button>
                            )}
                            {!isLive && !isAwaitingPayment && (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground px-3 py-1.5 rounded-md border border-border">
                                <Clock className="size-3.5" /> In lavorazione
                              </span>
                            )}
                            <Button asChild variant="ghost" size="sm">
                              <Link to="/account/sites/$siteId" params={{ siteId: s.id }}>
                                Dettagli <ArrowRight className="size-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-3xl border border-border bg-surface-elevated p-8 mb-6">
              <div className="flex items-center gap-2 mb-4"><Sparkles className="size-5 text-amber" /><h2 className="text-xl font-display font-semibold">I tuoi abbonamenti</h2></div>
              {activeSubs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-6">Non hai abbonamenti attivi al momento.</p>
                  <Button asChild variant="amber"><Link to="/pacchetti">Esplora i servizi COCO <ArrowRight /></Link></Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSubs.map((s) => (
                    <div key={s.id} className="rounded-2xl border border-border bg-background p-5 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-display font-semibold text-lg">{s.price_id || "Abbonamento"}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Stato: <span className="text-foreground capitalize">{s.status}</span>
                          {s.current_period_end && (<>{" · "}{s.cancel_at_period_end ? "Termina il" : "Rinnovo il"} <span className="text-foreground">{new Date(s.current_period_end).toLocaleDateString("it-IT")}</span></>)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={openPortal} disabled={portalLoading} className="w-full sm:w-auto">
                    {portalLoading ? "Apertura..." : "Gestisci abbonamento"} <ExternalLink className="size-4" />
                  </Button>
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="rounded-3xl border border-border bg-surface-elevated p-8 mb-6">
              <div className="flex items-center gap-2 mb-1"><FileText className="size-5 text-amber" /><h2 className="text-xl font-display font-semibold">Tool gratuiti</h2></div>
              <p className="text-sm text-muted-foreground mb-6">Strumenti sviluppati internamente da Desk Industries.</p>
              <Link to="/tools/piano-contenuti" className="group block rounded-2xl border border-border bg-background/40 p-5 hover:border-amber/50 transition-all mb-3">
                <div className="flex items-start justify-between gap-4"><div className="flex-1"><p className="text-[10px] font-display tracking-[0.3em] text-amber uppercase mb-2">Tool · Marketing</p><h3 className="font-display font-semibold text-lg mb-1">Piano Contenuti</h3></div><ArrowRight className="size-5 text-muted-foreground group-hover:text-amber transition" /></div>
              </Link>
              <Link to="/tools/ottimizzatore-seo" className="group block rounded-2xl border border-border bg-background/40 p-5 hover:border-amber/50 transition-all">
                <div className="flex items-start justify-between gap-4"><div className="flex-1"><p className="text-[10px] font-display tracking-[0.3em] text-amber uppercase mb-2">Tool · SEO / AIO</p><h3 className="font-display font-semibold text-lg mb-1">Ottimizzatore SEO/AIO</h3></div><ArrowRight className="size-5 text-muted-foreground group-hover:text-amber transition" /></div>
              </Link>
            </motion.div>

            {purchases.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="rounded-3xl border border-border bg-surface-elevated p-8">
                <h2 className="text-xl font-display font-semibold mb-4">Storico acquisti</h2>
                <div className="space-y-2">
                  {purchases.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0 text-sm">
                      <div>
                        <p className="text-foreground">{p.mode === "subscription" ? "Abbonamento" : "Pagamento"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</p>
                      </div>
                      <div className="text-right">
                        {p.amount_total != null && p.currency && (
                          <p className="font-display font-semibold">{(p.amount_total / 100).toLocaleString("it-IT", { style: "currency", currency: p.currency.toUpperCase() })}</p>
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
