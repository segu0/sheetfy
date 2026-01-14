"use server";

import { getGoogleAccessToken } from "./get-google-access-token";

export interface SpreadsheetOwner {
  displayName?: string;
  emailAddress?: string;
}

export interface Spreadsheet {
  id: string;
  name: string;
  webViewLink: string;
  createdTime: string;
  modifiedTime: string;
  owners?: SpreadsheetOwner[];
}

export async function listUserSpreadsheets(): Promise<Spreadsheet[]> {
  const accessToken = await getGoogleAccessToken();

  const params = new URLSearchParams({
    q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
    fields:
      "files(id, name, createdTime, modifiedTime, webViewLink, owners(displayName,emailAddress))",
    orderBy: "modifiedTime desc",
    pageSize: "50",
  });

  const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || "Falha ao buscar planilhas");
  }

  const data = await response.json();
  return (data.files || []) as Spreadsheet[];
}
