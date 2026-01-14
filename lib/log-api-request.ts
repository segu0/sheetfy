import { createClient } from "@/lib/supabase/server";

interface LogApiRequestParams {
  apiId: string;
  tabId?: string;
  method: string;
  statusCode: number;
  responseTime: number;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
}

export async function logApiRequest(params: LogApiRequestParams) {
  try {
    const supabase = await createClient();

    await supabase.from("api_log").insert({
      api_id: params.apiId,
      tab_id: params.tabId ?? null,
      method: params.method,
      status_code: params.statusCode,
      response_time: params.responseTime,
      endpoint: params.endpoint ?? null,
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ?? null,
    });
  } catch (error) {
    console.error("Erro ao registrar log:", error);
  }
}
