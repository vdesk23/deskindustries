import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adminListSites, adminAssignSite, adminDeleteSite, adminUpdateSite } from "@/lib/follia-admin.functions";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, UserPlus, Rocket, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/sites")({
  component: AdminSitesList,
});

type Site = {
  id: string;
  subdomain: string;
  custom_domain: string | null;
  business_data: { name?: string } & Record<string, unknown>;
  lead_email: string;
  status: string;
  plan: string | null;
  has_full_assistance: boolean;
  user_id: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Bozza",
  awaiting_payment: "Attesa pagamento",
  in_review: "In revisione",
  live: "Online",
  suspended: "Sospeso",
};

function AdminSitesList() {
  const list = useServerFn(adminListSites);
  const assign = useServerFn(adminAssignSite);
  const del = useServerFn(adminDeleteSite);
  const update = useServerFn(adminUpdateSite);
  const [sites, setSites] = useState<Site[]>([]);
  const [search, setSearch] = useState("");
  const [claimed, setClaimed] = useState<"all" | "yes" | "no">("all");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    list({ data: { search: search || undefined, status: status || undefined, claimed } })
      .then((r) => setSites(r.sites as Site[]))
      .finally(() => setLoading(false));
  }, [list, search, status, claimed]);

  useEffect(() => { load(); }, [load]);

  const handleAssign = async (id: string) => {
    const email = prompt("Email account a cui assegnare il sito:");
    if (!email) return;
    try { await assign({ data: { siteId: id, email } }); load(); }
    catch (e) { alert((e as Error).message); }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare definitivamente questo sito e tutti i dati collegati?")) return;
    try { await del({ data: { siteId: id } }); load(); }
    catch (e) { alert((e as Error).message); }
  };
  const togglePublish = async (s: Site) => {
    const next = s.status === "live" ? "draft" : "live";
    try { await update({ data: { siteId: s.id, patch: { status: next } } }); load(); }
    catch (e) { alert((e as Error).message); }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per subdomain, email, dominio…"
          className="flex-1 min-w-[200px] rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
          <option value="">Tutti gli stati</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={claimed} onChange={(e) => setClaimed(e.target.value as any)} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
          <option value="all">Tutti</option>
          <option value="yes">Reclamati</option>
          <option value="no">Non reclamati</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Caricamento…</p>
      ) : sites.length === 0 ? (
        <p className="text-muted-foreground">Nessun sito.</p>
      ) : (
        <div className="space-y-3">
          {sites.map((s) => {
            const name = s.business_data?.name || s.subdomain;
            return (
              <div key={s.id} className="rounded-2xl border border-border bg-surface-elevated p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[220px]">
                    <p className={`text-[10px] font-display tracking-[0.3em] uppercase mb-1 ${s.status === "live" ? "text-emerald-500" : "text-amber"}`}>
                      {STATUS_LABEL[s.status] || s.status} {s.plan ? `· ${s.plan}` : ""} {s.has_full_assistance ? "· Assistenza" : ""}
                    </p>
                    <h3 className="font-display font-semibold text-lg">{name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.custom_domain || `${s.subdomain}.deskinc.app`} · {s.lead_email}
                      {!s.user_id && <span className="ml-2 text-amber">[non reclamato]</span>}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a href={`/s/${s.subdomain}?preview=1`} target="_blank" rel="noreferrer">
                        <Eye className="size-4" /> Anteprima
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => togglePublish(s)}>
                      <Rocket className="size-4" /> {s.status === "live" ? "Depubblica" : "Pubblica"}
                    </Button>
                    {!s.user_id && (
                      <Button variant="outline" size="sm" onClick={() => handleAssign(s.id)}>
                        <UserPlus className="size-4" /> Assegna
                      </Button>
                    )}
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/admin/sites/$siteId" params={{ siteId: s.id }}>
                        Gestisci <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
