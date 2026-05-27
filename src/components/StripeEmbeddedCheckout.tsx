import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  priceId: string;
  customerEmail?: string;
  returnUrl?: string;
  userId?: string;
  extraPriceIds?: string[];
  metadata?: Record<string, string>;
}

export function StripeEmbeddedCheckout({ priceId, customerEmail, returnUrl, userId, extraPriceIds, metadata }: Props) {
  const { user } = useAuth();
  const resolvedUserId = userId ?? user?.id;
  const resolvedEmail = customerEmail ?? user?.email;

  const fetchClientSecret = async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        priceId,
        quantity: 1,
        customerEmail: resolvedEmail,
        userId: resolvedUserId,
        returnUrl,
        environment: getStripeEnvironment(),
        ...(extraPriceIds && extraPriceIds.length ? { extraPriceIds } : {}),
        ...(metadata ? { metadata } : {}),
      },
    });
    if (error || !data?.clientSecret) {
      throw new Error(error?.message || "Failed to create checkout session");
    }
    return data.clientSecret;
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
