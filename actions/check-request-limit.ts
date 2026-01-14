"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserPlanLimits } from "./get-user-plan-limits";

export async function checkRequestLimit(userId: string): Promise<{
  allowed: boolean;
  currentRequests: number;
  maxRequests: number;
}> {
  const supabase = await createClient();
  const limits = await getUserPlanLimits(userId);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: apis, error: apisError } = await supabase
    .from("api")
    .select("id")
    .eq("user_id", userId);

  if (apisError) {
    console.error("Erro ao buscar APIs do usuário:", apisError);
    return {
      allowed: false,
      currentRequests: 0,
      maxRequests: limits.maxRequests,
    };
  }

  const apiIds = (apis ?? []).map((a) => a.id);

  if (apiIds.length === 0) {
    return {
      allowed: true,
      currentRequests: 0,
      maxRequests: limits.maxRequests,
    };
  }

  const { count, error: logError } = await supabase
    .from("api_log")
    .select("id", { count: "exact", head: true })
    .in("api_id", apiIds)
    .gte("created_at", startOfMonth.toISOString())
    .gte("status_code", 200)
    .lt("status_code", 300);

  if (logError) {
    console.error("Erro ao contar requests:", logError);
    return {
      allowed: false,
      currentRequests: 0,
      maxRequests: limits.maxRequests,
    };
  }

  const currentRequests = count ?? 0;

  return {
    allowed: currentRequests < limits.maxRequests,
    currentRequests,
    maxRequests: limits.maxRequests,
  };
}
