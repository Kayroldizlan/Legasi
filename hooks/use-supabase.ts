"use client";

import { createClient } from "@/lib/supabase/client";

/** Returns the shared browser Supabase singleton (realtime, chat, auth). */
export function useSupabase() {
  return createClient();
}
