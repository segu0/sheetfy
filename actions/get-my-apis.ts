"use server";

import { createClient } from "@/lib/supabase/server";

export interface ApiProject {
  id: string;
  name: string;
  spreadsheet_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export async function getMyApis(): Promise<ApiProject[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("api")
    .select("id, name, spreadsheet_id, created_at, updated_at, is_active")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar APIs:", error);
    throw new Error("Erro ao buscar APIs");
  }

  return data ?? [];
}
