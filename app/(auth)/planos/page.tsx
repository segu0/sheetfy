import { redirect } from "next/navigation";

import { checkRequestLimit } from "@/actions/check-request-limit";
import { checkUserSubscription } from "@/actions/check-user-subscription";
import { getUserPlanLimits } from "@/actions/get-user-plan-limits";
import { plans } from "@/lib/plans";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

import { subscribeAction } from "@/actions/subscribe-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IconCircleCheck } from "@tabler/icons-react";
import { Sparkles } from "lucide-react";

type Stats = {
  currentRequests: number;
  maxRequests: number;
  apiCount: number;
  maxApis: number;
  planName: string;
};

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let stats: Stats | null = null;
  let currentPriceId: string | null = null;

  if (user) {
    const [subscription, limits, requestInfo, apiCountResult] = await Promise.all([
      checkUserSubscription(user.id),
      getUserPlanLimits(user.id),
      checkRequestLimit(user.id),
      supabase.from("api").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

    currentPriceId = subscription.priceId;

    stats = {
      currentRequests: requestInfo.currentRequests,
      maxRequests: requestInfo.maxRequests,
      apiCount: apiCountResult.count ?? 0,
      maxApis: limits.maxApis,
      planName: limits.planName,
    };
  }

  async function portalAction() {
    "use server";

    const supabaseServer = await createClient();
    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    if (!user) {
      redirect(`/login?redirect=/planos`);
    }

    const { data: profile, error } = await supabaseServer
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user!.id)
      .maybeSingle();

    if (error || !profile?.stripe_customer_id) {
      throw new Error("Cliente Stripe não encontrado.");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/planos`,
    });

    redirect(portalSession.url);
  }

  const requestProgress =
    stats && stats.maxRequests > 0
      ? Math.min(100, (stats.currentRequests / stats.maxRequests) * 100)
      : 0;

  const apiProgress =
    stats && stats.maxApis > 0 ? Math.min(100, (stats.apiCount / stats.maxApis) * 100) : 0;

  const isCurrentPlan = (priceId: string) => Boolean(currentPriceId && currentPriceId === priceId);

  const hasActivePlan = Boolean(stats && stats.planName !== "Sem plano ativo");

  const getButtonLabel = (priceId: string) => {
    if (!user) return "Começar Agora";

    if (isCurrentPlan(priceId)) {
      return (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Gerenciar assinatura
        </>
      );
    }

    if (stats && stats.planName !== "Sem plano ativo") {
      return "Mudar para este plano";
    }

    return "Começar Agora";
  };

  return (
    <div>
      {stats && (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card mb-8 grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs">
          <Card className="@container/card gap-1" data-slot="card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold tabular-nums">
                Total de Requisições
                <Badge variant="outline">
                  {stats.currentRequests} / {stats.maxRequests}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardFooter>
              <div className="w-full bg-gray-200">
                <Progress value={requestProgress} className="w-full rounded-none" />
              </div>
            </CardFooter>
          </Card>

          <Card className="@container/card gap-1" data-slot="card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold tabular-nums">
                API&apos;s ativas
                <Badge variant="outline">
                  {stats.apiCount} / {stats.maxApis === 999999 ? "♾️" : stats.maxApis}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardFooter>
              <div className="w-full bg-gray-200">
                <Progress value={apiProgress} className="w-full rounded-none" />
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      <div className="mt-7 grid grid-cols-1 gap-7 md:grid-cols-3">
        {plans.map((plan) => {
          const current = isCurrentPlan(plan.priceId);

          return (
            <div
              key={plan.name}
              className="from-primary/5 to-card bg-card relative flex flex-col gap-6 border border-zinc-200 bg-linear-to-t p-8 shadow-xs"
            >
              {current && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary flex items-center gap-1 rounded-full px-4 py-1 text-xs font-semibold text-white">
                    <Sparkles className="h-3 w-3" />
                    Seu plano atual
                  </span>
                </div>
              )}

              {!current && plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary flex items-center gap-1 rounded-full px-4 py-1 text-xs font-semibold text-white">
                    🔥 Mais Popular
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-x-4">
                <h3
                  id={`tier-${plan.name}-name`}
                  className="text-xl font-semibold tracking-tight text-pretty sm:text-2xl"
                >
                  {plan.name}
                </h3>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <p className="flex items-baseline gap-x-1">
                  <span className="tier-price text-3xl font-semibold tracking-tight">
                    R${plan.price}
                  </span>
                  <span className="tier-suffix text-muted-foreground text-xs font-medium">
                    {plan.period}
                  </span>
                </p>
                <p className="text-secondary-foreground text-sm text-pretty">{plan.description}</p>
              </div>

              <ul role="list" className="text-secondary-foreground space-y-4 font-medium">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex gap-x-3">
                    <IconCircleCheck className="stroke-primary" />
                    <span className="mt-0.5 flex items-center gap-3 text-zinc-900">
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {current || hasActivePlan ? (
                <form action={portalAction}>
                  <Button
                    type="submit"
                    aria-describedby={`tier-${plan.name}-name`}
                    className="group/button border-primary bg-primary hover:bg-primary/90 relative inline-flex w-full cursor-pointer items-center justify-center gap-[0.75ch] overflow-clip rounded-md border px-3.5 py-2 text-start text-sm font-semibold sm:px-4 sm:py-2.5"
                  >
                    {getButtonLabel(plan.priceId)}
                  </Button>
                </form>
              ) : (
                <form action={subscribeAction}>
                  <input type="hidden" name="priceId" value={plan.priceId} />
                  <Button
                    type="submit"
                    aria-describedby={`tier-${plan.name}-name`}
                    className="group/button border-primary hover:bg-primary/80 hover:text-primary-foreground relative inline-flex w-full cursor-pointer items-center justify-center gap-[0.75ch] overflow-clip rounded-md border px-3.5 py-2 text-start text-sm font-semibold sm:px-4 sm:py-2.5"
                  >
                    {getButtonLabel(plan.priceId)}
                  </Button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
