import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, ExternalLink, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { checkIsAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Area clienti — Desk Industries" },
      { name: "description", content: "Accedi ai tuoi progetti con Desk Industries." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const checkAdmin = useServerFn(checkIsAdmin);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/account", mode: "login" }, replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    checkAdmin().then((r) => setIsAdmin(r.isAdmin)).catch(() => setIsAdmin(false));
  }, [user, checkAdmin]);

  if (!user) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-2xl px-5 space-y-6">
        <p className="text-xs font-display tracking-[0.3em] text-amber uppercase">Area clienti</p>
        <h1 className="font-display text-3xl font-semibold">Ciao, {user.email}</h1>
        <p className="text-muted-foreground">I tuoi progetti con Desk Industries si gestiscono dalla piattaforma Desk.</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="amber">
            <a href="https://project.deskinc.app">Apri i tuoi progetti <ExternalLink className="size-4" /></a>
          </Button>
          {isAdmin && (
            <Button asChild variant="outline"><Link to="/admin">Pannello admin <ArrowRight className="size-4" /></Link></Button>
          )}
          <Button variant="ghost" onClick={() => signOut()}><LogOut className="size-4" /> Esci</Button>
        </div>
      </div>
    </section>
  );
}
