"use server";

import { checkUserSubscription } from "./check-user-subscription";

export async function getUserPlanLimits(userId: string) {
  const subscription = await checkUserSubscription(userId);

  const limits: Record<
    string,
    {
      maxApis: number;
      maxRequests: number;
      maxRows: number;
      planName: string;
    }
  > = {
    // Starter
    price_1SbpyH2aEIppNG6bAnJ6t80r: {
      maxApis: 3,
      maxRequests: 10_000,
      maxRows: 1_000,
      planName: "Starter",
    },
    // Pro
    price_1Sbpyg2aEIppNG6b73hvHnlz: {
      maxApis: 10,
      maxRequests: 100_000,
      maxRows: 10_000,
      planName: "Pro",
    },
    // Business
    price_1Sbpz12aEIppNG6bVqVShwRw: {
      maxApis: 999_999,
      maxRequests: 500_000,
      maxRows: 100_000,
      planName: "Business",
    },
  };

  // Sem assinatura => nada liberado
  if (!subscription.isSubscribed || !subscription.priceId) {
    return {
      maxApis: 0,
      maxRequests: 0,
      maxRows: 0,
      planName: "Sem plano ativo",
    };
  }

  // Se por algum motivo vier um priceId diferente, cai pro Starter
  return limits[subscription.priceId] ?? limits["price_1SHoyk2aEIppNG6bULf4gJMc"];
}
