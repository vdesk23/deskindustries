import { createFileRoute, Link } from "@tanstack/react-router";
import { Scissors, Pizza, Dumbbell, Brush, Flower2, ArrowRight } from "lucide-react";

const SECTORS = [
  { slug: "barbieri", label: "Barbieri", Icon: Scissors, desc: "Riempi la sedia tutti i giorni." },
  { slug: "tatuatori", label: "Tatuatori", Icon: Brush, desc: "Mostra la tua arte, prenota la tua agenda." },
  { slug: "pizzerie", label: "Pizzerie", Icon: Pizza, desc: "Più clienti in sala e a domicilio." },
  { slug: "centri-estetici", label: "Centri estetici", Icon: Flower2, desc: "Costruisci una clientela fidelizzata." },
  { slug: "palestre", label: "Palestre", Icon: Dumbbell, desc: "Acquisisci nuovi iscritti ogni mese." },
] as const;

export const Route = createFileRoute("/settori/")({
  head: () => ({
    meta: [
      { title: "Settori — Desk Industries" },
      {
        name: "description",
        content:
          "Strategie marketing pensate per barbieri, tatuatori, pizzerie, centri estetici e palestre.",
      },
    ],
  }),
  component: SectorsIndex,
});

function SectorsIndex() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
            Settori
          </p>
          <h1 className="text-5xl lg:text-7xl font-display font-medium tracking-tight text-balance">
            Una strategia per <span className="italic text-amber font-normal">ogni mestiere</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Ogni categoria ha le sue regole. Noi le conosciamo.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTORS.map(({ slug, label, Icon, desc }) => (
            <Link
              key={slug}
              to="/settori/$slug"
              params={{ slug }}
              className="group p-8 rounded-2xl border border-border hover:border-amber bg-surface-elevated hover:bg-surface transition-all"
            >
              <div className="size-14 rounded-xl bg-amber-soft flex items-center justify-center mb-6 group-hover:bg-amber transition-colors">
                <Icon className="size-6 text-amber group-hover:text-amber-foreground transition-colors" />
              </div>
              <h2 className="text-2xl font-display font-semibold mb-2">{label}</h2>
              <p className="text-sm text-muted-foreground">{desc}</p>
              <div className="mt-6 flex items-center gap-1.5 text-sm text-amber">
                Vedi soluzioni <ArrowRight className="size-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
