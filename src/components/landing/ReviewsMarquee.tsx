import { Quote, Star } from "lucide-react";
import { DESK_GOOGLE_PLACE, DESK_GOOGLE_REVIEWS, type StaticGoogleReview } from "@/lib/google-reviews-data";

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return `oklch(0.65 0.15 ${Math.abs(hash) % 360})`;
}

function ReviewCard({ review }: { review: StaticGoogleReview }) {
  return (
    <article className="relative w-[320px] sm:w-[380px] shrink-0 rounded-3xl border border-border bg-surface-elevated/60 backdrop-blur-xl p-7">
      <Quote className="absolute top-5 right-5 size-8 text-amber/15" aria-hidden />
      <div className="flex items-center gap-3">
        <div
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full font-display font-semibold text-white"
          style={{ backgroundColor: avatarColor(review.author) }}
        >
          {review.author.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold leading-tight">{review.author}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>su Google</span><span>·</span><span>{review.relativeTime}</span>
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-0.5" aria-label={`${review.rating} stelle su 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`size-3.5 ${i < Math.round(review.rating) ? "fill-amber text-amber" : "text-muted-foreground/30"}`} />
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{review.text}</p>
    </article>
  );
}

/** Tutte le recensioni Google in scorrimento continuo, come in home. */
export function ReviewsMarquee() {
  const reviews = DESK_GOOGLE_REVIEWS;
  const loop = [...reviews, ...reviews];
  return (
    <div
      aria-label={`Recensioni Google: ${DESK_GOOGLE_PLACE.rating.toFixed(1)} su ${DESK_GOOGLE_PLACE.total}`}
      className="relative overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div className="lp-reviews gap-6 px-5 lg:px-8">
        {loop.map((r, i) => <ReviewCard key={`${r.author}-${i}`} review={r} />)}
      </div>
    </div>
  );
}
