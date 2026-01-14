"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardHistory(days: number) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    console.error("Usuário não autenticado");
    return [];
  }

  const userId = userData.user.id;

  const { data: logsRaw, error } = await supabase
    .from("api_log")
    .select(
      `
        created_at,
        api:api_id (
          user_id
        )
      `
    )
    .gte("created_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: true });

  if (error || !logsRaw) {
    console.error("Erro ao buscar histórico:", error);
    return [];
  }

  type ApiRelation = { user_id: string } | null;
  type LogRow = {
    created_at: string;
    api: ApiRelation | ApiRelation[] | null;
  };

  const logs = logsRaw as unknown as LogRow[];

  const filtered = logs.filter((log) => {
    if (!log.api) return false;

    if (Array.isArray(log.api)) {
      return log.api.some((api) => api?.user_id === userId);
    }

    return log.api.user_id === userId;
  });

  const grouped: Record<string, number> = {};

  filtered.forEach((log) => {
    const day = new Date(log.created_at).toISOString().split("T")[0];
    grouped[day] = (grouped[day] || 0) + 1;
  });

  const result = Object.entries(grouped).map(([date, requests]) => ({
    date,
    requests,
  }));

  result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return result;
}
