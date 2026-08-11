import { redirect } from "@tanstack/react-router";

/**
 * Pagine in bozza: non pubblicate.
 * Ogni route che la usa reindirizza alla Home ed è esclusa da sitemap/indicizzazione.
 */
export function draftBeforeLoad() {
  throw redirect({ to: "/" });
}

export const draftHead = {
  meta: [
    { title: "Desk Industries" },
    { name: "robots", content: "noindex, nofollow" },
  ],
};
