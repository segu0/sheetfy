"use server";

import { redirect } from "next/navigation";

import { checkUserSubscription } from "@/actions/check-user-subscription";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function subscribeAction(formData: FormData) {
  const priceId = formData.get("priceId");

  if (!priceId || typeof priceId !== "string") {
    // volta pra /planos com erro na URL
    redirect("/planos?error=price_id_invalid");
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/login?redirect=/planos`);
  }

  const userId = user.id;

  // 1) Verificar se JÁ existe assinatura ativa
  const subscription = await checkUserSubscription(userId);

  if (subscription.isSubscribed) {
    // já tem assinatura → não deixa criar outra
    redirect("/planos?error=already_subscribed");
  }

  // 2) Buscar/garantir stripe_customer_id no profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stripe_customer_id, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Erro ao buscar profile:", profileError);
    redirect("/planos?error=profile_not_found");
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
      redirect("/planos?error=stripe_customer_save_failed");
    }
  }

  // 3) Criar sessão de checkout no Stripe
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId!,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/planos?canceled=1`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    console.error("Sessão de checkout sem URL", session.id);
    redirect("/planos?error=checkout_url_missing");
  }

  // 4) Redireciona o usuário pro checkout
  redirect(session.url);
}
