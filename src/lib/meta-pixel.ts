import { canTrack, onConsentChange } from "@/lib/consent";

export const META_PIXEL_ID = "1520411269668854";

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
declare global {
  interface Window { fbq?: Fbq; _fbq?: Fbq }
}

let loaded = false;

function inject() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const n: Fbq = function (...args: unknown[]) {
    if (n.callMethod) n.callMethod(...args);
    else n.queue!.push(args);
  } as Fbq;
  n.queue = [];
  n.loaded = true;
  n.version = "2.0";
  n.push = n;
  window.fbq = n;
  window._fbq = n;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  window.fbq("init", META_PIXEL_ID);
  window.fbq("track", "PageView");
}

/** Loads the pixel only once advertising consent is granted. */
export function initMetaPixel(): () => void {
  const tryLoad = () => void canTrack("advertising").then((ok) => ok && inject());
  tryLoad();
  return onConsentChange(tryLoad);
}

/** Sends an event only if the pixel is loaded (i.e. consent was given). No personal data. */
export function trackPixel(event: string, params?: Record<string, string | number>, custom = false) {
  if (!loaded || !window.fbq) return;
  window.fbq(custom ? "trackCustom" : "track", event, params ?? {});
}
