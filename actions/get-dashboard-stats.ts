"use server";

import { createClient } from "@/lib/supabase/server";

type DashboardStats = {
  totalApis: number;
  requestsThisMonth: number;
  growth: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("getDashboardStats: usuário não autenticado:", authError);
    return {
      totalApis: 0,
      requestsThisMonth: 0,
      growth: 0,
    };
  }

  // ==== 1) Buscar APIs do usuário ====
  const { data: apis, error: apiError } = await supabase
    .from("api")
    .select("id")
    .eq("user_id", user.id);

  if (apiError) {
    console.error("Erro ao buscar APIs do usuário:", apiError);
    return {
      totalApis: 0,
      requestsThisMonth: 0,
      growth: 0,
    };
  }

  const apiIds = (apis ?? []).map((a) => a.id as string);
  const totalApis = apiIds.length;

  if (apiIds.length === 0) {
    // Sem APIs → tudo zero
    return {
      totalApis,
      requestsThisMonth: 0,
      growth: 0,
    };
  }

  // ==== 2) Datas de referência (mês atual vs mês anterior) ====
  const now = new Date();

  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // fim do mês atual = início do próximo mês
  const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // ==== 3) Contar requisições do mês atual ====
  const { count: currentCount, error: currentError } = await supabase
    .from("api_log")
    .select("*", { count: "exact", head: true })
    .in("api_id", apiIds)
    .gte("created_at", startOfCurrentMonth.toISOString())
    .lt("created_at", endOfCurrentMonth.toISOString());

  if (currentError) {
    console.error("Erro ao contar requisições do mês atual:", currentError);
  }

  const requestsThisMonth = currentCount ?? 0;

  // ==== 4) Contar requisições do mês anterior ====
  const { count: previousCount, error: previousError } = await supabase
    .from("api_log")
    .select("*", { count: "exact", head: true })
    .in("api_id", apiIds)
    .gte("created_at", startOfPreviousMonth.toISOString())
    .lt("created_at", startOfCurrentMonth.toISOString());

  if (previousError) {
    console.error("Erro ao contar requisições do mês anterior:", previousError);
  }

  const prev = previousCount ?? 0;

  // ==== 5) Calcular growth ====
  let growth = 0;

  if (prev === 0) {
    // se não tinha nada antes e agora tem, considera 100%; se continua 0, growth 0
    growth = requestsThisMonth > 0 ? 100 : 0;
  } else {
    growth = Math.round(((requestsThisMonth - prev) / prev) * 100);
  }

  return {
    totalApis,
    requestsThisMonth,
    growth,
  };
}
