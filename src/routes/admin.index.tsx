import { createFileRoute } from "@tanstack/react-router";
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

  const items = [
    { label: "Siti totali", value: stats?.total },
    { label: "Online", value: stats?.live },
    { label: "In revisione", value: stats?.review },
    { label: "Bozze", value: stats?.draft },
    { label: "Non reclamati", value: stats?.unclaimed },
    { label: "Ticket aperti", value: stats?.openTickets },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((it) => (
        <div key={it.label} className="rounded-2xl border border-border bg-surface-elevated p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{it.label}</p>
          <p className="mt-2 text-4xl font-display font-semibold">{it.value ?? "—"}</p>
        </div>
      ))}
    </div>
  );
}
