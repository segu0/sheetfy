"use server";

import { getSpreadsheetDataWithToken } from "./get-spreadsheet-data-with-token";

export async function getSpreadsheetHeadersWithToken(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string
): Promise<string[]> {
  const data = await getSpreadsheetDataWithToken(accessToken, spreadsheetId, `${sheetName}!A1:ZZ1`);

  return (data[0] || []) as string[];
}
