import { Link } from "@tanstack/react-router";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ComingSoon({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="relative py-32 lg:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="relative mx-auto max-w-3xl px-5 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber-soft px-3 py-1.5 text-xs text-amber">
          <Construction className="size-3" /> In costruzione
        </div>
        <p className="mt-8 text-xs font-display tracking-[0.3em] text-amber uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-5xl lg:text-7xl font-display font-medium tracking-tight text-balance">
          {title}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{description}</p>
        <Link to="/" className="inline-block mt-10">
          <Button variant="outline" size="lg">
            <ArrowLeft /> Torna alla home
          </Button>
        </Link>
      </div>
    </section>
  );
}
