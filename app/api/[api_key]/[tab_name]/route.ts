import { NextRequest, NextResponse } from "next/server";

import { appendSpreadsheetRowWithToken } from "@/actions/append-spreadsheet-row-with-token";
import { checkRateLimit } from "@/actions/check-rate-limit";
import { deleteSpreadsheetRowWithToken } from "@/actions/delete-spreadsheet-row-with-token";
import { getApiAndTab } from "@/actions/get-api-and-tab";
import { getGoogleAccessTokenByUserId } from "@/actions/get-google-access-token-by-user-id";
import { getSpreadsheetDataWithToken } from "@/actions/get-spreadsheet-data-with-token";
import { getSpreadsheetHeadersWithToken } from "@/actions/get-spreadsheet-headers-with-token";
import { updateSpreadsheetRowWithToken } from "@/actions/update-spreadsheet-row-with-token";
import { getClientIp } from "@/lib/get-client-ip";
import { logApiRequest } from "@/lib/log-api-request";
import { sheetsToJson } from "@/lib/sheets-to-json";

import { createClient } from "@/lib/supabase/server";

function checkAuth(
  request: NextRequest,
  tabConfig: {
    authType: string;
    bearerToken: string | null;
  }
): {
  status: number;
  error: string;
} | null {
  if (tabConfig.authType !== "bearer") {
    return null;
  }

  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      status: 401,
      error: "Autenticação Bearer obrigatória. Envie o header Authorization: Bearer <token>.",
    };
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!tabConfig.bearerToken || token !== tabConfig.bearerToken) {
    return {
      status: 401,
      error: "Token Bearer inválido ou não autorizado.",
    };
  }

  return null;
}

