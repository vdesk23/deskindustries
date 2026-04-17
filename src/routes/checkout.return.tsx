import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: (search.session_id as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Pagamento completato — Desk Industries" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutReturnPage,
});

function CheckoutReturnPage() {
  const { session_id } = useSearch({ from: "/checkout/return" });

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-5 py-24">
      <div className="max-w-2xl text-center">
        <div className="inline-flex items-center justify-center size-20 rounded-full bg-amber/15 mb-8">
          <CheckCircle2 className="size-10 text-amber" />
        </div>
        <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
          Conferma ricevuta
        </p>
        <h1 className="text-4xl lg:text-6xl font-display font-medium leading-[0.95] tracking-tight text-balance">
          Benvenuto nella famiglia.{" "}
          <span className="italic text-amber font-normal">Iniziamo.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Abbiamo ricevuto il tuo pagamento. Ti contatteremo entro 24 ore
          lavorative per attivare il tuo piano e pianificare il primo step.
        </p>
        {session_id && (
          <p className="mt-4 text-xs text-muted-foreground/60 font-mono">
            ID transazione: {session_id}
          </p>
        )}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link to="/">
            <Button variant="hero" size="lg">
              Torna alla home <ArrowRight />
            </Button>
          </Link>
          <Link to="/contatti">
            <Button variant="outline" size="lg">
              Scrivici subito
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
