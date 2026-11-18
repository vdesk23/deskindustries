import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Card3D } from "@/components/ui/Card3D";
import { LANDING_LINES } from "@/lib/landing-lines";

export const Route = createFileRoute("/servizi/")({
  head: () => ({
    meta: [
      { title: "Servizi per negozi fisici — Desk Industries" },
      { name: "description", content: "Prodotti digitali, kit per andare online, crescita e-commerce, creatività AI, omnicanalità e branding per negozi fisici e franchising." },
      { property: "og:title", content: "Servizi per negozi fisici — Desk Industries" },
      { property: "og:description", content: "Le linee di servizio Desk Industries per portare il tuo negozio online e farlo crescere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.deskindustries.com/servizi" }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="text-xs font-display uppercase tracking-[0.25em] text-amber mb-4">Servizi</p>
        <h1 className="font-display text-4xl sm:text-6xl font-medium tracking-tight max-w-3xl">Una soluzione per ogni <span className="italic text-amber font-normal">fase</span> del tuo negozio.</h1>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_LINES.map((l) => {
            const body = (
              <Card3D intensity={5} className={`h-full rounded-2xl border border-border bg-surface-elevated/50 backdrop-blur-xl p-6 ${l.path ? "" : "opacity-60"}`}>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{l.path ? l.tier : "In arrivo"}</p>
                <h2 className="mt-3 font-display text-2xl font-medium tracking-tight">{l.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{l.tagline}</p>
                {l.path && <p className="mt-6 text-sm text-amber inline-flex items-center gap-1">Scopri <ArrowRight className="size-4" /></p>}
              </Card3D>
            );
            return l.path ? <Link key={l.id} to={l.path}>{body}</Link> : <div key={l.id}>{body}</div>;
          })}
        </div>
        <p className="mt-14 text-muted-foreground">Non sai da dove partire? <Link to="/contatti" className="text-amber hover:underline">Scrivici</Link>.</p>
      </div>
    </section>
  );
}
