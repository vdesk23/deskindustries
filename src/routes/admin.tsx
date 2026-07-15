import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import { checkIsAdmin } from "@/lib/follia-admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Foll.IA" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const check = useServerFn(checkIsAdmin);
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/admin", mode: "login" }, replace: true });
      return;
    }
    check()
      .then((r) => setState(r.isAdmin ? "ok" : "denied"))
      .catch(() => setState("denied"));
  }, [user, authLoading, navigate, check]);

  if (authLoading || state === "checking") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Verifica permessi…</p>
      </div>
    );
  }
  if (state === "denied") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <h1 className="text-2xl font-display">Accesso negato</h1>
        <p className="text-muted-foreground">Serve il ruolo admin.</p>
        <Link to="/account" className="text-amber underline">Torna all'area clienti</Link>
      </div>
    );
  }

  return (
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-2">Pannello admin</p>
          <nav className="flex gap-4 text-sm border-b border-border pb-3">
            <Link to="/admin" activeOptions={{ exact: true }} className="hover:text-amber [&.active]:text-amber [&.active]:font-semibold">Dashboard</Link>
            <Link to="/admin/sites" className="hover:text-amber [&.active]:text-amber [&.active]:font-semibold">Siti Foll.IA</Link>
            <Link to="/admin/tickets" className="hover:text-amber [&.active]:text-amber [&.active]:font-semibold">Ticket</Link>
            <Link to="/admin/blog" className="hover:text-amber [&.active]:text-amber [&.active]:font-semibold">Blog</Link>
          </nav>
        </div>
        <Outlet />
      </div>
    </section>
  );
}
