import { motion } from "framer-motion";
import { Star, Quote, ExternalLink } from "lucide-react";
import {
  DESK_GOOGLE_REVIEWS,
  DESK_GOOGLE_PLACE,
  type StaticGoogleReview,
} from "@/lib/google-reviews-data";

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

// Logo Google ufficiale (4 colori) — uso editoriale legittimo accanto a recensioni Google reali.
function GoogleLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 272 92"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Google"
      className={className}
    >
      <path
        fill="#EA4335"
        d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
      />
      <path
        fill="#FBBC05"
        d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
      />
      <path
        fill="#4285F4"
        d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"
      />
      <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z" />
      <path
        fill="#EA4335"
        d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"
      />
      <path
        fill="#4285F4"
        d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"
      />
    </svg>
  );
}

// Genera un colore deterministico (oklch) dal nome
function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `oklch(0.65 0.15 ${hue})`;
}

function ReviewCard({ review, index }: { review: StaticGoogleReview; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.03 }}
      className="relative w-[340px] sm:w-[380px] shrink-0 p-7 rounded-3xl border border-border bg-background hover:border-amber/50 transition-colors"
    >
      <Quote className="absolute top-5 right-5 size-8 text-amber/15" />
      <div className="flex items-center gap-3">
        <div
          className="size-10 rounded-full flex items-center justify-center text-white font-display font-semibold shrink-0"
          style={{ backgroundColor: avatarColor(review.author) }}
          aria-hidden
        >
          {review.author.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-display font-semibold text-sm leading-tight truncate">
            {review.author}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span>su Google</span>
            <span>·</span>
            <span>{review.relativeTime}</span>
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Stars value={review.rating} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{review.text}</p>
    </motion.article>
  );
}

export function GoogleReviews() {
  const reviews = DESK_GOOGLE_REVIEWS;
  const place = DESK_GOOGLE_PLACE;
  const loop = [...reviews, ...reviews];

  return (
    <section className="relative py-24 lg:py-32 border-y border-border overflow-hidden">
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
            <div className="flex items-center gap-4 flex-wrap">
              <GoogleLogo className="h-7 w-auto" />
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display font-medium leading-none">
                  {place.rating.toFixed(1)}
                </span>
                <Stars value={place.rating} />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {place.total} recensioni verificate su Google
            </p>
            <a
              href={place.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-amber hover:underline"
            >
              Vedi tutte su Google <ExternalLink className="size-3.5" />
            </a>
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
        <div className="flex gap-6 animate-[reviews-marquee_80s_linear_infinite] hover:[animation-play-state:paused] w-max px-5 lg:px-8">
          {loop.map((r, i) => (
            <ReviewCard key={`${r.author}-${i}`} review={r} index={i % reviews.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
