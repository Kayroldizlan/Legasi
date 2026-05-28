"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Shared browser Supabase client (singleton).
 *
 * Import `createClient()` wherever browser-side Supabase is needed
 * (realtime, auth listeners, chat). Do not call `createBrowserClient`
 * directly and do not wrap in `useMemo` — this module caches one instance.
 */
let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return browserClient;
}

/** Alias for readability in modules that only need the shared instance. */
export const getSupabaseBrowserClient = createClient;
