import { useEffect, useRef, type ReactNode } from "react";

let io: IntersectionObserver | null = null;
function observer() {
  if (!io && typeof IntersectionObserver !== "undefined") {
    io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-visible"); io?.unobserve(e.target); }
    }, { rootMargin: "0px 0px -10% 0px" });
  }
  return io;
}

/** CSS-only reveal driven by one shared IntersectionObserver. */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = ref.current; const o = observer(); if (el && o) o.observe(el); else el?.classList.add("is-visible"); }, []);
  return <div ref={ref} className={`lp-reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}
