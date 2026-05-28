"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (singleton).
 *
 * Creating a new client on every call causes multiple auth lock
 * contenders and can hang `getSession()` / `.update()` indefinitely
 * when AuthProvider, settings form, and other components each spin up
 * their own instance.
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
