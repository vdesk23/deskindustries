import { lazy, Suspense, useEffect, useState } from "react";

const AgentsScene = lazy(() =>
  import("@/components/hero/AgentsScene").then((m) => ({ default: m.AgentsScene })),
);

/**
 * Full-viewport 3D scene mounted once and kept behind all content while scrolling.
 * Adds a slight blur + dark gradient overlay for readability.
 */
export function SceneBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
    >
      {mounted && (
        <Suspense fallback={null}>
          <div className="absolute inset-0 blur-[4px] opacity-90">
            <AgentsScene />
          </div>
        </Suspense>
      )}
      {/* Readability overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background/85" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,var(--background)_85%)] opacity-70" />
    </div>
  );
}
