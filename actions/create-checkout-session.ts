"use server";

import { checkUserSubscription } from "@/actions/check-user-subscription";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function createCheckoutSession(priceId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false as const,
      error: "Você precisa estar logado para assinar.",
    };
  }

  const userId = user.id;

  // 1) Verificar se o usuário já tem assinatura ativa
  const subscription = await checkUserSubscription(userId);

  if (subscription.isSubscribed) {
    return {
      ok: false as const,
      error: "Você já possui uma assinatura ativa.",
    };
  }

  // 2) Buscar/criar o stripe_customer_id no perfil
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stripe_customer_id, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Erro ao buscar profile:", profileError);
    return {
      ok: false as const,
      error: "Erro ao buscar seu perfil. Tente novamente.",
    };
  }

  let stripeCustomerId = profile?.stripe_customer_id ?? null;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: profile?.full_name ?? undefined,
      metadata: { supabase_user_id: userId },
    });

    stripeCustomerId = customer.id;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", userId);

    if (updateError) {
      console.error("Erro ao salvar stripe_customer_id:", updateError);
    }
  }

  // 3) Criar sessão de checkout
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId!,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/planos?canceled=1`,
    // opcional: permitir troca de plano
    allow_promotion_codes: true,
  });

  return {
    ok: true as const,
    url: session.url!,
  };
}
