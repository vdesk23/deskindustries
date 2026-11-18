import { Star } from "lucide-react";
import { DESK_GOOGLE_PLACE } from "@/lib/google-reviews-data";

export function GoogleBadge() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <div className="flex" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-amber text-amber" />)}
      </div>
      <span className="font-display font-medium">{DESK_GOOGLE_PLACE.rating.toFixed(1)}</span>
      <span className="text-muted-foreground">su Google · {DESK_GOOGLE_PLACE.total} recensioni</span>
    </div>
  );
}
