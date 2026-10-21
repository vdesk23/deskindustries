import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXPERTISE_AREAS } from "@/lib/expertise-data";
import { DURATION_SM, EASE } from "@/lib/motion";

const ExpertiseStageScene = lazy(() => import("@/components/three/ExpertiseStageScene"));

export function ExpertiseExplorer() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const n = EXPERTISE_AREAS.length;
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
    <div ref={ref} className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6">
      {/* Selector */}
      <div
        role="tablist"
        aria-label="Aree di competenza"
        aria-orientation="vertical"
        className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible -mx-5 px-5 lg:mx-0 lg:px-0 pb-2 lg:pb-0 snap-x"
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); setActive((a) => (a + 1) % n); }
          if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); setActive((a) => (a - 1 + n) % n); }
        }}
      >
        {EXPERTISE_AREAS.map((a, i) => {
          const on = i === active;
          return (
            <button
              key={a.id}
              role="tab"
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              style={{ transitionDuration: `${DURATION_SM}s` }}
              className={`group snap-start shrink-0 lg:shrink flex items-center gap-4 text-left rounded-2xl border px-4 py-3 lg:px-5 lg:py-4 transition-all backdrop-blur-xl ${on ? "border-amber bg-amber-soft shadow-amber" : "border-border bg-surface-elevated/50 hover:border-amber/50"}`}
            >
              <span className={`font-display text-sm tabular-nums ${on ? "text-amber" : "text-muted-foreground"}`}>{String(i + 1).padStart(2, "0")}</span>
              <span className={`font-display font-medium tracking-tight whitespace-nowrap lg:flex-1 ${on ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>{a.title}</span>
              <span className={`hidden sm:inline text-[10px] uppercase tracking-[0.2em] rounded-full border px-2.5 py-1 ${on ? "border-amber/60 text-amber" : "border-border text-muted-foreground"}`}>{a.badge}</span>
            </button>
          );
        })}
      </div>

      {/* Stage + dashboard */}
      <div className="rounded-3xl border border-border bg-surface-elevated/50 backdrop-blur-xl overflow-hidden shadow-elevated">
        <div className="relative h-[260px] sm:h-[320px] border-b border-border">
          {visible && webgl ? (
            <Suspense fallback={null}>
              <ExpertiseStageScene active={active} reduced={reduced} />
            </Suspense>
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <p className="font-display text-3xl text-amber">{area.title}</p>
            </div>
          )}
          <div className="absolute top-4 left-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-amber animate-pulse" /> Reparto {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </div>
        </div>

        <div className="p-6 lg:p-8 min-h-[300px]" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div key={area.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45, ease: EASE }}>
              <h3 className="font-display text-2xl lg:text-3xl font-semibold tracking-tight mb-2">{area.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">{area.tagline}</p>
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <ul className="space-y-2.5">
                  {area.services.map((s) => (
                    <li key={s} className="flex gap-3 text-sm"><Check className="size-4 text-amber shrink-0 mt-0.5" /> {s}</li>
                  ))}
                </ul>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Strumenti</p>
                    <div className="flex flex-wrap gap-1.5">
                      {area.stack.map((s) => (
                        <span key={s} className="text-xs rounded-full border border-border bg-background/40 px-3 py-1">{s}</span>
                      ))}
                    </div>
                  </div>
                  <p className="flex items-center gap-2 text-sm"><Clock className="size-4 text-amber" /> {area.delivery}</p>
                </div>
              </div>
              <Button asChild className="rounded-full">
                <a href="#lead">Parlane con noi <ArrowRight className="size-4" /></a>
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
