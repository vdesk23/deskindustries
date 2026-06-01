import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import { getMyFolliaSite, createFolliaTicket } from "@/lib/follia-account.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ExternalLink, CreditCard, MessagesSquare, Clock, CheckCircle2 } from "lucide-react";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { toast } from "sonner";

export const Route = createFileRoute("/account/sites/$siteId")({
  head: () => ({
    meta: [
      { title: "Richiesta Foll.IA — Desk Industries" },
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
  business_data: { name?: string } & Record<string, unknown>;
  status: string;
  request_status: string;
  plan: string | null;
  has_full_assistance: boolean;
  published_url: string | null;
};

type Ticket = { id: string; subject: string; status: string; category: string; created_at: string };

const STATUS_LABEL: Record<string, string> = {
  new: "Richiesta ricevuta",
  in_progress: "In lavorazione",
  awaiting_payment: "Pronto per pagamento",
  live: "Online",
  archived: "Archiviato",
};

function SiteDetailPage() {
  const { siteId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fetchSite = useServerFn(getMyFolliaSite);
  const createTicket = useServerFn(createFolliaTicket);

  const [site, setSite] = useState<Site | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

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
        setSite(r.site as Site);
        setTickets(r.tickets as Ticket[]);
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

  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        <Link to="/account" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4" /> Torna all'area cliente
        </Link>

        <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
          <div>
            <p className={`text-xs font-display tracking-[0.3em] uppercase mb-3 ${isLive ? "text-emerald-500" : isAwaitingPayment ? "text-amber" : "text-muted-foreground"}`}>
              {STATUS_LABEL[status] || status}
            </p>
            <h1 className="text-4xl lg:text-5xl font-display font-medium tracking-tight">{name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{site.custom_domain || site.published_url || `${site.subdomain}.deskinc.app (richiesto)`}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {isLive && site.published_url && (
              <Button asChild variant="amber"><a href={site.published_url} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> Visita sito online</a></Button>
            )}
            {isLive && (
              <Button variant="outline" onClick={openPortal} disabled={portalLoading}>
                {portalLoading ? "Apertura..." : "Gestisci abbonamento"} <ExternalLink className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {!isLive && !isAwaitingPayment && (
          <div className="rounded-3xl border border-border bg-surface-elevated p-8 mb-6">
            <div className="flex items-center gap-2 mb-2"><Clock className="size-5 text-amber" /><h2 className="text-xl font-display font-semibold">Stiamo lavorando alla tua richiesta</h2></div>
            <p className="text-sm text-muted-foreground">
              Il nostro team sta costruendo il tuo sito. Ti contatteremo non appena sarà pronto: lo riceverai qui in dashboard insieme al link per il pagamento. Per qualsiasi richiesta o modifica usa il modulo ticket qui sotto.
            </p>
          </div>
        )}

        {isAwaitingPayment && (
          <div className="rounded-3xl border border-amber/40 bg-amber/5 p-8 mb-8">
            <div className="flex items-center gap-2 mb-3"><CreditCard className="size-5 text-amber" /><h2 className="text-xl font-display font-semibold">Il tuo sito è pronto</h2></div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">Procedi al pagamento per pubblicarlo. Scegli il piano confermato con il team.</p>
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
          <div className="rounded-3xl border border-border bg-surface-elevated p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-semibold">Completa il pagamento</h3>
              <button onClick={closeCheckout} className="text-sm text-muted-foreground hover:text-foreground">Annulla</button>
            </div>
            {checkoutElement}
          </div>
        )}

        <div className="rounded-3xl border border-border bg-surface-elevated p-8">
          <div className="flex items-center gap-2 mb-2"><MessagesSquare className="size-5 text-amber" /><h2 className="text-xl font-display font-semibold">Assistenza</h2></div>
          <p className="text-sm text-muted-foreground mb-6">Hai domande, vuoi richiedere modifiche o segnalare qualcosa? Apri un ticket.</p>

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
      </div>
    </section>
  );
}
