export type Variant = "a" | "b";
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"] as const;

/** Returns the stored variant when valid, otherwise assigns one with a 50/50 draw. */
export function pickVariant(stored: string | null, rand: number = Math.random()): Variant {
  if (stored === "a" || stored === "b") return stored;
  return rand < 0.5 ? "a" : "b";
}

/** Keeps only tracking parameters from a query string. */
export function extractUtm(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const out: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) out[key] = v.slice(0, 200);
  }
  return out;
}

export function variantStorageKey(line: string) {
  return `lp_variant_${line}`;
}
