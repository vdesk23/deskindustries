import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXPERTISE_AREAS } from "@/lib/expertise-data";
import { DURATION_SM, EASE } from "@/lib/motion";

const ExpertiseOrbitScene = lazy(() => import("@/components/three/ExpertiseOrbitScene"));

export function ExpertiseExplorer() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const n = EXPERTISE_AREAS.length;
  const go = (d: number) => setActive((a) => (a + d + n) % n);
  const area = EXPERTISE_AREAS[active];

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    try {
      const c = document.createElement("canvas");
      setWebgl(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch { setWebgl(false); }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="grid lg:grid-cols-[1.3fr_1fr] gap-8 items-center"
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }}
    >
      <div className="relative h-[340px] sm:h-[440px] lg:h-[520px] rounded-3xl border border-border bg-surface-elevated/30 backdrop-blur-sm overflow-hidden">
        {visible && webgl && !reduced ? (
          <Suspense fallback={null}>
            <ExpertiseOrbitScene active={active} onSelect={setActive} reduced={reduced} />
          </Suspense>
        ) : (
          <div className="absolute inset-0 grid place-items-center p-6">
            <p className="font-display text-3xl text-amber text-center">{area.title}</p>
          </div>
        )}
        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3">
          <Button size="icon" variant="outline" aria-label="Area precedente" onClick={() => go(-1)} className="rounded-full bg-background/60 backdrop-blur">
            <ArrowLeft className="size-4" />
          </Button>
          <Button size="icon" variant="outline" aria-label="Area successiva" onClick={() => go(1)} className="rounded-full bg-background/60 backdrop-blur">
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface-elevated/60 backdrop-blur-xl p-7 lg:p-9 min-h-[360px]" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={area.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-3">
              {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </p>
            <h3 className="font-display text-3xl font-semibold mb-3">{area.title}</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">{area.tagline}</p>
            <ul className="space-y-2.5 mb-8">
              {area.services.map((s) => (
                <li key={s} className="flex gap-3 text-sm">
                  <Check className="size-4 text-amber shrink-0 mt-0.5" /> {s}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="rounded-full">
              <a href="#lead">Parlane con noi <ArrowRight className="size-4" /></a>
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="lg:col-span-2 flex flex-wrap gap-2 justify-center" role="tablist" aria-label="Aree di competenza">
        {EXPERTISE_AREAS.map((a, i) => (
          <button
            key={a.id}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            style={{ transitionDuration: `${DURATION_SM}s` }}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${i === active ? "bg-amber text-amber-foreground border-amber" : "border-border bg-surface-elevated/50 text-muted-foreground hover:text-foreground hover:border-amber/60"}`}
          >
            {a.title}
          </button>
        ))}
      </div>
    </div>
  );
}
