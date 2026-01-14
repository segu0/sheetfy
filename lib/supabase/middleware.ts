import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authRoutes = ["/dashboard", "/planos", "/projetos"];
  const redirectWhenLogged = "/dashboard";
  const currentPath = request.nextUrl.pathname;

  const requiresAuth = (path: string) =>
    authRoutes.some((authRoute) => path === authRoute || path.startsWith(`${authRoute}/`));

  if (user && currentPath === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = redirectWhenLogged;
    return NextResponse.redirect(url);
  }

  if (!user && requiresAuth(currentPath)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const hasOnboarded = user?.user_metadata?.has_onboarded;
  if (user && !hasOnboarded && currentPath !== "/onboarding") {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  if (user && hasOnboarded && currentPath === "/onboarding") {
    const url = request.nextUrl.clone();
    url.pathname = redirectWhenLogged;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
