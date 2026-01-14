"use server";

type SpreadsheetValues = string[][];

export async function getSpreadsheetDataWithToken(
  accessToken: string,
  spreadsheetId: string,
  range: string = "A1:Z1000"
): Promise<SpreadsheetValues> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message || "Falha ao ler planilha");
  }

  const data = await res.json();
  return (data.values || []) as SpreadsheetValues;
}
