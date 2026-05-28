"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Shared browser Supabase client (singleton).
 *
 * Session persistence + auto-refresh keep users signed in across refresh,
 * browser reopen, and installed PWA. Cookie sync is handled by middleware
 * on the server; this client mirrors the session in the browser.
 */
let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );

  return browserClient;
}

/** Alias for readability in modules that only need the shared instance. */
export const getSupabaseBrowserClient = createClient;
