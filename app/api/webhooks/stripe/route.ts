import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type StripeType from "stripe";

import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function upsertProfileFromSubscription(subscription: StripeType.Subscription) {
  const supabase = await createClient();

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;

  if (!customerId) {
    console.warn("Subscription sem customerId, ignorando.");
    return;
  }

  const firstItem = subscription.items.data[0] as StripeType.SubscriptionItem & {
    current_period_end?: number;
    current_period_start?: number;
  };

  const priceId = firstItem?.price?.id ?? null;

  const currentPeriodEnd =
    firstItem?.current_period_end != null
      ? new Date(firstItem.current_period_end * 1000).toISOString()
      : null;

  const { data, error } = await supabase
    .from("profiles")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      stripe_current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId)
    .select("id");

  if (error) {
    console.error("Erro ao atualizar profile por stripe_customer_id:", error);
  }

  if (data && data.length > 0) {
    console.log("✅ Profile atualizado por stripe_customer_id:", data[0].id);
    return;
  }

  const customer = await stripe.customers.retrieve(customerId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseUserId = (customer as any).metadata?.supabase_user_id ?? null;

  if (!supabaseUserId) {
    console.warn(
      "Não foi possível encontrar supabase_user_id no metadata do customer:",
      customerId
    );
    return;
  }

  const { error: updateByUserError } = await supabase
    .from("profiles")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      stripe_current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("id", supabaseUserId);

  if (updateByUserError) {
    console.error("Erro ao atualizar profile por metadata.supabase_user_id:", updateByUserError);
  } else {
    console.log("✅ Profile atualizado por metadata.supabase_user_id:", supabaseUserId);
  }
}

async function clearSubscriptionOnProfile(subscription: StripeType.Subscription) {
  const supabase = await createClient();

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;

  if (!customerId) return;

  const { data, error } = await supabase
    .from("profiles")
    .update({
      stripe_subscription_id: null,
      stripe_price_id: null,
      stripe_current_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId)
    .select("id");

  if (error) {
    console.error("Erro ao limpar subscription no profile por stripe_customer_id:", error);
  }

  if (data && data.length > 0) return;

  const customer = await stripe.customers.retrieve(customerId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseUserId = (customer as any).metadata?.supabase_user_id ?? null;

  if (!supabaseUserId) return;

  const { error: updateByUserError } = await supabase
    .from("profiles")
    .update({
      stripe_subscription_id: null,
      stripe_price_id: null,
      stripe_current_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", supabaseUserId);

  if (updateByUserError) {
    console.error(
      "Erro ao limpar subscription no profile por metadata.supabase_user_id:",
      updateByUserError
    );
  }
}

/**
 * checkout.session.completed – assinatura criada via Checkout
 */
async function handleCheckoutSessionCompleted(session: StripeType.Checkout.Session) {
  if (!session.subscription) {
    console.warn("checkout.session.completed sem subscription, ignorando.");
    return;
  }

  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription.id;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await upsertProfileFromSubscription(subscription);
}

/**
 * Subscription criada/atualizada (via portal, dashboard, etc.)
 */
async function handleSubscriptionUpdated(subscription: StripeType.Subscription) {
  await upsertProfileFromSubscription(subscription);
}

/**
 * Subscription deletada/cancelada
 */
async function handleSubscriptionDeleted(subscription: StripeType.Subscription) {
  await clearSubscriptionOnProfile(subscription);
}

/**
 * Invoice pago com sucesso – log, email, etc.
 */
async function handleInvoicePaymentSucceeded(invoice: StripeType.Invoice) {
  console.log(
    "💰 Pagamento de invoice bem-sucedido:",
    invoice.id,
    "para customer:",
    invoice.customer
  );
}

/**
 * Invoice falhou – log, suspender acesso, etc.
 */
async function handleInvoicePaymentFailed(invoice: StripeType.Invoice) {
  console.warn("⚠️ Pagamento de invoice falhou:", invoice.id, "para customer:", invoice.customer);
}

export async function POST(req: Request) {
  console.log("🔥 ENTROU NO WEBHOOK /api/webhooks/stripe");
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: StripeType.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Webhook signature verification failed:", error.message);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  console.log("✅ Webhook recebido:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        console.log("pagamento completed");
        const session = event.data.object as StripeType.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        console.log("pagamento updated");
        const subscription = event.data.object as StripeType.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        console.log("pagamento deleted");
        const subscription = event.data.object as StripeType.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        console.log("pagamento payment_succeeded");
        const invoice = event.data.object as StripeType.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        console.log("pagamento payment_failed");
        const invoice = event.data.object as StripeType.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`⚠️ Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
