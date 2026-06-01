import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adminStats } from "@/lib/follia-admin.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const getStats = useServerFn(adminStats);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof adminStats>> | null>(null);

  useEffect(() => {
    getStats().then(setStats).catch(() => setStats(null));
  }, [getStats]);

  const items: Array<{ label: string; value: number | undefined; to?: string; search?: Record<string, string>; accent?: string }> = [
    { label: "Nuove richieste", value: stats?.newReq, to: "/admin/sites", accent: "text-amber" },
    { label: "In lavorazione", value: stats?.inProgress, to: "/admin/sites" },
    { label: "Attesa pagamento", value: stats?.awaitingPayment, to: "/admin/sites", accent: "text-amber" },
    { label: "Online", value: stats?.live, to: "/admin/sites", accent: "text-emerald-500" },
    { label: "Totale richieste", value: stats?.total, to: "/admin/sites" },
    { label: "Ticket aperti", value: stats?.openTickets, to: "/admin/tickets", accent: "text-amber" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((it) => {
        const inner = (
          <>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{it.label}</p>
            <p className={`mt-2 text-4xl font-display font-semibold ${it.accent || ""}`}>{it.value ?? "—"}</p>
          </>
        );
        return it.to ? (
          <Link key={it.label} to={it.to} className="rounded-2xl border border-border bg-surface-elevated p-6 hover:border-amber/50 transition-colors">
            {inner}
          </Link>
        ) : (
          <div key={it.label} className="rounded-2xl border border-border bg-surface-elevated p-6">{inner}</div>
        );
      })}
    </div>
  );
}
