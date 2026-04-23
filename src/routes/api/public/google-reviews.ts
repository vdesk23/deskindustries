import { createFileRoute } from "@tanstack/react-router";

interface GoogleReview {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface PlaceDetailsResponse {
  result?: {
    name?: string;
    rating?: number;
    user_ratings_total?: number;
    reviews?: GoogleReview[];
    url?: string;
  };
  status: string;
  error_message?: string;
}

// Simple in-memory cache to avoid hammering the Places API
let cache: { ts: number; payload: unknown } | null = null;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

export const Route = createFileRoute("/api/public/google-reviews")({
  server: {
    handlers: {
      GET: async () => {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        const placeId = process.env.GOOGLE_PLACES_PLACE_ID;

        if (!apiKey || !placeId) {
          return Response.json(
            {
              ok: false,
              error: "Google Places non configurato",
            },
            { status: 200 },
          );
        }

        if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
          return Response.json(cache.payload, {
            status: 200,
            headers: { "Cache-Control": "public, max-age=3600" },
          });
        }

        try {
          const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
          url.searchParams.set("place_id", placeId);
          url.searchParams.set(
            "fields",
            "name,rating,user_ratings_total,reviews,url",
          );
          url.searchParams.set("language", "it");
          url.searchParams.set("reviews_sort", "newest");
          url.searchParams.set("key", apiKey);

          const res = await fetch(url.toString());
          const data: PlaceDetailsResponse = await res.json();

          if (data.status !== "OK" || !data.result) {
            return Response.json(
              {
                ok: false,
                error: data.error_message ?? data.status ?? "Errore Google Places",
              },
              { status: 200 },
            );
          }

          const payload = {
            ok: true,
            place: {
              name: data.result.name,
              rating: data.result.rating,
              total: data.result.user_ratings_total,
              url: data.result.url,
            },
            reviews: (data.result.reviews ?? []).map((r) => ({
              author: r.author_name,
              authorUrl: r.author_url,
              avatar: r.profile_photo_url,
              rating: r.rating,
              relativeTime: r.relative_time_description,
              text: r.text,
              time: r.time,
            })),
          };

          cache = { ts: Date.now(), payload };

          return Response.json(payload, {
            status: 200,
            headers: { "Cache-Control": "public, max-age=3600" },
          });
        } catch (error) {
          console.error("google-reviews error", error);
          return Response.json(
            { ok: false, error: "Impossibile contattare Google Places" },
            { status: 200 },
          );
        }
      },
    },
  },
});
