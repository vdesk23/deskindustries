import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adminGetSite, adminUpdateSite } from "@/lib/follia-admin.functions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

export const Route = createFileRoute("/admin/sites/$siteId")({
  component: AdminSiteDetail,
});

function AdminSiteDetail() {
  const { siteId } = Route.useParams();
  const getSite = useServerFn(adminGetSite);
  const update = useServerFn(adminUpdateSite);
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState({
    status: "",
    plan: "",
    subdomain: "",
    custom_domain: "",
    has_full_assistance: false,
    business_data: "",
    config: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    getSite({ data: { siteId } }).then((r) => {
      setData(r);
      const s = r.site;
      setForm({
        status: s.status || "",
        plan: s.plan || "",
        subdomain: s.subdomain || "",
        custom_domain: s.custom_domain || "",
        has_full_assistance: !!s.has_full_assistance,
        business_data: JSON.stringify(s.business_data || {}, null, 2),
        config: JSON.stringify(s.config || {}, null, 2),
      });
    });
  }, [siteId, getSite]);

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      let business_data: any, config: any;
      try { business_data = JSON.parse(form.business_data); } catch { throw new Error("business_data JSON non valido"); }
      try { config = JSON.parse(form.config); } catch { throw new Error("config JSON non valido"); }
      await update({
        data: {
          siteId,
          patch: {
            status: form.status as any,
            plan: form.plan || null,
            subdomain: form.subdomain,
            custom_domain: form.custom_domain || null,
            has_full_assistance: form.has_full_assistance,
            business_data,
            config,
          },
        },
      });
      setMsg("Salvato.");
    } catch (e) {
      setMsg((e as Error).message);
    } finally { setSaving(false); }
  };

  if (!data) return <p className="text-muted-foreground">Caricamento…</p>;
  const s = data.site;

  return (
    <div className="space-y-6">
      <Link to="/admin/sites" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Indietro
      </Link>

      <div className="rounded-2xl border border-border bg-surface-elevated p-6">
        <h2 className="font-display text-xl font-semibold mb-1">{s.business_data?.name || s.subdomain}</h2>
        <p className="text-xs text-muted-foreground">
          Lead: {s.lead_email} · Proprietario: {data.ownerEmail || (s.user_id ? s.user_id : "—")}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Creato: {new Date(s.created_at).toLocaleString("it-IT")}
        </p>
        <div className="mt-3">
          <a href={`/s/${s.subdomain}?preview=1`} target="_blank" rel="noreferrer" className="text-sm text-amber underline">
            Apri anteprima →
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface-elevated p-6 space-y-4">
        <h3 className="font-display text-lg font-semibold">Configurazione</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm space-y-1">
            <span className="text-muted-foreground">Status</span>
            <select className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {["draft", "awaiting_payment", "in_review", "live", "suspended"].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
          <label className="text-sm space-y-1">
            <span className="text-muted-foreground">Plan</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} />
          </label>
          <label className="text-sm space-y-1">
            <span className="text-muted-foreground">Subdomain</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.subdomain} onChange={(e) => setForm({ ...form, subdomain: e.target.value })} />
          </label>
          <label className="text-sm space-y-1">
            <span className="text-muted-foreground">Custom domain</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2" value={form.custom_domain} onChange={(e) => setForm({ ...form, custom_domain: e.target.value })} />
          </label>
          <label className="text-sm flex items-center gap-2 md:col-span-2">
            <input type="checkbox" checked={form.has_full_assistance} onChange={(e) => setForm({ ...form, has_full_assistance: e.target.checked })} />
            <span>Assistenza completa attiva</span>
          </label>
        </div>

        <label className="block text-sm space-y-1">
          <span className="text-muted-foreground">business_data (JSON)</span>
          <textarea rows={10} className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs" value={form.business_data} onChange={(e) => setForm({ ...form, business_data: e.target.value })} />
        </label>

        <label className="block text-sm space-y-1">
          <span className="text-muted-foreground">config (JSON)</span>
          <textarea rows={8} className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs" value={form.config} onChange={(e) => setForm({ ...form, config: e.target.value })} />
        </label>

        <div className="flex items-center gap-3">
          <Button variant="amber" onClick={save} disabled={saving}>
            <Save className="size-4" /> {saving ? "Salvataggio…" : "Salva"}
          </Button>
          {msg && <span className="text-sm">{msg}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="rounded-xl border border-border p-4"><p className="text-muted-foreground text-xs">Menu</p><p className="text-2xl font-display">{data.menu.length}</p></div>
        <div className="rounded-xl border border-border p-4"><p className="text-muted-foreground text-xs">Prodotti</p><p className="text-2xl font-display">{data.products.length}</p></div>
        <div className="rounded-xl border border-border p-4"><p className="text-muted-foreground text-xs">Servizi</p><p className="text-2xl font-display">{data.services.length}</p></div>
        <div className="rounded-xl border border-border p-4"><p className="text-muted-foreground text-xs">Ticket</p><p className="text-2xl font-display">{data.tickets.length}</p></div>
      </div>
    </div>
  );
}
