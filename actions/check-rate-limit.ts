"use server";

import { checkRequestLimit } from "./check-request-limit";

export async function checkRateLimit(userId: string) {
  const requestCheck = await checkRequestLimit(userId);

  if (!requestCheck.allowed) {
    return {
      error: `Limite de requisições atingido. Você usou ${requestCheck.currentRequests} de ${requestCheck.maxRequests} requisições este mês. Faça upgrade para continuar.`,
      status: 429,
      headers: {
        "X-RateLimit-Limit": requestCheck.maxRequests.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          1
        ).toISOString(),
      },
    } as const;
  }

  return null;
}
