/** Default landing route after sign-in or when skipping the public home page. */
export const AUTH_DEFAULT_REDIRECT = "/directory";

export const AUTH_LOGIN_PATH = "/login";

/** Auth pages that signed-in users should not see. */
export const AUTH_GUEST_ONLY_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
] as const;

/** Routes that require an authenticated Supabase session. */
export const PRIVATE_ROUTE_PREFIXES = [
  "/dashboard",
  "/messages",
  "/notifications",
  "/connections",
  "/settings",
  "/admin",
] as const;

export function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isAuthGuestRoute(pathname: string): boolean {
  return AUTH_GUEST_ONLY_ROUTES.includes(
    pathname as (typeof AUTH_GUEST_ONLY_ROUTES)[number],
  );
}

/** Restrict post-login redirects to same-origin app paths. */
export function sanitizeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return AUTH_DEFAULT_REDIRECT;
  }
  return next;
}
