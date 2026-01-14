"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getGoogleAccessToken } from "./get-google-access-token";

interface SheetInfo {
  sheetId: number;
  title: string;
  index: number;
}

export async function refreshApiTabs(apiId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Erro ao obter usuário autenticado:", userError);
    throw new Error("Usuário não autenticado");
  }

  const { data: apiRow, error: apiError } = await supabase
    .from("api")
    .select("id, user_id, spreadsheet_id")
    .eq("id", apiId)
    .single();

  if (apiError || !apiRow) {
    console.error("Erro ao buscar API para refresh de abas:", apiError);
    throw new Error("API não encontrada");
  }

  if (apiRow.user_id !== user.id) {
    throw new Error("Acesso negado");
  }

  if (!apiRow.spreadsheet_id) {
    throw new Error("Esta API não possui uma planilha vinculada");
  }

  const accessToken = await getGoogleAccessToken();

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${apiRow.spreadsheet_id}?fields=sheets(properties(sheetId,title,index))`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("Erro ao buscar abas no Google Sheets:", errorBody);
    throw new Error(errorBody.error?.message || "Falha ao buscar abas no Google Sheets");
  }

  const data = await response.json();

  const sheets: SheetInfo[] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.sheets?.map((sheet: any) => ({
      sheetId: sheet.properties.sheetId as number,
      title: sheet.properties.title as string,
      index: sheet.properties.index as number,
    })) ?? [];

  if (!sheets.length) {
    throw new Error("A planilha não possui abas");
  }

  const { data: existingTabs, error: tabsError } = await supabase
    .from("api_tab")
    .select("id, tab_name")
    .eq("api_id", apiRow.id);

  if (tabsError) {
    console.error("Erro ao buscar abas existentes da API:", tabsError);
    throw new Error("Erro ao buscar abas atuais da API");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingNames = new Set((existingTabs ?? []).map((t: any) => t.tab_name.toLowerCase()));

  const tabsToInsert = sheets
    .filter((sheet) => !existingNames.has(sheet.title.toLowerCase()))
    .map((sheet) => ({
      api_id: apiRow.id,
      tab_name: sheet.title,
      tab_index: sheet.index,
      allow_get: true,
      allow_post: false,
      allow_patch: false,
      allow_delete: false,
      auth_type: "none",
      bearer_token: null,
    }));

  if (tabsToInsert.length > 0) {
    const { error: insertError } = await supabase.from("api_tab").insert(tabsToInsert);

    if (insertError) {
      console.error("Erro ao inserir novas abas da API:", insertError);
      throw new Error("Erro ao salvar novas abas");
    }
  }

  revalidatePath(`/projetos/${apiRow.id}`);

  return {
    success: true,
    insertedTabs: tabsToInsert.length,
  };
}