type RouteContext = {
  params: Promise<{
    api_key: string;
    tab_name: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { api_key, tab_name } = await context.params;
  const startTime = Date.now();
  const endpointPath = new URL(request.url).pathname;

  try {
    const result = await getApiAndTab(api_key, tab_name);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { api, tab } = result;
    const tabConfig = {
      ...tab,
      allowGet: tab.allow_get,
      allowPost: tab.allow_post,
      allowPatch: tab.allow_patch,
      allowDelete: tab.allow_delete,
      authType: tab.auth_type,
      bearerToken: tab.bearer_token,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    if (!tabConfig.allowGet) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "GET",
        statusCode: 405,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json(
        { error: "Método GET não permitido para esta aba" },
        { status: 405 }
      );
    }

    const authError = checkAuth(request, tabConfig);
    if (authError) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "GET",
        statusCode: authError.status,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json({ error: authError.error }, { status: authError.status });
    }

    const rateLimit = await checkRateLimit(api.user_id);
    if (rateLimit) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "GET",
        statusCode: rateLimit.status,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json(
        { error: rateLimit.error },
        { status: rateLimit.status, headers: rateLimit.headers }
      );
    }

    const accessToken = await getGoogleAccessTokenByUserId(api.user_id);

    const data = await getSpreadsheetDataWithToken(accessToken, api.spreadsheet_id, tab.tab_name);

    const formattedData = sheetsToJson(data);

    const url = new URL(request.url);
    const searchParams = url.searchParams;
    let filteredData = formattedData;

    // 1) Filtros simples (compatíveis com a versão antiga)
    searchParams.forEach((value, key) => {
      if (key !== "limit" && key !== "offset" && key !== "where") {
        filteredData = filteredData.filter((item) =>
          String(item[key] ?? "")
            .toLowerCase()
            .includes(value.toLowerCase())
        );
      }
    });

    const where = searchParams.get("where");
    if (where) {
      const conditions = where
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      for (const cond of conditions) {
        const [field, op, rawValue] = cond.split(":");

        if (!field || !op) continue;

        filteredData = filteredData.filter((row: Record<string, unknown>) => {
          const value = row[field];

          switch (op) {
            case "eq":
              return String(value ?? "") === rawValue;
            case "contains":
              return String(value ?? "")
                .toLowerCase()
                .includes((rawValue ?? "").toLowerCase());
            case "gt":
              return Number(value) > Number(rawValue);
            case "gte":
              return Number(value) >= Number(rawValue);
            case "lt":
              return Number(value) < Number(rawValue);
            case "lte":
              return Number(value) <= Number(rawValue);
            case "in": {
              const list = (rawValue ?? "").split("|");
              return list.includes(String(value ?? ""));
            }
            default:
              return true;
          }
        });
      }
    }

    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    if (offset) {
      filteredData = filteredData.slice(parseInt(offset));
    }

    if (limit) {
      filteredData = filteredData.slice(0, parseInt(limit));
    }

    await logApiRequest({
      apiId: api.id,
      tabId: tab.id,
      method: "GET",
      statusCode: 200,
      responseTime: Date.now() - startTime,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
      endpoint: endpointPath,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      data: filteredData,
      count: filteredData.length,
      total: formattedData.length,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Erro no GET:", error);

    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { api_key, tab_name } = await context.params;
  const startTime = Date.now();
  const endpointPath = new URL(request.url).pathname;

  try {
    const result = await getApiAndTab(api_key, tab_name);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { api, tab } = result;
    const tabConfig = {
      ...tab,
      allowGet: tab.allow_get,
      allowPost: tab.allow_post,
      allowPatch: tab.allow_patch,
      allowDelete: tab.allow_delete,
      authType: tab.auth_type,
      bearerToken: tab.bearer_token,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    if (!tabConfig.allowPost) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "POST",
        statusCode: 405,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json(
        { error: "Método POST não permitido para esta aba" },
        { status: 405 }
      );
    }

    const authError = checkAuth(request, tabConfig);
    if (authError) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "POST",
        statusCode: authError.status,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json({ error: authError.error }, { status: authError.status });
    }

    const rateLimit = await checkRateLimit(api.user_id);
    if (rateLimit) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "POST",
        statusCode: rateLimit.status,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json(
        { error: rateLimit.error },
        { status: rateLimit.status, headers: rateLimit.headers }
      );
    }

    const body = await request.json();

    if (!body || Object.keys(body).length === 0) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "POST",
        statusCode: 400,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json({ error: "Body vazio ou inválido" }, { status: 400 });
    }

    const accessToken = await getGoogleAccessTokenByUserId(api.user_id);
    const headers = await getSpreadsheetHeadersWithToken(
      accessToken,
      api.spreadsheet_id,
      tab.tab_name
    );

    if (!headers || headers.length === 0) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "POST",
        statusCode: 400,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json(
        { error: "Planilha sem cabeçalhos. Adicione uma linha de cabeçalho primeiro." },
        { status: 400 }
      );
    }

    const values = headers.map((header: string) => {
      const value = body[header];
      return value !== undefined && value !== null ? String(value) : "";
    });

    await appendSpreadsheetRowWithToken(accessToken, api.spreadsheet_id, tab.tab_name, [values]);

    const supabase = await createClient();

    await supabase
      .from("api_tab")
      .update({ row_count: (tab.row_count ?? 0) + 1 })
      .eq("id", tab.id);

    await logApiRequest({
      apiId: api.id,
      tabId: tab.id,
      method: "POST",
      statusCode: 200,
      responseTime: Date.now() - startTime,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
      endpoint: endpointPath,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Registro criado com sucesso",
      data: body,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Erro no POST:", error);

    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { api_key, tab_name } = await context.params;
  const startTime = Date.now();
  const endpointPath = new URL(request.url).pathname;

  try {
    const result = await getApiAndTab(api_key, tab_name);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { api, tab } = result;
    const tabConfig = {
      ...tab,
      allowGet: tab.allow_get,
      allowPost: tab.allow_post,
      allowPatch: tab.allow_patch,
      allowDelete: tab.allow_delete,
      authType: tab.auth_type,
      bearerToken: tab.bearer_token,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    if (!tabConfig.allowPatch) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "PATCH",
        statusCode: 405,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json(
        { error: "Método PATCH não permitido para esta aba" },
        { status: 405 }
      );
    }

    const authError = checkAuth(request, tabConfig);
    if (authError) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "PATCH",
        statusCode: authError.status,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json({ error: authError.error }, { status: authError.status });
    }

    const rateLimit = await checkRateLimit(api.user_id);
    if (rateLimit) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "PATCH",
        statusCode: rateLimit.status,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json(
        { error: rateLimit.error },
        { status: rateLimit.status, headers: rateLimit.headers }
      );
    }

    const body = await request.json();
    const { _rowIndex, ...updateData } = body;

    if (!_rowIndex) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "PATCH",
        statusCode: 400,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json(
        { error: "Campo '_rowIndex' é obrigatório para atualizar" },
        { status: 400 }
      );
    }

    if (Object.keys(updateData).length === 0) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "PATCH",
        statusCode: 400,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json({ error: "Nenhum dado para atualizar" }, { status: 400 });
    }

    const accessToken = await getGoogleAccessTokenByUserId(api.user_id);
    const currentData = await getSpreadsheetDataWithToken(
      accessToken,
      api.spreadsheet_id,
      tab.tab_name
    );
    const headers = currentData[0];
    const currentRow = currentData[_rowIndex - 1];
    const values = headers.map((header: string, index: number) => {
      if (updateData[header] !== undefined) {
        return String(updateData[header]);
      }
      return currentRow[index] || "";
    });

    const range = `${tab.tab_name}!A${_rowIndex}:${String.fromCharCode(64 + headers.length)}${_rowIndex}`;
    await updateSpreadsheetRowWithToken(accessToken, api.spreadsheet_id, range, [values]);

    await logApiRequest({
      apiId: api.id,
      tabId: tab.id,
      method: "PATCH",
      statusCode: 200,
      responseTime: Date.now() - startTime,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
      endpoint: endpointPath,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Registro atualizado com sucesso",
      data: updateData,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Erro no PATCH:", error);

    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { api_key, tab_name } = await context.params;
  const startTime = Date.now();
  const endpointPath = new URL(request.url).pathname;

  try {
    const result = await getApiAndTab(api_key, tab_name);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { api, tab } = result;
    const tabConfig = {
      ...tab,
      allowGet: tab.allow_get,
      allowPost: tab.allow_post,
      allowPatch: tab.allow_patch,
      allowDelete: tab.allow_delete,
      authType: tab.auth_type,
      bearerToken: tab.bearer_token,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    if (!tabConfig.allowDelete) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "DELETE",
        statusCode: 405,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json(
        { error: "Método DELETE não permitido para esta aba" },
        { status: 405 }
      );
    }

    const authError = checkAuth(request, tabConfig);
    if (authError) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "DELETE",
        statusCode: authError.status,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json({ error: authError.error }, { status: authError.status });
    }

    const rateLimit = await checkRateLimit(api.user_id);
    if (rateLimit) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "DELETE",
        statusCode: rateLimit.status,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json(
        { error: rateLimit.error },
        { status: rateLimit.status, headers: rateLimit.headers }
      );
    }

    const url = new URL(request.url);
    const rowIndexParam = url.searchParams.get("_rowIndex");

    let rowIndex: number;

    if (rowIndexParam) {
      rowIndex = parseInt(rowIndexParam);
    } else {
      const body = await request.json().catch(() => ({}));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rowIndex = (body as any)._rowIndex;
    }

    if (!rowIndex || rowIndex < 2) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "DELETE",
        statusCode: 400,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json(
        { error: "Campo '_rowIndex' é obrigatório e deve ser >= 2" },
        { status: 400 }
      );
    }

    const accessToken = await getGoogleAccessTokenByUserId(api.user_id);
    const metadata = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${api.spreadsheet_id}?fields=sheets(properties)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    ).then((r) => r.json());

    const sheet = metadata.sheets.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) =>
        s.properties.title.toLowerCase().replace(/\s+/g, "_") ===
        tab.tab_name.toLowerCase().replace(/\s+/g, "_")
    );

    if (!sheet) {
      await logApiRequest({
        apiId: api.id,
        tabId: tab.id,
        method: "DELETE",
        statusCode: 404,
        responseTime: Date.now() - startTime,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
        endpoint: endpointPath,
      }).catch(() => {});

      return NextResponse.json({ error: "Aba não encontrada na planilha" }, { status: 404 });
    }

    await deleteSpreadsheetRowWithToken(
      accessToken,
      api.spreadsheet_id,
      sheet.properties.sheetId,
      rowIndex - 1
    );

    const supabase = await createClient();

    await supabase
      .from("api_tab")
      .update({ row_count: Math.max(0, (tab.row_count ?? 0) - 1) })
      .eq("id", tab.id);

    await logApiRequest({
      apiId: api.id,
      tabId: tab.id,
      method: "DELETE",
      statusCode: 200,
      responseTime: Date.now() - startTime,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
      endpoint: endpointPath,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Registro deletado com sucesso",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Erro no DELETE:", error);

    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
