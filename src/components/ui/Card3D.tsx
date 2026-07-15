import { forwardRef, useRef, type HTMLAttributes, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface Card3DProps extends HTMLAttributes<HTMLDivElement> {
  /** Max tilt in degrees. Default 8. */
  intensity?: number;
  /** Spotlight color (CSS color / var). Default amber. */
  glowColor?: string;
  as?: "div" | "button";
}

/**
 * Interactive card with mouse-tracked 3D tilt + light spotlight.
 * Reads `prefers-reduced-motion` to disable transforms.
 */
export const Card3D = forwardRef<HTMLDivElement, Card3DProps>(function Card3D(
  { className, children, intensity = 8, glowColor = "var(--amber)", style, onMouseMove, onMouseLeave, ...rest },
  ref,
) {
  const innerRef = useRef<HTMLDivElement | null>(null);

  const setRefs = (el: HTMLDivElement | null) => {
    innerRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    onMouseMove?.(e);
    const el = innerRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * intensity;
    const ry = (px - 0.5) * intensity;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--active", "1");
  };

  const handleLeave = (e: MouseEvent<HTMLDivElement>) => {
    onMouseLeave?.(e);
    const el = innerRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--active", "0");
  };

  return (
    <div
      ref={setRefs}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={
        {
          transform:
            "perspective(1000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateZ(0)",
          transition: "transform 500ms cubic-bezier(0.22,1,0.36,1)",
          transformStyle: "preserve-3d",
          ["--glow" as string]: glowColor,
          ...style,
        } as React.CSSProperties
      }
      className={cn("card-3d relative isolate will-change-transform", className)}
      {...rest}
    >
      {children}
      {/* Spotlight layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
        style={{
          opacity: "calc(var(--active,0) * 0.9)",
          background:
            "radial-gradient(400px circle at var(--mx,50%) var(--my,50%), color-mix(in oklab, var(--glow) 35%, transparent), transparent 60%)",
          mixBlendMode: "screen",
        }}
      />
      {/* Reactive border shine */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          padding: "1px",
          background:
            "radial-gradient(300px circle at var(--mx,50%) var(--my,50%), color-mix(in oklab, var(--glow) 60%, transparent), transparent 70%)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          opacity: "calc(var(--active,0) * 1)",
          transition: "opacity 300ms",
        }}
      />
    </div>
  );
});
