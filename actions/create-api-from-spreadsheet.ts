"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getSpreadsheetMetadata } from "./get-spreadsheet-metadata";
import { getUserPlanLimits } from "./get-user-plan-limits";

interface CreateApiInput {
  spreadsheetId: string;
  spreadsheetName: string;
  spreadsheetUrl: string;
}

type CreateApiResult =
  | {
      success: true;
      apiId: string;
    }
  | {
      success: false;
      error: string;
    };

export async function createApiFromSpreadsheet(input: CreateApiInput): Promise<CreateApiResult> {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      success: false,
      error: "Usuário não autenticado.",
    };
  }

  const userId = userData.user.id;

  try {
    const limits = await getUserPlanLimits(userId);

    // sem plano ou plano sem limites => bloqueia
    if (limits.maxApis === 0 || limits.maxRows === 0) {
      return {
        success: false,
        error:
          "Você não possui um plano ativo ou seu plano não permite criar APIs. Assine ou faça upgrade para continuar.",
      };
    }

    const { count: activeApisCount, error: countError } = await supabase
      .from("api")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_active", true);

    if (countError) {
      console.error("Erro ao contar APIs ativas:", countError);
      return {
        success: false,
        error: "Não foi possível verificar suas APIs atuais. Tente novamente.",
      };
    }

    const currentApis = activeApisCount ?? 0;

    if (currentApis >= limits.maxApis) {
      return {
        success: false,
        error: `Seu plano ${limits.planName} permite até ${limits.maxApis} APIs ativas. Você já atingiu esse limite. Desative uma API ou faça upgrade de plano para criar novas.`,
      };
    }

    const metadata = await getSpreadsheetMetadata(input.spreadsheetId);

    const totalRows = metadata.sheets.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc: number, sheet: any) => acc + (sheet.rowCount || 0),
      0
    );

    if (totalRows > limits.maxRows) {
      return {
        success: false,
        error: `Esta planilha tem ${totalRows.toLocaleString(
          "pt-BR"
        )} linhas, mas seu plano ${limits.planName} permite no máximo ${limits.maxRows.toLocaleString(
          "pt-BR"
        )} linhas por planilha. Use uma planilha menor ou faça upgrade de plano.`,
      };
    }

    const apiKey = `sk_${nanoid(32)}`;

    const { data: api, error: apiError } = await supabase
      .from("api")
      .insert({
        user_id: userId,
        name: input.spreadsheetName,
        api_key: apiKey,
        spreadsheet_id: input.spreadsheetId,
        spreadsheet_url: input.spreadsheetUrl,
        is_active: true,
      })
      .select("id")
      .single();

    if (apiError || !api) {
      console.error("Erro ao criar registro de API:", apiError);
      return {
        success: false,
        error: "Erro ao criar registro de API. Tente novamente.",
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tabsToInsert = metadata.sheets.map((sheetTab: any) => ({
      api_id: api.id,
      tab_name: sheetTab.title,
      tab_index: sheetTab.index,
      row_count: sheetTab.rowCount || 0,
      allow_get: true,
      allow_post: false,
      allow_patch: false,
      allow_delete: false,
      auth_type: "none",
      rate_limit: 1000,
    }));

    const { error: tabsError } = await supabase.from("api_tab").insert(tabsToInsert);

    if (tabsError) {
      console.error("Erro ao criar tabs da API:", tabsError);
      return {
        success: false,
        error: "Erro ao criar abas da API. Tente novamente.",
      };
    }

    revalidatePath("/projetos");

    return {
      success: true,
      apiId: api.id,
    };
  } catch (error) {
    console.error("Erro ao criar API:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao criar API. Tente novamente mais tarde.",
    };
  }
}
