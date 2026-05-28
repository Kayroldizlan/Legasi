import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import {
  AUTH_DEFAULT_REDIRECT,
  AUTH_LOGIN_PATH,
  isAuthGuestRoute,
  isPrivateRoute,
} from "@/lib/auth/routes";

/**
 * Refresh the Supabase auth session on every request and enforce route rules.
 *
 * - Private routes → /login when unauthenticated
 * - / + auth pages → /directory when authenticated
 * - Session cookies refreshed for PWA / mobile persistence
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (isPrivateRoute(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = AUTH_LOGIN_PATH;
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      const fallback = request.nextUrl.clone();
      fallback.pathname = AUTH_DEFAULT_REDIRECT;
      return NextResponse.redirect(fallback);
    }
  }

  if (user && (pathname === "/" || isAuthGuestRoute(pathname))) {
    const destination = request.nextUrl.clone();
    destination.pathname = AUTH_DEFAULT_REDIRECT;
    destination.search = "";
    return NextResponse.redirect(destination);
  }

  return supabaseResponse;
}
