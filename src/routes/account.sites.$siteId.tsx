import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import {
  getMyFolliaSite,
  updateMyFolliaSiteConfig,
  createFolliaTicket,
} from "@/lib/follia-account.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ExternalLink, Eye, Rocket, MessagesSquare, Settings, CheckCircle2 } from "lucide-react";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { AssistanceFab } from "@/components/follia/AssistanceFab";
import { toast } from "sonner";

export const Route = createFileRoute("/account/sites/$siteId")({
  head: () => ({
    meta: [
      { title: "Sito Foll.IA — Desk Industries" },
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
  business_data: { name?: string; generated?: Record<string, unknown> } & Record<string, unknown>;
  config: {
    show_map?: boolean;
    opening_hours?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  status: string;
  plan: string | null;
  has_full_assistance: boolean;
};

type Ticket = { id: string; subject: string; status: string; category: string; created_at: string };

function SiteDetailPage() {
  const { siteId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fetchSite = useServerFn(getMyFolliaSite);
  const updateConfig = useServerFn(updateMyFolliaSiteConfig);
  const createTicket = useServerFn(createFolliaTicket);

  const [site, setSite] = useState<Site | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const [config, setConfig] = useState<Site["config"]>({});
  const [savingConfig, setSavingConfig] = useState(false);

  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketBody, setTicketBody] = useState("");
  const [ticketCategory, setTicketCategory] = useState<"general" | "edit_request" | "bug" | "billing">("general");
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const { openCheckout, checkoutElement, isOpen, closeCheckout } = useStripeCheckout();

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
        setConfig((r.site as Site).config || {});
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [fetchSite, siteId]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (authLoading || !user || loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Caricamento...</div>;
  }
  if (!site) {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Sito non trovato.</div>;
  }

  const name = site.business_data?.name || site.subdomain;
  const previewUrl = `/s/${site.subdomain}?preview=1`;
  const publicUrl = `/s/${site.subdomain}`;
  const isLive = site.status === "live";

  const isInReview = site.status === "in_review";
  const isDraft = site.status === "draft";
  const canEditRequests = site.plan === "with_setup_297" && (isInReview || isLive);

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

  const saveConfig = async () => {
    setSavingConfig(true);
    try {
      await updateConfig({ data: { siteId: site.id, config } });
      toast.success("Configurazione salvata");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingConfig(false);
    }
  };

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketBody.trim()) return;
    setSubmittingTicket(true);
    try {
      const r = await createTicket({
        data: { siteId: site.id, subject: ticketSubject, body: ticketBody, category: ticketCategory },
      });
      if (!r.ok) {
        toast.error(r.error);
      } else {
        toast.success("Ticket inviato");
        setTicketSubject("");
        setTicketBody("");
        setTicketCategory("general");
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
      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        <Link to="/account/sites" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4" /> Tutti i siti
        </Link>

        <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
          <div>
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-3">
              Foll.IA · {site.status === "live" ? "Online" : site.status === "in_review" ? "In revisione" : "Bozza"}
            </p>
            <h1 className="text-4xl lg:text-5xl font-display font-medium tracking-tight">{name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {site.custom_domain || `${site.subdomain}.deskinc.app`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button asChild variant="outline">
              <a href={previewUrl} target="_blank" rel="noreferrer">
                <Eye className="size-4" /> Anteprima
              </a>
            </Button>
            {isLive && (
              <Button asChild variant="amber">
                <a href={publicUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" /> Apri sito pubblico
                </a>
              </Button>
            )}
            {isLive && (
              <Button variant="outline" onClick={openPortal} disabled={portalLoading}>
                {portalLoading ? "Apertura..." : "Gestisci abbonamento"} <ExternalLink className="size-4" />
              </Button>
            )}
          </div>
        </div>


        {/* CTA pagamento per draft */}
        {isDraft && (
          <div className="rounded-3xl border border-amber/40 bg-amber/5 p-8 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="size-5 text-amber" />
              <h2 className="text-xl font-display font-semibold">Pubblica il tuo sito</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
              Scegli come vuoi andare online. Puoi mettere il sito live subito, oppure richiedere modifiche curate dal team prima della pubblicazione.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-background p-6 flex flex-col">
                <p className="text-[10px] font-display tracking-[0.3em] text-amber uppercase mb-3">Subito online</p>
                <p className="text-3xl font-display font-medium mb-1">19€<span className="text-sm text-muted-foreground">/mese</span></p>
                <p className="text-xs text-muted-foreground mb-4">IVA esclusa · nessuna setup fee</p>
                <ul className="text-sm space-y-1.5 text-muted-foreground mb-6 flex-1">
                  <li className="flex gap-2"><CheckCircle2 className="size-4 text-amber shrink-0 mt-0.5" /> Hosting + dominio incluso</li>
                  <li className="flex gap-2"><CheckCircle2 className="size-4 text-amber shrink-0 mt-0.5" /> Dashboard self-service</li>
                  <li className="flex gap-2"><CheckCircle2 className="size-4 text-amber shrink-0 mt-0.5" /> Niente modifiche manuali</li>
                </ul>
                <Button variant="outline" onClick={() => handleCheckout("basic")}>Pubblica ora</Button>
              </div>
              <div className="rounded-2xl border-2 border-amber bg-background p-6 flex flex-col relative">
                <span className="absolute -top-2.5 left-6 px-2 py-0.5 rounded-full bg-amber text-amber-foreground text-[10px] font-display tracking-widest uppercase">Consigliato</span>
                <p className="text-[10px] font-display tracking-[0.3em] text-amber uppercase mb-3">Con modifiche</p>
                <p className="text-3xl font-display font-medium mb-1">297€<span className="text-sm text-muted-foreground"> + 19€/mese</span></p>
                <p className="text-xs text-muted-foreground mb-4">Setup fee una tantum · IVA esclusa</p>
                <ul className="text-sm space-y-1.5 text-muted-foreground mb-6 flex-1">
                  <li className="flex gap-2"><CheckCircle2 className="size-4 text-amber shrink-0 mt-0.5" /> Tutto del piano base</li>
                  <li className="flex gap-2"><CheckCircle2 className="size-4 text-amber shrink-0 mt-0.5" /> Richieste modifiche manuali via ticket</li>
                  <li className="flex gap-2"><CheckCircle2 className="size-4 text-amber shrink-0 mt-0.5" /> Pubblicazione dopo revisione</li>
                </ul>
                <Button variant="amber" onClick={() => handleCheckout("with_setup")}>Procedi con modifiche</Button>
              </div>
            </div>
          </div>
        )}

        {/* Checkout embedded */}
        {isOpen && (
          <div className="rounded-3xl border border-border bg-surface-elevated p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-semibold">Completa il pagamento</h3>
              <button onClick={closeCheckout} className="text-sm text-muted-foreground hover:text-foreground">Annulla</button>
            </div>
            {checkoutElement}
          </div>
        )}

        {/* Configurazione generale */}
        <div className="rounded-3xl border border-border bg-surface-elevated p-8 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="size-5 text-amber" />
            <h2 className="text-xl font-display font-semibold">Configurazione generale</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Indirizzo</Label>
              <Input value={config.address || ""} onChange={(e) => setConfig({ ...config, address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Telefono</Label>
              <Input value={config.phone || ""} onChange={(e) => setConfig({ ...config, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email pubblica</Label>
              <Input type="email" value={config.email || ""} onChange={(e) => setConfig({ ...config, email: e.target.value })} />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label>Mostra Google Maps</Label>
              <div className="flex items-center gap-3 h-10">
                <Switch checked={!!config.show_map} onCheckedChange={(v) => setConfig({ ...config, show_map: v })} />
                <span className="text-sm text-muted-foreground">{config.show_map ? "Visibile sul sito" : "Nascosta"}</span>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Orari di apertura</Label>
              <Textarea
                rows={3}
                placeholder="Lun-Ven 9:00-18:00&#10;Sab 9:00-13:00&#10;Dom chiuso"
                value={config.opening_hours || ""}
                onChange={(e) => setConfig({ ...config, opening_hours: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="amber" disabled={savingConfig} onClick={saveConfig}>
              {savingConfig ? "Salvataggio..." : "Salva configurazione"}
            </Button>
          </div>
        </div>

        {/* Tickets */}
        <div className="rounded-3xl border border-border bg-surface-elevated p-8">
          <div className="flex items-center gap-2 mb-2">
            <MessagesSquare className="size-5 text-amber" />
            <h2 className="text-xl font-display font-semibold">Assistenza</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Max 5 ticket ogni 30 giorni. Per modifiche manuali al sito serve il piano con setup fee.
          </p>

          <form onSubmit={submitTicket} className="grid gap-4 mb-6">
            <div className="grid sm:grid-cols-[1fr_180px] gap-3">
              <Input
                placeholder="Oggetto"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                required
              />
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value as typeof ticketCategory)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="general">Domanda generale</option>
                <option value="bug">Segnala un bug</option>
                <option value="billing">Fatturazione</option>
                <option value="edit_request" disabled={!canEditRequests}>
                  Richiesta modifica {canEditRequests ? "" : "(non disponibile)"}
                </option>
              </select>
            </div>
            <Textarea
              rows={4}
              placeholder="Descrivi la richiesta..."
              value={ticketBody}
              onChange={(e) => setTicketBody(e.target.value)}
              required
            />
            <div className="flex justify-end">
              <Button variant="amber" disabled={submittingTicket}>
                {submittingTicket ? "Invio..." : "Invia ticket"}
              </Button>
            </div>
          </form>

          {tickets.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-display tracking-[0.3em] text-muted-foreground uppercase mb-3">Storico</p>
              {tickets.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-b-0 text-sm">
                  <div>
                    <p className="font-medium">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString("it-IT")} · {t.category}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-amber">{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <AssistanceFab siteId={site.id} siteName={name} hasFullAssistance={!!site.has_full_assistance} />
    </section>
  );
}
