"use server";

import { getGoogleAccessToken } from "./get-google-access-token";

export async function getSpreadsheetMetadata(spreadsheetId: string) {
  const accessToken = await getGoogleAccessToken();

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets(properties(sheetId,title,index,gridProperties))`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || "Falha ao buscar metadados da planilha");
  }

  const data = await response.json();

  return {
    title: data.properties.title,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sheets: data.sheets.map((sheet: any) => ({
      id: sheet.properties.sheetId,
      title: sheet.properties.title,
      index: sheet.properties.index,
      rowCount: sheet.properties.gridProperties?.rowCount || 0,
      columnCount: sheet.properties.gridProperties?.columnCount || 0,
    })),
  };
}
