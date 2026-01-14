"use server";

import { createClient } from "@/lib/supabase/server";

export async function getApiAndTab(apiKey: string, tabName: string) {
  const supabase = await createClient();

  const { data: api, error: apiError } = await supabase
    .from("api")
    .select("*, api_tab(*)")
    .eq("api_key", apiKey)
    .eq("is_active", true)
    .single();

  if (apiError || !api) {
    return { error: "API não encontrada", status: 404 };
  }

  const normalized = tabName.toLowerCase().replace(/\s+/g, "_");

  const tab = api.api_tab.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (t: any) => t.tab_name.toLowerCase().replace(/\s+/g, "_") === normalized
  );

  if (!tab) {
    return { error: "Aba não encontrada", status: 404 };
  }

  return { api, tab };
}
