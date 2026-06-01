import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adminGetSite, adminUpdateSite, adminMarkAwaitingPayment } from "@/lib/follia-admin.functions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, CreditCard, ExternalLink, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/admin/sites/$siteId")({
  component: AdminSiteDetail,
});

const REQUEST_STATUSES = [
  { value: "new", label: "Nuova richiesta" },
  { value: "in_progress", label: "In lavorazione" },
  { value: "awaiting_payment", label: "In attesa di pagamento" },
  { value: "live", label: "Online" },
  { value: "archived", label: "Archiviata" },
];

const TICKET_STATUS_LABEL: Record<string, string> = {
  open: "Aperto",
  awaiting_payment: "Attesa pagamento",
  in_progress: "In lavorazione",
  resolved: "Risolto",
  closed: "Chiuso",
};

function formatMoney(cents: number | null | undefined, currency = "eur") {
  if (cents == null) return "—";
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

function AdminSiteDetail() {
  const { siteId } = Route.useParams();
  const getSite = useServerFn(adminGetSite);
  const update = useServerFn(adminUpdateSite);
  const markPay = useServerFn(adminMarkAwaitingPayment);
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState({
    request_status: "new",
    plan: "",
    published_url: "",
    internal_notes: "",
    has_full_assistance: false,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = () => {
    getSite({ data: { siteId } }).then((r) => {
      setData(r);
      const s = r.site;
      setForm({
        request_status: s.request_status || "new",
        plan: s.plan || "",
        published_url: s.published_url || "",
        internal_notes: s.internal_notes || "",
        has_full_assistance: !!s.has_full_assistance,
      });
    });
  };

  useEffect(() => { load(); }, [siteId]);

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      await update({
        data: {
          siteId,
          patch: {
            request_status: form.request_status as any,
            plan: form.plan || null,
            published_url: form.published_url || null,
            internal_notes: form.internal_notes || null,
            has_full_assistance: form.has_full_assistance,
          },
        },
      });
      setMsg("Salvato.");
      load();
    } catch (e) {
      setMsg((e as Error).message);
    } finally { setSaving(false); }
  };

  const generatePaymentLink = async (plan: "basic" | "with_setup") => {
    try {
      await markPay({ data: { siteId, plan } });
      setMsg(`Richiesta passata in attesa di pagamento (${plan}).`);
      load();
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  const copyPrompt = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  if (!data) return <p className="text-muted-foreground">Caricamento…</p>;
  const s = data.site;
  const bd = s.business_data || {};
  const cfg = s.config || {};
  const name = bd.name || s.subdomain;
  const prompt: string = bd.lovable_prompt || "";
  const tickets: any[] = data.tickets || [];
  const purchases: any[] = data.purchases || [];
  const subscriptions: any[] = data.subscriptions || [];

  return (
    <div className="space-y-6">
      <Link to="/admin/sites" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Indietro
      </Link>

      <div className="rounded-2xl border border-border bg-surface-elevated p-6">
        <h2 className="font-display text-xl font-semibold mb-1">{name}</h2>
        <p className="text-xs text-muted-foreground">
          Lead: {s.lead_email} · Proprietario: {data.ownerName ? `${data.ownerName} (${data.ownerEmail})` : (data.ownerEmail || (s.user_id ? s.user_id : "—"))}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Sottodominio richiesto: <strong>{s.subdomain}.deskinc.app</strong> · Tipo: {s.business_type}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Creato: {new Date(s.created_at).toLocaleString("it-IT")}
        </p>
      </div>

      {/* Dati cliente */}
      <div className="rounded-2xl border border-border bg-surface-elevated p-6">
        <h3 className="font-display text-lg font-semibold mb-3">Dati cliente</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <p><span className="text-muted-foreground">Nome attività:</span> {bd.name || "—"}</p>
          <p><span className="text-muted-foreground">Città:</span> {bd.city || "—"}</p>
          <p><span className="text-muted-foreground">Indirizzo:</span> {cfg.address || "—"}</p>
          <p><span className="text-muted-foreground">Telefono:</span> {cfg.phone || "—"}</p>
          <p><span className="text-muted-foreground">Email:</span> {cfg.email || s.lead_email}</p>
          <p><span className="text-muted-foreground">Orari:</span> {cfg.opening_hours || "—"}</p>
          <p>
            <span className="text-muted-foreground">Colori:</span>{" "}
            <span className="inline-block size-3 rounded-full align-middle mr-1" style={{ background: bd.primary_color }} />{bd.primary_color || "—"}
            {" / "}
            <span className="inline-block size-3 rounded-full align-middle mr-1" style={{ background: bd.secondary_color }} />{bd.secondary_color || "—"}
          </p>
        </div>
        {(bd.description || bd.services || bd.notes) && (
          <div className="mt-4 grid gap-3 text-sm">
            {bd.description && <p><span className="text-muted-foreground block text-xs uppercase tracking-widest mb-1">Identità</span>{bd.description}</p>}
            {bd.services && <p><span className="text-muted-foreground block text-xs uppercase tracking-widest mb-1">Servizi / prodotti</span>{bd.services}</p>}
            {bd.notes && <p><span className="text-muted-foreground block text-xs uppercase tracking-widest mb-1">Note del cliente</span>{bd.notes}</p>}
          </div>
        )}
      </div>

      {/* Prompt Lovable */}
      {prompt && (
        <div className="rounded-2xl border border-border bg-surface-elevated p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg font-semibold">Prompt Lovable</h3>
            <Button variant="outline" size="sm" onClick={() => copyPrompt(prompt)}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copiato" : "Copia"}
            </Button>
          </div>
          <pre className="text-xs whitespace-pre-wrap font-mono bg-background border border-border rounded-md p-4 max-h-96 overflow-auto">{prompt}</pre>
        </div>
      )}

      {/* Fatturazione */}
      <div className="rounded-2xl border border-border bg-surface-elevated p-6">
        <h3 className="font-display text-lg font-semibold mb-3">Fatturazione</h3>
        {subscriptions.length === 0 && purchases.length === 0 && (
          <p className="text-sm text-muted-foreground">Nessun pagamento registrato.</p>
        )}
        {subscriptions.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-display tracking-[0.3em] text-muted-foreground uppercase mb-2">Abbonamenti</p>
            <div className="space-y-2">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex flex-wrap items-center justify-between gap-2 text-sm border border-border rounded-md p-3">
                  <div>
                    <p className="font-medium">{sub.price_id}</p>
                    <p className="text-xs text-muted-foreground">
                      Stato: {sub.status} · Env: {sub.environment}
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
                    <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("it-IT")} · Env: {p.environment}</p>
                  </div>
                  <p className="font-display">{formatMoney(p.amount_total, p.currency || "eur")}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tickets */}
      <div className="rounded-2xl border border-border bg-surface-elevated p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-semibold">Ticket</h3>
          <Link to="/admin/tickets" className="text-xs text-muted-foreground hover:text-foreground">Tutti i ticket →</Link>
        </div>
        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessun ticket.</p>
        ) : (
          <div className="space-y-2">
            {tickets.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-b-0 text-sm">
                <div>
                  <p className="font-medium">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("it-IT")} · {t.category}</p>
                </div>
                <span className="text-xs uppercase tracking-widest text-amber">{TICKET_STATUS_LABEL[t.status] || t.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gestione */}
      <div className="rounded-2xl border border-border bg-surface-elevated p-6 space-y-4">
        <h3 className="font-display text-lg font-semibold">Gestione richiesta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm space-y-1">
            <span className="text-muted-foreground">Stato richiesta</span>
            <select className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.request_status} onChange={(e) => setForm({ ...form, request_status: e.target.value })}>
              {REQUEST_STATUSES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </label>
          <label className="text-sm space-y-1">
            <span className="text-muted-foreground">Piano</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2" placeholder="es. basic_19, with_setup_297" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} />
          </label>
          <label className="text-sm space-y-1 md:col-span-2">
            <span className="text-muted-foreground">URL sito pubblicato (Lovable project)</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2" placeholder="https://progetto.lovable.app" value={form.published_url} onChange={(e) => setForm({ ...form, published_url: e.target.value })} />
          </label>
          <label className="text-sm flex items-center gap-2 md:col-span-2">
            <input type="checkbox" checked={form.has_full_assistance} onChange={(e) => setForm({ ...form, has_full_assistance: e.target.checked })} />
            <span>Assistenza completa attiva</span>
          </label>
          <label className="text-sm space-y-1 md:col-span-2">
            <span className="text-muted-foreground">Note interne (non visibili al cliente)</span>
            <textarea rows={4} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })} />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="amber" onClick={save} disabled={saving}>
            <Save className="size-4" /> {saving ? "Salvataggio…" : "Salva"}
          </Button>
          {form.published_url && (
            <Button asChild variant="outline">
              <a href={form.published_url} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" /> Apri sito
              </a>
            </Button>
          )}
          {msg && <span className="text-sm">{msg}</span>}
        </div>
      </div>

      <div className="rounded-2xl border border-amber/40 bg-amber/5 p-6 space-y-3">
        <h3 className="font-display text-lg font-semibold">Genera link di pagamento</h3>
        <p className="text-sm text-muted-foreground">
          Passa la richiesta a "in attesa di pagamento": il cliente vedrà il bottone "Procedi al pagamento" nella sua dashboard.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => generatePaymentLink("basic")}>
            <CreditCard className="size-4" /> Piano base — 19€/mese
          </Button>
          <Button variant="amber" onClick={() => generatePaymentLink("with_setup")}>
            <CreditCard className="size-4" /> Con setup — 297€ + 19€/mese
          </Button>
        </div>
      </div>
    </div>
  );
}
