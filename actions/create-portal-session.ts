"use server";

import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function createPortalSession() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { requiresAuth: true } as const;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile?.stripe_customer_id) {
    throw new Error("Cliente Stripe não encontrado.");
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/planos`,
  });

  return { url: portalSession.url } as const;
}
