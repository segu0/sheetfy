"use server";

import { createClient } from "@/lib/supabase/server";

export async function getGoogleAccessToken() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Usuário não autenticado");
  }

  const { data: tokenRow, error: tokenError } = await supabase
    .from("user_google_tokens")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "google")
    .maybeSingle();

  if (tokenError || !tokenRow) {
    throw new Error("Nenhum token Google salvo. Faça login novamente concedendo acesso.");
  }

  const now = new Date();
  const expiresAt = tokenRow.expires_at ? new Date(tokenRow.expires_at) : null;

  // Se ainda está válido, usa direto
  if (expiresAt && expiresAt > now) {
    return tokenRow.access_token as string;
  }

  // Se não temos refresh_token, não tem o que fazer
  if (!tokenRow.refresh_token) {
    throw new Error("Token expirado e sem refresh_token. Faça login novamente.");
  }

  // --- RENOVAÇÃO DO TOKEN ---
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    refresh_token: tokenRow.refresh_token,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("Erro ao renovar token do Google:", err);
    throw new Error("Não foi possível renovar o token do Google. Faça login novamente.");
  }

  const json = (await res.json()) as {
    access_token: string;
    expires_in?: number;
    scope?: string;
    token_type?: string;
  };

  const newAccessToken = json.access_token;
  const newExpiresAt = json.expires_in
    ? new Date(Date.now() + json.expires_in * 1000).toISOString()
    : null;

  // Atualiza no banco
  const { error: updateError } = await supabase
    .from("user_google_tokens")
    .update({
      access_token: newAccessToken,
      expires_at: newExpiresAt,
      scope: json.scope ?? tokenRow.scope,
      token_type: json.token_type ?? tokenRow.token_type,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tokenRow.id);

  if (updateError) {
    console.error("Erro ao atualizar token do Google no banco:", updateError);
  }

  return newAccessToken;
}
