import { useEffect, useRef, type ReactNode } from "react";
import { Reveal } from "./Reveal";

/** Vertical "filo rosso" that fills as the visitor scrolls through the page. */
export function ThreadLine() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
      ref.current?.style.setProperty("--lp-progress", p.toFixed(4));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute left-3 lg:left-4 top-0 bottom-0 w-px hidden sm:block z-10">
      <div className="lp-thread-track absolute inset-0" />
      <div className="lp-thread-fill absolute inset-0" />
    </div>
  );
}

/** Node on the thread + numbered chapter label for a section. */
export function ThreadNode({ n, label }: { n: string; label: string }) {
  return (
    <Reveal className="relative mb-6 flex items-center gap-3">
      <span aria-hidden className="lp-node size-[9px] rounded-full" />
      <span className="font-display text-xs tracking-[0.25em] uppercase lp-thread-text">{n}</span>
      <span className="h-px w-10 lp-draw" />
      <span className="font-display text-xs uppercase tracking-[0.25em] text-amber">{label}</span>
    </Reveal>
  );
}

export function Aurora({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="lp-aurora size-[45vw] -left-[10vw] top-[10%]" style={{ background: "var(--aurora-1)" }} />
      <div className="lp-aurora size-[40vw] right-[-10vw] top-[40%]" style={{ background: "var(--aurora-2)", animationDelay: "-6s" }} />
      <div className="lp-aurora size-[35vw] left-[30%] bottom-[-10%]" style={{ background: "var(--aurora-3)", animationDelay: "-12s" }} />
    </div>
  );
}

export function WordsIn({ text, start = 0 }: { text: string; start?: number }) {
  return <>{text.split(" ").map((w, i) => <span key={i} className="lp-word" style={{ animationDelay: `${start + i * 70}ms` }}>{w}&nbsp;</span>)}</>;
}

export function PhilosophyMarquee({ items }: { items: string[] }) {
  const row: ReactNode[] = items.map((t) => (
    <span key={t} className="flex items-center gap-6 px-6 font-display text-2xl sm:text-4xl tracking-tight">
      <span className="italic font-normal">{t}</span><span aria-hidden className="size-2 rounded-full bg-amber shadow-amber" />
    </span>
  ));
  return (
    <div className="relative overflow-hidden border-y border-border py-6 bg-surface/40 backdrop-blur-xl" aria-label={items.join(", ")}>
      <div className="lp-marquee" aria-hidden>{row}{row}</div>
    </div>
  );
}
