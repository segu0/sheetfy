"use server";

import { getUserPlanLimits } from "@/actions/get-user-plan-limits";
import { createClient } from "@/lib/supabase/server";

export async function updateApiStatus(apiId: string, isActive: boolean) {
  const supabase = await createClient();

  // 1. Buscar a API pra descobrir o dono (user_id) e status atual
  const { data: api, error: apiError } = await supabase
    .from("api")
    .select("id, user_id, is_active")
    .eq("id", apiId)
    .maybeSingle();

  if (apiError || !api) {
    console.error("Erro ao buscar API:", apiError);
    return {
      success: false,
      error: "API não encontrada.",
    };
  }

  // 2. Se já está ativa e continuar ativa => não precisa validar limite
  const wasActive = api.is_active === true;
  const willBeActive = isActive === true;

  // Só valida limite quando estiver TROCANDO de inativa -> ativa
  if (!wasActive && willBeActive) {
    const limits = await getUserPlanLimits(api.user_id);

    // Se plano não tem APIs liberadas, já barra de cara
    if (limits.maxApis <= 0) {
      return {
        success: false,
        error: `Seu plano atual ("${limits.planName}") não permite APIs ativas. Faça upgrade para ativar projetos.`,
      };
    }

    // 3. Contar quantas APIs ativas esse usuário já tem
    const { count, error: countError } = await supabase
      .from("api")
      .select("id", { count: "exact", head: true })
      .eq("user_id", api.user_id)
      .eq("is_active", true);

    if (countError) {
      console.error("Erro ao contar APIs ativas:", countError);
      return {
        success: false,
        error: "Não foi possível validar o limite de APIs ativas. Tente novamente.",
      };
    }

    const activeApis = count ?? 0;

    // 4. Se já atingiu o limite, bloqueia a ativação
    if (activeApis >= limits.maxApis) {
      return {
        success: false,
        error: `Seu plano ${limits.planName} permite até ${limits.maxApis} APIs ativas. Você já atingiu esse limite.`,
      };
    }
  }

  // 5. Atualizar status normalmente
  const { error: updateError } = await supabase
    .from("api")
    .update({ is_active: willBeActive })
    .eq("id", apiId);

  if (updateError) {
    console.error("Erro ao atualizar status da API:", updateError);
    return {
      success: false,
      error: "Erro ao atualizar status da API. Tente novamente.",
    };
  }

  return {
    success: true,
  };
}
