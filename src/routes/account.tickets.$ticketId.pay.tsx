import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/account/tickets/$ticketId/pay")({
  head: () => ({
    meta: [
      { title: "Pagamento ticket — Desk Industries" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PayTicketPage,
});

function PayTicketPage() {
  const { ticketId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { redirect: `/account/tickets/${ticketId}/pay`, mode: "login" }, replace: true });
    }
  }, [user, loading, navigate, ticketId]);

  if (loading || !user) {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Caricamento...</div>;
  }

  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto max-w-2xl px-5 lg:px-8">
        <Link to="/account/sites" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4" /> Torna ai siti
        </Link>
        <h1 className="text-3xl lg:text-4xl font-display font-medium tracking-tight mb-2">
          Completa il pagamento del ticket
        </h1>
        <p className="text-muted-foreground mb-8">
          €50 + IVA. Il ticket verrà preso in carico dal team appena ricevuto il pagamento.
        </p>

        <div className="rounded-3xl border border-border bg-surface-elevated p-6">
          <StripeEmbeddedCheckout
            priceId="follia_ticket_50"
            customerEmail={user.email || undefined}
            userId={user.id}
            metadata={{ folliaTicketId: ticketId }}
            returnUrl={`${window.location.origin}/account/sites?ticket=paid`}
          />
        </div>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate({ to: "/account/sites" })}>
            Annulla e paga più tardi
          </Button>
        </div>
      </div>
    </section>
  );
}
