import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adminListSites, adminAssignSite, adminDeleteSite } from "@/lib/follia-admin.functions";
import { Button } from "@/components/ui/button";
import { Trash2, UserPlus, ArrowRight, ExternalLink } from "lucide-react";

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
  request_status: string;
  plan: string | null;
  has_full_assistance: boolean;
  published_url: string | null;
  user_id: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  new: "Nuova richiesta",
  in_progress: "In lavorazione",
  awaiting_payment: "Attesa pagamento",
  live: "Online",
  archived: "Archiviata",
};

function AdminSitesList() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const list = useServerFn(adminListSites);
  const assign = useServerFn(adminAssignSite);
  const del = useServerFn(adminDeleteSite);
  const [sites, setSites] = useState<Site[]>([]);
  const [search, setSearch] = useState("");
  const [claimed, setClaimed] = useState<"all" | "yes" | "no">("all");
  const [requestStatus, setRequestStatus] = useState<"" | "new" | "in_progress" | "awaiting_payment" | "live" | "archived">("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    list({ data: { search: search || undefined, claimed, ...(requestStatus ? { requestStatus } : {}) } })
      .then((r) => setSites(r.sites as Site[]))
      .finally(() => setLoading(false));
  }, [list, search, claimed, requestStatus]);

  useEffect(() => { load(); }, [load]);

  const handleAssign = async (id: string) => {
    const email = prompt("Email account a cui assegnare la richiesta:");
    if (!email) return;
    try { await assign({ data: { siteId: id, email } }); load(); }
    catch (e) { alert((e as Error).message); }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare definitivamente questa richiesta e tutti i dati collegati?")) return;
    try { await del({ data: { siteId: id } }); load(); }
    catch (e) { alert((e as Error).message); }
  };

  if (pathname !== "/admin/sites") return <Outlet />;

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per subdomain, email, dominio…"
          className="flex-1 min-w-[200px] rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <select value={requestStatus} onChange={(e) => setRequestStatus(e.target.value as typeof requestStatus)} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
          <option value="">Tutti gli stati</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
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
        <p className="text-muted-foreground">Nessuna richiesta.</p>
      ) : (
        <div className="space-y-3">
          {sites.map((s) => {
            const name = s.business_data?.name || s.subdomain;
            const rs = s.request_status || "new";
            return (
              <div key={s.id} className="rounded-2xl border border-border bg-surface-elevated p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[220px]">
                    <p className={`text-[10px] font-display tracking-[0.3em] uppercase mb-1 ${rs === "live" ? "text-emerald-500" : rs === "awaiting_payment" ? "text-amber" : "text-muted-foreground"}`}>
                      {STATUS_LABEL[rs] || rs} {s.plan ? `· ${s.plan}` : ""} {s.has_full_assistance ? "· Assistenza" : ""}
                    </p>
                    <h3 className="font-display font-semibold text-lg">{name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.subdomain}.deskinc.app · {s.lead_email}
                      {!s.user_id && <span className="ml-2 text-amber">[non reclamato]</span>}
                    </p>
                    {s.published_url && (
                      <a href={s.published_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-1 text-xs text-amber underline">
                        {s.published_url} <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!s.user_id && (
                      <Button variant="outline" size="sm" onClick={() => handleAssign(s.id)}>
                        <UserPlus className="size-4" /> Assegna
                      </Button>
                    )}
                    <Button asChild variant="amber" size="sm">
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
