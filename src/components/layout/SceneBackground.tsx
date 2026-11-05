import { WebGLBoundary, hasWebGL } from "@/components/three/WebGLBoundary";
import { lazy, Suspense, useEffect, useState } from "react";

const AgentsScene = lazy(() =>
  import("@/components/hero/AgentsScene").then((m) => ({ default: m.AgentsScene })),
);

/**
 * Full-viewport 3D scene kept behind all content.
 * Performance: loaded only after the page is idle, and skipped entirely on
 * small screens, low-power devices and reduced-motion (static gradient instead).
 */
export function SceneBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const small = window.matchMedia("(max-width: 767px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;
    if (small || reduced || lowPower || !hasWebGL()) return;

    let idleId: number | undefined;
    const timer = window.setTimeout(() => {
      const ric = (window as any).requestIdleCallback as
        | ((cb: () => void, o?: { timeout: number }) => number)
        | undefined;
      if (ric) idleId = ric(() => setMounted(true), { timeout: 3000 });
      else setMounted(true);
    }, 2500);
    return () => {
      window.clearTimeout(timer);
      const cic = (window as any).cancelIdleCallback as ((id: number) => void) | undefined;
      if (idleId !== undefined && cic) cic(idleId);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,var(--amber-soft,transparent)_0%,transparent_60%)] opacity-60" />
      {mounted && (
        <WebGLBoundary>
        <Suspense fallback={null}>
          <div className="absolute inset-0 blur-[4px] opacity-90 animate-in fade-in duration-1000">
            <AgentsScene />
          </div>
        </Suspense>
        </WebGLBoundary>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background/85" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,var(--background)_85%)] opacity-70" />
    </div>
  );
}
