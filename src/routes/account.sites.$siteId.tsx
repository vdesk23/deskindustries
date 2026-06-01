import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import { getMyFolliaSite, createFolliaTicket, updateMyFolliaSite } from "@/lib/follia-account.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, ExternalLink, CreditCard, MessagesSquare, Clock, CheckCircle2,
  Save, Mail, Sparkles, Share2, Building2,
} from "lucide-react";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { toast } from "sonner";

export const Route = createFileRoute("/account/sites/$siteId")({
  head: () => ({
    meta: [
      { title: "Gestisci richiesta — Desk Industries" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SiteDetailPage,
});

type Site = {
  id: string;
  subdomain: string;
  custom_domain: string | null;
  business_type: string;
  business_data: Record<string, any>;
  config: Record<string, any>;
  status: string;
  request_status: string;
  plan: string | null;
  has_full_assistance: boolean;
  published_url: string | null;
  lead_email: string;
};

type Ticket = { id: string; subject: string; status: string; category: string; created_at: string };
type Purchase = { id: string; amount_total: number | null; currency: string | null; mode: string | null; price_id: string | null; environment: string; created_at: string };
type Subscription = { id: string; status: string; price_id: string; current_period_end: string | null; cancel_at_period_end: boolean | null; environment: string };

const STATUS_LABEL: Record<string, string> = {
  new: "Richiesta ricevuta",
  in_progress: "In lavorazione",
  awaiting_payment: "Pronto per pagamento",
  live: "Online",
  archived: "Archiviato",
};

function formatMoney(cents: number | null | undefined, currency = "eur") {
  if (cents == null) return "—";
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

function SiteDetailPage() {
  const { siteId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fetchSite = useServerFn(getMyFolliaSite);
  const createTicket = useServerFn(createFolliaTicket);
  const updateSite = useServerFn(updateMyFolliaSite);

  const [site, setSite] = useState<Site | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const [editForm, setEditForm] = useState({
    name: "", city: "", description: "", services: "", notes: "",
    address: "", phone: "", email: "", opening_hours: "",
    primary_color: "#6d28d9", secondary_color: "#f59e0b",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketBody, setTicketBody] = useState("");
  const [ticketCategory, setTicketCategory] = useState<"general" | "edit_request" | "bug" | "billing">("general");
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const { openCheckout, checkoutElement, isOpen, closeCheckout } = useStripeCheckout();
  const [portalLoading, setPortalLoading] = useState(false);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { returnUrl: `${window.location.origin}/account/sites/${siteId}`, environment: getStripeEnvironment() },
      });
      if (error || !data?.url) throw new Error(error?.message || "Errore portale");
      window.open(data.url, "_blank");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", search: { redirect: `/account/sites/${siteId}`, mode: "login" }, replace: true });
    }
  }, [user, authLoading, navigate, siteId]);

  const load = useCallback(() => {
    fetchSite({ data: { siteId } })
      .then((r) => {
        const s = r.site as Site;
        setSite(s);
        setTickets(r.tickets as Ticket[]);
        setPurchases((r.purchases || []) as Purchase[]);
        setSubscriptions((r.subscriptions || []) as Subscription[]);
        const bd = s.business_data || {};
        const cfg = s.config || {};
        setEditForm({
          name: bd.name || "",
          city: bd.city || "",
          description: bd.description || "",
          services: bd.services || "",
          notes: bd.notes || "",
          address: cfg.address || "",
          phone: cfg.phone || "",
          email: cfg.email || s.lead_email || "",
          opening_hours: cfg.opening_hours || "",
          primary_color: bd.primary_color || "#6d28d9",
          secondary_color: bd.secondary_color || "#f59e0b",
        });
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [fetchSite, siteId]);

  useEffect(() => { if (user) load(); }, [user, load]);

  if (authLoading || !user || loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Caricamento...</div>;
  }
  if (!site) {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Sito non trovato.</div>;
  }

  const name = site.business_data?.name || site.subdomain;
  const status = site.request_status || "new";
  const isLive = status === "live" && !!site.published_url;
  const isAwaitingPayment = status === "awaiting_payment";
  const hasActiveSub = subscriptions.some(
    (s) => ["active", "trialing", "past_due"].includes(s.status) &&
      (!s.current_period_end || new Date(s.current_period_end) > new Date()),
  );

  const handleCheckout = (plan: "basic" | "with_setup") => {
    if (!user?.email) return;
    openCheckout({
      priceId: "follia_monthly_19",
      ...(plan === "with_setup" ? { extraPriceIds: ["follia_setup_fee_297"] } : {}),
      customerEmail: user.email,
      userId: user.id,
      metadata: { folliaSiteId: site.id, folliaPlan: plan },
      returnUrl: `${window.location.origin}/account/sites/${site.id}?checkout=success`,
    } as Parameters<typeof openCheckout>[0]);
  };

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketBody.trim()) return;
    setSubmittingTicket(true);
    try {
      const r = await createTicket({ data: { siteId: site.id, subject: ticketSubject, body: ticketBody, category: ticketCategory } });
      if (!r.ok) toast.error(r.error);
      else {
        toast.success("Ticket inviato");
        setTicketSubject(""); setTicketBody(""); setTicketCategory("general");
        load();
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmittingTicket(false);
    }
  };

  const saveData = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      await updateSite({
        data: {
          siteId: site.id,
          business_data: {
            name: editForm.name,
            city: editForm.city,
            description: editForm.description,
            services: editForm.services,
            notes: editForm.notes,
            primary_color: editForm.primary_color,
            secondary_color: editForm.secondary_color,
          },
          config: {
            address: editForm.address,
            phone: editForm.phone,
            email: editForm.email,
            opening_hours: editForm.opening_hours,
          },
        },
      });
      toast.success("Dati aggiornati");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto max-w-4xl px-5 lg:px-8 space-y-8">
        <Link to="/account" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Torna all'area cliente
        </Link>

        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className={`text-xs font-display tracking-[0.3em] uppercase mb-3 ${isLive ? "text-emerald-500" : isAwaitingPayment ? "text-amber" : "text-muted-foreground"}`}>
              {STATUS_LABEL[status] || status}
            </p>
            <h1 className="text-4xl lg:text-5xl font-display font-medium tracking-tight">{name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{site.custom_domain || site.published_url || `${site.subdomain}.deskinc.app (richiesto)`}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {isLive && site.published_url && (
              <Button asChild variant="amber"><a href={site.published_url} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> Visita sito</a></Button>
            )}
            {hasActiveSub && (
              <Button variant="outline" onClick={openPortal} disabled={portalLoading}>
                {portalLoading ? "Apertura..." : "Gestisci pagamenti"} <ExternalLink className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {!isLive && !isAwaitingPayment && (
          <div className="rounded-3xl border border-border bg-surface-elevated p-8">
            <div className="flex items-center gap-2 mb-2"><Clock className="size-5 text-amber" /><h2 className="text-xl font-display font-semibold">Stiamo lavorando alla tua richiesta</h2></div>
            <p className="text-sm text-muted-foreground">
              Il nostro team sta costruendo il tuo sito. Ti contatteremo non appena sarà pronto: riceverai qui in dashboard il link al pagamento.
            </p>
          </div>
        )}

        {isAwaitingPayment && (
          <div className="rounded-3xl border border-amber/40 bg-amber/5 p-8">
            <div className="flex items-center gap-2 mb-3"><CreditCard className="size-5 text-amber" /><h2 className="text-xl font-display font-semibold">Il tuo sito è pronto</h2></div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">Procedi al pagamento per pubblicarlo.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-background p-6 flex flex-col">
                <p className="text-[10px] font-display tracking-[0.3em] text-amber uppercase mb-3">Subito online</p>
                <p className="text-3xl font-display font-medium mb-1">19€<span className="text-sm text-muted-foreground">/mese</span></p>
                <ul className="text-sm space-y-1.5 text-muted-foreground my-4 flex-1">
                  <li className="flex gap-2"><CheckCircle2 className="size-4 text-amber shrink-0 mt-0.5" /> Hosting + dominio incluso</li>
                  <li className="flex gap-2"><CheckCircle2 className="size-4 text-amber shrink-0 mt-0.5" /> Assistenza ticket</li>
                </ul>
                <Button variant="outline" onClick={() => handleCheckout("basic")}>Pubblica ora</Button>
              </div>
              <div className="rounded-2xl border-2 border-amber bg-background p-6 flex flex-col relative">
                <span className="absolute -top-2.5 left-6 px-2 py-0.5 rounded-full bg-amber text-amber-foreground text-[10px] font-display tracking-widest uppercase">Consigliato</span>
                <p className="text-[10px] font-display tracking-[0.3em] text-amber uppercase mb-3">Con personalizzazione</p>
                <p className="text-3xl font-display font-medium mb-1">297€<span className="text-sm text-muted-foreground"> + 19€/mese</span></p>
                <ul className="text-sm space-y-1.5 text-muted-foreground my-4 flex-1">
                  <li className="flex gap-2"><CheckCircle2 className="size-4 text-amber shrink-0 mt-0.5" /> Tutto del piano base</li>
                  <li className="flex gap-2"><CheckCircle2 className="size-4 text-amber shrink-0 mt-0.5" /> Modifiche manuali prioritarie</li>
                </ul>
                <Button variant="amber" onClick={() => handleCheckout("with_setup")}>Procedi con personalizzazione</Button>
              </div>
            </div>
          </div>
        )}

        {isOpen && (
          <div className="rounded-3xl border border-border bg-surface-elevated p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-semibold">Completa il pagamento</h3>
              <button onClick={closeCheckout} className="text-sm text-muted-foreground hover:text-foreground">Annulla</button>
            </div>
            {checkoutElement}
          </div>
        )}

        {/* Fatturazione */}
        <div className="rounded-3xl border border-border bg-surface-elevated p-8">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2"><CreditCard className="size-5 text-amber" /><h2 className="text-xl font-display font-semibold">Fatturazione</h2></div>
            {hasActiveSub && (
              <Button variant="outline" size="sm" onClick={openPortal} disabled={portalLoading}>
                {portalLoading ? "Apertura..." : "Modifica metodo / abbonamento"} <ExternalLink className="size-4" />
              </Button>
            )}
          </div>
          {subscriptions.length === 0 && purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun pagamento ancora registrato.</p>
          ) : (
            <div className="space-y-4">
              {subscriptions.length > 0 && (
                <div>
                  <p className="text-[10px] font-display tracking-[0.3em] text-muted-foreground uppercase mb-2">Abbonamenti</p>
                  <div className="space-y-2">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className="flex flex-wrap items-center justify-between gap-2 text-sm border border-border rounded-md p-3">
                        <div>
                          <p className="font-medium">{sub.price_id}</p>
                          <p className="text-xs text-muted-foreground">
                            Stato: {sub.status}
                            {sub.current_period_end && ` · Rinnovo: ${new Date(sub.current_period_end).toLocaleDateString("it-IT")}`}
                            {sub.cancel_at_period_end && " · Cancellazione programmata"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {purchases.length > 0 && (
                <div>
                  <p className="text-[10px] font-display tracking-[0.3em] text-muted-foreground uppercase mb-2">Pagamenti</p>
                  <div className="space-y-2">
                    {purchases.map((p) => (
                      <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 text-sm border border-border rounded-md p-3">
                        <div>
                          <p className="font-medium">{p.price_id || p.mode}</p>
                          <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("it-IT")}</p>
                        </div>
                        <p className="font-display">{formatMoney(p.amount_total, p.currency || "eur")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dati cliente editabili */}
        <form onSubmit={saveData} className="rounded-3xl border border-border bg-surface-elevated p-8 space-y-4">
          <div className="flex items-center gap-2 mb-2"><Building2 className="size-5 text-amber" /><h2 className="text-xl font-display font-semibold">I tuoi dati</h2></div>
          <p className="text-sm text-muted-foreground -mt-1 mb-2">Tieni aggiornate le info: il team le userà per costruire o modificare il sito.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm space-y-1"><span className="text-muted-foreground text-xs">Nome attività</span><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></label>
            <label className="text-sm space-y-1"><span className="text-muted-foreground text-xs">Città</span><Input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} /></label>
            <label className="text-sm space-y-1 sm:col-span-2"><span className="text-muted-foreground text-xs">Indirizzo</span><Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} /></label>
            <label className="text-sm space-y-1"><span className="text-muted-foreground text-xs">Telefono</span><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></label>
            <label className="text-sm space-y-1"><span className="text-muted-foreground text-xs">Email</span><Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></label>
            <label className="text-sm space-y-1 sm:col-span-2"><span className="text-muted-foreground text-xs">Orari</span><Input value={editForm.opening_hours} onChange={(e) => setEditForm({ ...editForm, opening_hours: e.target.value })} /></label>
            <label className="text-sm space-y-1 sm:col-span-2"><span className="text-muted-foreground text-xs">Identità / descrizione</span><Textarea rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} /></label>
            <label className="text-sm space-y-1 sm:col-span-2"><span className="text-muted-foreground text-xs">Servizi / prodotti / menù</span><Textarea rows={3} value={editForm.services} onChange={(e) => setEditForm({ ...editForm, services: e.target.value })} /></label>
            <label className="text-sm space-y-1 sm:col-span-2"><span className="text-muted-foreground text-xs">Note per il team</span><Textarea rows={2} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} /></label>
            <label className="text-sm space-y-1"><span className="text-muted-foreground text-xs">Colore primario</span><Input type="color" value={editForm.primary_color} onChange={(e) => setEditForm({ ...editForm, primary_color: e.target.value })} /></label>
            <label className="text-sm space-y-1"><span className="text-muted-foreground text-xs">Colore secondario</span><Input type="color" value={editForm.secondary_color} onChange={(e) => setEditForm({ ...editForm, secondary_color: e.target.value })} /></label>
          </div>
          <div className="flex justify-end">
            <Button variant="amber" disabled={savingEdit}><Save className="size-4" /> {savingEdit ? "Salvataggio…" : "Salva modifiche"}</Button>
          </div>
        </form>

        {/* Ticket */}
        <div className="rounded-3xl border border-border bg-surface-elevated p-8">
          <div className="flex items-center gap-2 mb-2"><MessagesSquare className="size-5 text-amber" /><h2 className="text-xl font-display font-semibold">Assistenza</h2></div>
          <p className="text-sm text-muted-foreground mb-6">Apri un ticket per domande, modifiche o bug.</p>

          <form onSubmit={submitTicket} className="grid gap-4 mb-6">
            <div className="grid sm:grid-cols-[1fr_180px] gap-3">
              <Input placeholder="Oggetto" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} required />
              <select value={ticketCategory} onChange={(e) => setTicketCategory(e.target.value as typeof ticketCategory)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="general">Domanda generale</option>
                <option value="edit_request">Richiesta modifica</option>
                <option value="bug">Segnala un bug</option>
                <option value="billing">Fatturazione</option>
              </select>
            </div>
            <Textarea rows={4} placeholder="Descrivi la richiesta..." value={ticketBody} onChange={(e) => setTicketBody(e.target.value)} required />
            <div className="flex justify-end">
              <Button variant="amber" disabled={submittingTicket}>{submittingTicket ? "Invio..." : "Invia ticket"}</Button>
            </div>
          </form>

          {tickets.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-display tracking-[0.3em] text-muted-foreground uppercase mb-3">Storico</p>
              {tickets.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-b-0 text-sm">
                  <div>
                    <p className="font-medium">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("it-IT")} · {t.category}</p>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-amber">{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upgrade / pacchetti avanzati */}
        <div className="rounded-3xl border border-border bg-surface-elevated p-8">
          <div className="flex items-center gap-2 mb-2"><Sparkles className="size-5 text-amber" /><h2 className="text-xl font-display font-semibold">Vai oltre</h2></div>
          <p className="text-sm text-muted-foreground mb-6">Pacchetti avanzati e servizi extra del team Desk Industries.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border p-6">
              <p className="text-[10px] font-display tracking-[0.3em] text-amber uppercase mb-3">Assistenza completa</p>
              <p className="text-sm text-muted-foreground mb-4">Modifiche illimitate, priorità sul team, copywriting, SEO local e supporto via chat.</p>
              <Button asChild variant="outline" className="w-full"><a href="mailto:master@deskindustries.com?subject=Upgrade%20assistenza%20completa%20-%20Foll.IA">Richiedi preventivo</a></Button>
            </div>
            <div className="rounded-2xl border border-border p-6">
              <p className="text-[10px] font-display tracking-[0.3em] text-amber uppercase mb-3">Dominio personalizzato</p>
              <p className="text-sm text-muted-foreground mb-4">Collega il tuo dominio (es. tuonome.it) e gestiamo noi configurazione e certificati.</p>
              <Button asChild variant="outline" className="w-full"><a href="mailto:master@deskindustries.com?subject=Dominio%20personalizzato%20-%20Foll.IA">Attiva dominio</a></Button>
            </div>
          </div>
        </div>

        {/* Altri servizi Desk Industries */}
        <div className="rounded-3xl border border-border bg-surface-elevated p-8">
          <h2 className="text-xl font-display font-semibold mb-2">Altri servizi Desk Industries</h2>
          <p className="text-sm text-muted-foreground mb-6">Esplora gli strumenti collegati al tuo account.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link to="/tools/ottimizzatore-seo" className="rounded-2xl border border-border p-5 hover:border-amber transition">
              <p className="font-display font-semibold mb-1">SEO Optimizer</p>
              <p className="text-xs text-muted-foreground">Ottimizza contenuti e meta tag con AI.</p>
            </Link>
            <Link to="/pacchetti" className="rounded-2xl border border-border p-5 hover:border-amber transition">
              <p className="font-display font-semibold mb-1">Tutti i servizi</p>
              <p className="text-xs text-muted-foreground">Scopri cosa può fare per te Desk Industries.</p>
            </Link>
          </div>
        </div>

        {/* Vendite + referral */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-border bg-surface-elevated p-8">
            <div className="flex items-center gap-2 mb-2"><Mail className="size-5 text-amber" /><h3 className="font-display font-semibold">Reparto vendite</h3></div>
            <p className="text-sm text-muted-foreground mb-4">Hai bisogno di un preventivo personalizzato o di un servizio non in catalogo?</p>
            <Button asChild variant="amber" className="w-full">
              <a href="mailto:master@deskindustries.com?subject=Richiesta%20preventivo%20-%20Cliente%20Foll.IA">Scrivi a master@deskindustries.com</a>
            </Button>
          </div>
          <div className="rounded-3xl border border-dashed border-border bg-surface-elevated p-8 opacity-80">
            <div className="flex items-center gap-2 mb-2"><Share2 className="size-5 text-amber" /><h3 className="font-display font-semibold">Programma referral</h3></div>
            <p className="text-sm text-muted-foreground mb-4">Presto potrai invitare altre attività e ricevere credito sul tuo abbonamento.</p>
            <Button variant="outline" disabled className="w-full">In arrivo</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
