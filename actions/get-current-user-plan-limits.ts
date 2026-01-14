"use server";

import { getUserPlanLimits } from "@/actions/get-user-plan-limits";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUserPlanLimits() {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error("Usuário não autenticado");
  }

  const userId = userData.user.id;

  // aqui você reaproveita exatamente sua função existente
  const limits = await getUserPlanLimits(userId);

  return limits;
}
