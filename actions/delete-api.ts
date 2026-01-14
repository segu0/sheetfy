"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteApi(apiId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const { data, error } = await supabase
      .from("api")
      .delete()
      .eq("id", apiId)
      .eq("user_id", user?.id)
      .select("id")
      .single();

    if (error) {
      console.error("Erro ao deletar API:", error);
      throw new Error("Erro ao deletar API");
    }

    if (!data) {
      throw new Error("API não encontrada ou você não tem permissão para deletá-la");
    }

    revalidatePath("/projetos");

    return {
      success: true,
      message: "API deletada com sucesso",
    };
  } catch (error) {
    console.error("Erro ao deletar API:", error);
    throw new Error(error instanceof Error ? error.message : "Erro ao deletar API");
  }
}
