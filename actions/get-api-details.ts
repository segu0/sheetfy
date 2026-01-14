"use server";

import { createClient } from "@/lib/supabase/server";

export interface APITab {
  id: string;
  tabName: string;
  tabIndex: number;
  allowGet: boolean;
  allowPost: boolean;
  allowPatch: boolean;
  allowDelete: boolean;
  authType: string;
  bearerToken: string | null;
}

export interface API {
  id: string;
  name: string;
  apiKey: string;
  spreadsheetId: string;
  spreadsheetUrl: string | null;
  isActive: boolean;
  tabs: APITab[];
}

export async function getApiDetails(apiId: string): Promise<API> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: apiRow, error: apiError } = await supabase
    .from("api")
    .select("*")
    .eq("id", apiId)
    .eq("user_id", user?.id)
    .single();

  if (apiError || !apiRow) {
    console.error("Erro ao buscar API:", apiError);
    // throw new Error("API não encontrada");
  }

  const { data: tabsRows, error: tabsError } = await supabase
    .from("api_tab")
    .select("*")
    .eq("api_id", apiRow.id)
    .order("tab_index", { ascending: true });

  if (tabsError) {
    console.error("Erro ao buscar tabs:", tabsError);
    // throw new Error("Erro ao buscar abas da API");
  }

  const tabs: APITab[] =
    tabsRows?.map((tab) => ({
      id: tab.id,
      tabName: tab.tab_name,
      tabIndex: tab.tab_index,
      allowGet: tab.allow_get,
      allowPost: tab.allow_post,
      allowPatch: tab.allow_patch,
      allowDelete: tab.allow_delete,
      authType: tab.auth_type,
      bearerToken: tab.bearer_token,
    })) ?? [];

  return {
    id: apiRow.id,
    name: apiRow.name,
    apiKey: apiRow.api_key,
    spreadsheetId: apiRow.spreadsheet_id,
    spreadsheetUrl: apiRow.spreadsheet_url,
    isActive: apiRow.is_active,
    tabs,
  };
}
