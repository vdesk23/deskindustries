import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ExternalLink } from "lucide-react";

interface Review {
  author: string;
  authorUrl?: string;
  avatar?: string;
  rating: number;
  relativeTime: string;
  text: string;
  time: number;
}

interface PlaceMeta {
  name?: string;
  rating?: number;
  total?: number;
  url?: string;
}

interface ApiResponse {
  ok: boolean;
  place?: PlaceMeta;
  reviews?: Review[];
  error?: string;
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} stelle su 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i < Math.round(value) ? "fill-amber text-amber" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export function GoogleReviews() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/google-reviews")
      .then((r) => r.json())
      .then((json: ApiResponse) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData({ ok: false, error: "fetch_failed" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Hide section completely until config is ready / has reviews
  if (!data || !data.ok || !data.reviews || data.reviews.length === 0) {
    return null;
  }

  const reviews = data.reviews;
  const place = data.place ?? {};
  // Duplicate the list so the marquee loops seamlessly
  const loop = [...reviews, ...reviews];

  return (
    <section className="relative py-24 lg:py-32 border-t border-border bg-surface overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-end mb-14">
          <div className="lg:col-span-7">
            <p className="text-xs font-display tracking-[0.3em] text-amber uppercase mb-4">
              Recensioni Google
            </p>
            <h2 className="text-4xl lg:text-5xl font-display font-medium tracking-tight text-balance">
              Le voci di chi ci ha già{" "}
              <span className="italic text-amber font-normal">scelto</span>.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4">
              {typeof place.rating === "number" && (
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-display font-medium leading-none">
                    {place.rating.toFixed(1)}
                  </span>
                  <Stars value={place.rating} />
                </div>
              )}
              {typeof place.total === "number" && (
                <p className="text-sm text-muted-foreground">
                  {place.total} recensioni verificate su Google
                </p>
              )}
            </div>
            {place.url && (
              <a
                href={place.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-amber hover:underline"
              >
                Vedi tutte su Google <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div
        className="relative"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div
          ref={trackRef}
          className="flex gap-6 animate-[reviews-marquee_60s_linear_infinite] hover:[animation-play-state:paused] w-max px-5 lg:px-8"
        >
          {loop.map((r, i) => (
            <motion.article
              key={`${r.time}-${i}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative w-[340px] sm:w-[380px] shrink-0 p-7 rounded-3xl border border-border bg-background hover:border-amber/50 transition-colors"
            >
              <Quote className="absolute top-5 right-5 size-8 text-amber/15" />
              <div className="flex items-center gap-3">
                {r.avatar ? (
                  <img
                    src={r.avatar}
                    alt={r.author}
                    className="size-10 rounded-full object-cover border border-border"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="size-10 rounded-full bg-amber-soft flex items-center justify-center text-amber font-display font-semibold">
                    {r.author.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-display font-semibold text-sm leading-tight">
                    {r.author}
                  </p>
                  <p className="text-xs text-muted-foreground">{r.relativeTime}</p>
                </div>
              </div>
              <div className="mt-4">
                <Stars value={r.rating} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-6">
                {r.text}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
