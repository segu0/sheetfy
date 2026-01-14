import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const code = request.nextUrl.searchParams.get("code") ?? "";
  const redirectWhenLogged = "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !session || !session.user) {
    console.error("Erro ao trocar código por sessão:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = session.user;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providerToken = (session as any).provider_token as string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providerRefreshToken = (session as any).provider_refresh_token as string | null;
  const expiresAtSeconds = session.expires_at ?? null;

  if (providerToken) {
    const expiresAtIso = expiresAtSeconds ? new Date(expiresAtSeconds * 1000).toISOString() : null;

    const { error: upsertError } = await supabase.from("user_google_tokens").upsert(
      {
        user_id: user.id,
        provider: "google",
        access_token: providerToken,
        refresh_token: providerRefreshToken,
        expires_at: expiresAtIso,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,provider",
      }
    );

    if (upsertError) {
      console.error("Erro ao salvar tokens do Google:", upsertError);
    }
  } else {
    console.warn("Nenhum provider_token retornado na sessão do Supabase");
  }

  const hasOnboarded = user.user_metadata?.has_onboarded;

  if (!hasOnboarded) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.redirect(new URL(redirectWhenLogged, request.url));
}
