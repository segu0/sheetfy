"use server";

import { createClient } from "@/lib/supabase/server";
import { refreshGoogleToken } from "./refresh-google-token";

export async function getGoogleAccessTokenByUserId(userId: string) {
  const supabase = await createClient();

  const { data: tokenRow, error } = await supabase
    .from("user_google_tokens")
    .select("id, access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .eq("provider", "google")
    .single();

  if (error || !tokenRow?.access_token) {
    console.error("Erro ao buscar token do Google:", error);
    throw new Error("Token do Google não encontrado para este usuário.");
  }

  const now = new Date();
  const isExpired = tokenRow.expires_at && new Date(tokenRow.expires_at).getTime() < now.getTime();

  if (isExpired && tokenRow.refresh_token) {
    try {
      const newToken = await refreshGoogleToken(tokenRow.refresh_token);

      const newExpiresAt = new Date(Date.now() + newToken.expires_in * 1000).toISOString();

      const { error: updateError } = await supabase
        .from("user_google_tokens")
        .update({
          access_token: newToken.access_token,
          expires_at: newExpiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tokenRow.id);

      if (updateError) {
        console.error("Erro ao atualizar token do Google no banco:", updateError);
      }

      return newToken.access_token;
    } catch (err) {
      console.error("Erro ao renovar token:", err);
      throw new Error("Token expirado.");
    }
  }

  return tokenRow.access_token;
}
