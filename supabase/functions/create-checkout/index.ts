import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Metadata keys that the payments-webhook acts on for privileged side-effects.
// These must NEVER be accepted from untrusted callers — they are stripped from
// user-supplied metadata and re-attached server-side only after ownership has
// been verified against the authenticated user.
const SENSITIVE_METADATA_KEYS = new Set(["folliaSiteId", "folliaTicketId", "folliaPlan", "userId"]);

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { priceId, quantity, customerEmail, returnUrl, environment, extraPriceIds } = body;
    const rawMetadata = (body.metadata && typeof body.metadata === "object") ? body.metadata as Record<string, unknown> : {};

    if (!priceId || typeof priceId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(priceId)) {
      return new Response(JSON.stringify({ error: "Invalid priceId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve authenticated user (if any) from the Authorization header.
    // Anonymous callers are permitted only for flows that do NOT touch
    // sensitive metadata keys.
    let authedUserId: string | null = null;
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "").trim();
    if (authHeader) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader);
      if (user) authedUserId = user.id;
    }

    // Strip sensitive keys from caller-supplied metadata; re-derive them
    // server-side from the authenticated user's verified ownership.
    const safeMetadata: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawMetadata)) {
      if (SENSITIVE_METADATA_KEYS.has(k)) continue;
      if (typeof v === "string" && v.length <= 500) safeMetadata[k] = v;
    }

    const requestedSiteId = typeof rawMetadata.folliaSiteId === "string" ? rawMetadata.folliaSiteId : null;
    const requestedPlan = typeof rawMetadata.folliaPlan === "string" ? rawMetadata.folliaPlan : null;
    const requestedTicketId = typeof rawMetadata.folliaTicketId === "string" ? rawMetadata.folliaTicketId : null;

    if ((requestedSiteId || requestedTicketId) && !authedUserId) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (requestedSiteId) {
      const { data: site } = await supabaseAdmin
        .from("follia_sites")
        .select("id,user_id")
        .eq("id", requestedSiteId)
        .maybeSingle();
      if (!site || site.user_id !== authedUserId) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      safeMetadata.folliaSiteId = requestedSiteId;
      if (requestedPlan === "basic" || requestedPlan === "with_setup") {
        safeMetadata.folliaPlan = requestedPlan;
      }
    }

    if (requestedTicketId) {
      const { data: ticket } = await supabaseAdmin
        .from("follia_tickets")
        .select("id,user_id")
        .eq("id", requestedTicketId)
        .maybeSingle();
      if (!ticket || ticket.user_id !== authedUserId) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      safeMetadata.folliaTicketId = requestedTicketId;
    }

    // userId metadata is only attached when verified against the auth token.
    if (authedUserId) safeMetadata.userId = authedUserId;

    const env = (environment || "sandbox") as StripeEnv;
    const stripe = createStripeClient(env);

    const allLookupKeys = [priceId, ...(Array.isArray(extraPriceIds) ? extraPriceIds.filter((k) => typeof k === "string" && /^[a-zA-Z0-9_-]+$/.test(k)) : [])];
    const prices = await stripe.prices.list({ lookup_keys: allLookupKeys, limit: 20 });
    if (!prices.data.length) {
      return new Response(JSON.stringify({ error: "Price not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const byLookup = new Map(prices.data.map((p) => [p.lookup_key as string, p]));
    const primaryPrice = byLookup.get(priceId);
    if (!primaryPrice) {
      return new Response(JSON.stringify({ error: "Primary price not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const isRecurring = primaryPrice.type === "recurring";

    const lineItems = [{ price: primaryPrice.id, quantity: quantity || 1 }];
    for (const extra of allLookupKeys.slice(1)) {
      const p = byLookup.get(extra);
      if (p) lineItems.push({ price: p.id, quantity: 1 });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: isRecurring ? "subscription" : "payment",
      ui_mode: "embedded",
      return_url: returnUrl || `${req.headers.get("origin")}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      ...(customerEmail && { customer_email: customerEmail }),
      ...(Object.keys(safeMetadata).length > 0 && { metadata: safeMetadata }),
      ...(isRecurring && Object.keys(safeMetadata).length > 0 && {
        subscription_data: { metadata: safeMetadata },
      }),
    });


    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("create-checkout error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
