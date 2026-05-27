import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import { listMyFolliaSites } from "@/lib/follia-account.functions";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Plus } from "lucide-react";

export const Route = createFileRoute("/account/sites")({
  head: () => ({
    meta: [
      { title: "I miei siti Foll.IA — Desk Industries" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SitesListPage,
});

type Site = {
  id: string;
  subdomain: string;
  custom_domain: string | null;
  business_type: string;
  business_data: Record<string, unknown>;
  status: string;
  plan: string | null;
  has_full_assistance: boolean;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Bozza",
  awaiting_payment: "In attesa di pagamento",
  in_review: "In revisione",
  live: "Online",
  suspended: "Sospeso",
};

function SitesListPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fetchSites = useServerFn(listMyFolliaSites);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", search: { redirect: "/account/sites", mode: "login" }, replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchSites()
      .then((r) => setSites(r.sites as Site[]))
      .finally(() => setLoading(false));
  }, [user, fetchSites]);

  if (authLoading || !user) {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Caricamento...</div>;
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
          <div>
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-3">Foll.IA · I tuoi siti</p>
            <h1 className="text-4xl lg:text-5xl font-display font-medium tracking-tight">Siti vetrina</h1>
          </div>
          <Link to="/follia">
            <Button variant="amber"><Plus className="size-4" /> Crea nuovo sito</Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Caricamento...</p>
        ) : sites.length === 0 ? (
          <div className="rounded-3xl border border-border bg-surface-elevated p-10 text-center">
            <Globe className="mx-auto mb-4 size-10 text-amber" />
            <h2 className="text-xl font-display font-semibold mb-2">Nessun sito ancora</h2>
            <p className="text-muted-foreground mb-6">Genera in 60 secondi il tuo primo sito vetrina con Foll.IA.</p>
            <Link to="/follia">
              <Button variant="amber">Inizia <ArrowRight className="size-4" /></Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {sites.map((s) => {
              const name = (s.business_data as { name?: string })?.name || s.subdomain;
              return (
                <Link
                  key={s.id}
                  to="/account/sites/$siteId"
                  params={{ siteId: s.id }}
                  className="group block rounded-2xl border border-border bg-surface-elevated p-6 hover:border-amber/60 transition"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-[10px] font-display tracking-[0.3em] text-amber uppercase mb-2">
                        {STATUS_LABEL[s.status] || s.status}
                      </p>
                      <h3 className="text-xl font-display font-semibold">{name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {s.custom_domain || `${s.subdomain}.deskinc.app`}
                      </p>
                    </div>
                    <ArrowRight className="size-5 text-muted-foreground group-hover:text-amber group-hover:translate-x-0.5 transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
