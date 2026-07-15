import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Heart, Compass, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/chi-siamo")({
  head: () => ({
    meta: [
      { title: "Chi siamo — Desk Industries" },
      {
        name: "description",
        content:
          "Desk Industries SRLS è l'agenzia di marketing che dà voce online alle attività locali. Scopri il nostro metodo, i valori e la filosofia COCO.",
      },
      { property: "og:title", content: "Chi siamo — Desk Industries" },
      {
        property: "og:description",
        content: "L'agenzia che porta clienti reali nei negozi reali.",
      },
    ],
    links: [{ rel: "canonical", href: "https://deskindustries.lovable.app/chi-siamo" }],
  }),
  component: ChiSiamoPage,
});

const VALUES = [
  {
    Icon: Eye,
    title: "Trasparenza",
    desc: "Ti diciamo cosa funziona e cosa no, anche quando non vorresti sentirlo. Niente fuffa, niente metriche di vanità.",
  },
  {
    Icon: Heart,
    title: "Vicinanza",
    desc: "Lavoriamo con poche realtà ma in profondità. Conosciamo la tua attività come la nostra.",
  },
  {
    Icon: Compass,
    title: "Metodo",
    desc: "Il framework COCO è il nostro nord. Ogni decisione passa da lì: costruiamo, attiviamo, cementifichiamo.",
  },
  {
    Icon: Rocket,
    title: "Risultati reali",
    desc: "Non vendiamo follower. Vendiamo clienti che entrano, comprano e tornano. Punto.",
  },
];

function ChiSiamoPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grain pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
            Chi siamo
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-display font-medium leading-[0.95] tracking-tight text-balance max-w-5xl">
            Diamo voce a chi alza la{" "}
            <span className="italic text-amber font-normal">saracinesca</span>{" "}
            ogni mattina.
          </h1>
          <p className="mt-8 max-w-2xl text-lg lg:text-xl text-muted-foreground leading-relaxed">
            Desk Industries SRLS è l'agenzia di marketing nata per le attività locali.
            Trasformiamo la presenza online in clienti reali — quelli che varcano la porta.
          </p>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-6">
            Manifesto
          </p>
          <div className="space-y-8 text-2xl lg:text-3xl font-display leading-tight tracking-tight">
            <p>
              Crediamo che il marketing per le attività locali sia{" "}
              <span className="text-amber italic font-normal">profondamente diverso</span>{" "}
              da quello per le startup o gli e-commerce.
            </p>
            <p className="text-muted-foreground">
              Una saracinesca da alzare, dei dipendenti da pagare, dei clienti che ti
              guardano negli occhi. Non puoi permetterti la fuffa. Non puoi permetterti
              di "testare per tre mesi" senza risultati.
            </p>
            <p>
              Per questo abbiamo costruito{" "}
              <Link to="/metodo-coco" className="text-amber underline-offset-4 hover:underline">
                il metodo COCO
              </Link>
              : un sistema che parte dalle fondamenta e arriva fino al primo cliente
              che entra dalla porta.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
              I nostri valori
            </p>
            <h2 className="text-3xl lg:text-5xl font-display font-medium tracking-tight text-balance">
              Quattro principi.{" "}
              <span className="italic text-amber font-normal">Non negoziabili.</span>
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-7 rounded-2xl bg-background border border-border"
              >
                <div className="size-12 rounded-xl bg-amber-soft flex items-center justify-center mb-5">
                  <v.Icon className="size-5 text-amber" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 border-t border-border">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { num: "34.5M", label: "Visualizzazioni nel 2025" },
              { num: "820", label: "Contenuti prodotti" },
              { num: "35+", label: "Clienti attivi" },
              { num: "5★", label: "Reputazione media" },
            ].map((s) => (
              <div key={s.label} className="border-l-2 border-amber pl-5">
                <div className="text-4xl lg:text-5xl font-display font-medium text-foreground">
                  {s.num}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 lg:py-32 border-t border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-display font-medium tracking-tight text-balance">
            Vuoi conoscerci{" "}
            <span className="italic text-amber font-normal">davvero</span>?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Una call gratuita di 30 minuti vale più di mille presentazioni.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/contatti">
              <Button variant="hero" size="xl">
                Prenota una call <ArrowRight />
              </Button>
            </Link>
            <Link to="/metodo-coco">
              <Button variant="outline" size="xl">
                Scopri il metodo COCO
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
