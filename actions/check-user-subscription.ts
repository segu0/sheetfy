"use server";

import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function checkUserSubscription(userId: string) {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("stripe_subscription_id, stripe_price_id, stripe_current_period_end")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile?.stripe_subscription_id) {
    return {
      isSubscribed: false,
      priceId: null as string | null,
      currentPeriodEnd: null as Date | null,
      status: "inactive" as const,
    };
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);

    const isActive = subscription.status === "active" || subscription.status === "trialing";
    const currentPriceId = subscription.items.data[0]?.price.id ?? null;

    return {
      isSubscribed: isActive,
      priceId: currentPriceId,
      currentPeriodEnd: profile.stripe_current_period_end
        ? new Date(profile.stripe_current_period_end)
        : null,
      status: subscription.status,
    };
  } catch (err) {
    console.error("Erro ao verificar subscription:", err);
    return {
      isSubscribed: false,
      priceId: profile?.stripe_price_id ?? null,
      currentPeriodEnd: profile?.stripe_current_period_end
        ? new Date(profile.stripe_current_period_end)
        : null,
      status: "error" as const,
    };
  }
}
