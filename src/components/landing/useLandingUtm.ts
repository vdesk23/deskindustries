import { useEffect } from "react";
import { extractUtm } from "@/lib/landing-splitter";

/** Keeps tracking parameters from the landing URL for the form submission. */
export function useLandingUtm() {
  useEffect(() => {
    const utm = extractUtm(window.location.search);
    try { if (Object.keys(utm).length) sessionStorage.setItem("lp_utm", JSON.stringify(utm)); } catch { /* ignore */ }
  }, []);
}
