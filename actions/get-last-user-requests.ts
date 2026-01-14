"use server";

import { createClient } from "@/lib/supabase/server";

export async function getLastUserRequests() {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Usuário não autenticado");

  const userId = userData.user.id;

  const { data, error } = await supabase
    .from("api_log")
    .select(
      `
        id,
        created_at,
        method,
        status_code,
        endpoint,
        api!inner ( user_id )
      `
    )
    .eq("api.user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error(error);
    throw new Error("Erro ao carregar últimas requisições");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    timestamp: row.created_at,
    method: row.method,
    endpoint: row.endpoint,
    httpStatus: row.status_code,
  }));
}
