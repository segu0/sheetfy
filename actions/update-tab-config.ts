"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface TabConfigInput {
  allowGet: boolean;
  allowPost: boolean;
  allowPatch: boolean;
  allowDelete: boolean;
  authType: string;
  bearerToken: string | null;
}

export async function updateTabConfig(tabId: string, config: TabConfigInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const { data: tabRow, error: tabError } = await supabase
      .from("api_tab")
      .select("id, api_id")
      .eq("id", tabId)
      .single();

    if (tabError || !tabRow) {
      throw new Error("Aba não encontrada");
    }

    const { data: apiRow, error: apiError } = await supabase
      .from("api")
      .select("id, user_id")
      .eq("id", tabRow.api_id)
      .eq("user_id", user?.id)
      .single();

    if (apiError || !apiRow) {
      throw new Error("Acesso negado");
    }

    const { data: updatedTab, error: updateError } = await supabase
      .from("api_tab")
      .update({
        allow_get: config.allowGet,
        allow_post: config.allowPost,
        allow_patch: config.allowPatch,
        allow_delete: config.allowDelete,
        auth_type: config.authType,
        bearer_token: config.authType === "bearer" ? config.bearerToken : null,
      })
      .eq("id", tabId)
      .select("*")
      .single();

    if (updateError || !updatedTab) {
      console.error("Erro ao atualizar tab:", updateError);
      throw new Error("Erro ao atualizar configurações");
    }

    revalidatePath(`/projetos/${apiRow.id}`);

    return {
      success: true,
      tab: updatedTab,
    };
  } catch (error) {
    console.error("Erro ao atualizar tab:", error);
    throw new Error(error instanceof Error ? error.message : "Erro ao atualizar configurações");
  }
}
