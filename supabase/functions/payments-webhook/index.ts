import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { type StripeEnv, createStripeClient, verifyWebhook } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const APP_URL =
  Deno.env.get("APP_URL") ||
  Deno.env.get("PUBLIC_APP_URL") ||
  "https://deskindustries.com";

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const url = new URL(req.url);
  const env = (url.searchParams.get("env") || "sandbox") as StripeEnv;

  try {
    const event = await verifyWebhook(req, env);
    console.log("Event:", event.type, "env:", env);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, env);
        break;
      case "customer.subscription.created":
        await handleSubscriptionUpsert(event.data.object, env);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpsert(event.data.object, env);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, env);
        break;
      case "invoice.payment_failed":
        console.log("Payment failed:", event.data.object.id);
        break;
      default:
        console.log("Unhandled:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  const email = session.customer_email || session.customer_details?.email;
  if (!email) {
    console.error("No email in session", session.id);
    return;
  }

  // Look up user by email if exists
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  const metadataUserId = session.metadata?.userId || null;
  const resolvedUserId = existingUser?.user_id || metadataUserId || null;

  // Get product/price info
  const stripe = createStripeClient(env);
  let productId: string | null = null;
  let priceId: string | null = null;
  if (session.mode === "subscription" && session.subscription) {
    try {
      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      const item = sub.items?.data?.[0];
      productId = (item?.price?.product as string) || null;
      priceId = item?.price?.lookup_key || item?.price?.metadata?.lovable_external_id || item?.price?.id || null;
    } catch (e) {
      console.error("Could not retrieve subscription", e);
    }
  } else if (session.mode === "payment") {
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id as string, { limit: 1 });
      const li = lineItems.data?.[0];
      productId = (li?.price?.product as string) || null;
      priceId = li?.price?.lookup_key || li?.price?.metadata?.lovable_external_id || li?.price?.id || null;
    } catch (e) {
      console.error("Could not retrieve line items", e);
    }
  }

  // Record purchase
  await supabase.from("purchases").upsert(
    {
      user_id: resolvedUserId,
      customer_email: email,
      stripe_session_id: session.id,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      product_id: productId,
      price_id: priceId,
      amount_total: session.amount_total,
      currency: session.currency,
      mode: session.mode,
      environment: env,
    },
    { onConflict: "stripe_session_id" }
  );

  // SEO extra article credit
  if (priceId === "seo_optimizer_extra_article" && resolvedUserId) {
    const qty = Number(session.amount_total) > 0 ? Math.max(1, Math.round(Number(session.amount_total) / 100)) : 1;
    const rows = Array.from({ length: qty }).map((_, i) => ({
      user_id: resolvedUserId,
      stripe_session_id: `${session.id}-${i}`,
    }));
    await supabase.from("seo_optimizer_extra_credits").upsert(rows, { onConflict: "stripe_session_id" });
  }

  // Foll.IA: activate site when metadata.folliaSiteId present
  const folliaSiteId = session.metadata?.folliaSiteId;
  const folliaPlan = session.metadata?.folliaPlan; // 'basic' | 'with_setup'
  if (folliaSiteId) {
    const newStatus = folliaPlan === "with_setup" ? "in_review" : "live";
    const planValue = folliaPlan === "with_setup" ? "with_setup_297" : "basic_19";
    const { error: siteErr } = await supabase
      .from("follia_sites")
      .update({
        status: newStatus,
        plan: planValue,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        ...(resolvedUserId && { user_id: resolvedUserId, claimed_at: new Date().toISOString() }),
      })
      .eq("id", folliaSiteId);
    if (siteErr) console.error("Could not update follia_site", siteErr);
  }

  // Foll.IA: ticket payment completion
  const folliaTicketId = session.metadata?.folliaTicketId;
  if (folliaTicketId) {
    const { data: t } = await supabase
      .from("follia_tickets")
      .update({
        status: "open",
        paid_at: new Date().toISOString(),
        stripe_session_id: session.id,
      })
      .eq("id", folliaTicketId)
      .select("id, site_id, subject, category, attachments, customer_email, user_id")
      .maybeSingle();
    if (t) {
      try {
        await fetch(`${APP_URL}/lovable/email/transactional/send-ticket-staff`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ ticketId: folliaTicketId }),
        });
      } catch (e) {
        console.error("Failed to trigger staff email after ticket payment", e);
      }
    }
  }



  // Send welcome email if user does not yet exist
  if (!existingUser) {
    try {
      await fetch(`${APP_URL}/lovable/email/transactional/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "X-Internal-Webhook": "payments-webhook",
        },
        body: JSON.stringify({
          templateName: "welcome-post-purchase",
          recipientEmail: email,
          idempotencyKey: `welcome-${session.id}`,
          templateData: {
            email,
            sessionId: session.id,
            mode: session.mode,
          },
        }),
      });
    } catch (e) {
      console.error("Failed to send welcome email", e);
    }
  }
}

async function handleSubscriptionUpsert(subscription: any, env: StripeEnv) {
  const stripe = createStripeClient(env);

  // Resolve email from customer
  let email: string | null = null;
  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (!(customer as any).deleted) email = (customer as any).email;
  } catch (e) {
    console.error("Could not retrieve customer", e);
  }
  if (!email) {
    console.error("No email for subscription", subscription.id);
    return;
  }

  const { data: existingUser } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.lookup_key || item?.price?.metadata?.lovable_external_id || item?.price?.id;
  const productId = item?.price?.product;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  await supabase.from("subscriptions").upsert(
    {
      user_id: existingUser?.user_id || null,
      customer_email: email,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: productId,
      price_id: priceId,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" }
  );
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
}
