import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANDING_LINES } from "@/lib/landing-lines";

export const Route = createFileRoute("/grazie")({
  validateSearch: (s: Record<string, unknown>) => ({
    store: typeof s.store === "string" ? s.store.slice(0, 40) : undefined,
    nome: typeof s.nome === "string" ? s.nome.slice(0, 60) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Grazie — Desk Industries" },
      { name: "description", content: "Abbiamo ricevuto la tua richiesta. Ti contatteremo a breve per la call gratuita." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Grazie — Desk Industries" },
      { property: "og:description", content: "Richiesta ricevuta: ti richiamiamo a breve." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  const { store, nome } = Route.useSearch();
  const line = LANDING_LINES.find((l) => l.id === store);
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-2xl px-5 text-center">
        <CheckCircle2 className="size-12 text-amber mx-auto" />
        <h1 className="mt-6 font-display text-4xl sm:text-5xl font-medium tracking-tight">
          Grazie{nome ? `, ${nome}` : ""}. <span className="italic text-amber font-normal">Ci sentiamo presto.</span>
        </h1>
        <p className="mt-6 text-muted-foreground">
          Abbiamo ricevuto la tua richiesta{line ? ` per ${line.name}` : ""}. Ti chiamiamo nella fascia che hai indicato per la call gratuita.
        </p>
        <Link to="/" className="inline-block mt-10"><Button variant="amber" className="rounded-full">Torna al sito</Button></Link>
      </div>
    </section>
  );
}
