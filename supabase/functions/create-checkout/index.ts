import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { priceId, quantity, customerEmail, returnUrl, environment, userId, metadata, extraPriceIds } = await req.json();
    if (!priceId || typeof priceId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(priceId)) {
      return new Response(JSON.stringify({ error: "Invalid priceId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const sessionMetadata = {
      ...(userId && { userId: String(userId) }),
      ...(metadata && typeof metadata === "object" ? metadata : {}),
    };

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: isRecurring ? "subscription" : "payment",
      ui_mode: "embedded",
      return_url: returnUrl || `${req.headers.get("origin")}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      ...(customerEmail && { customer_email: customerEmail }),
      ...(Object.keys(sessionMetadata).length > 0 && { metadata: sessionMetadata }),
      ...(isRecurring && Object.keys(sessionMetadata).length > 0 && {
        subscription_data: { metadata: sessionMetadata },
      }),
    });


    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
