"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client.
 * Safe to import in Client Components only.
 *
 * Note: we intentionally don't pass a `Database` generic — we rely on
 * the hand-written types in `@/types/database` and cast at call sites.
 * This keeps the surface area simple and avoids version-coupled type
 * drift with `@supabase/ssr`.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
