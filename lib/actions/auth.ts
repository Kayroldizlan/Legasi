"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/server/action-errors";
import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@/lib/server/action-result";

/** Clear the Supabase session cookies on the server (required for App Router sign-out). */
export async function signOutAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return actionFailure(mapAuthError(error));
  }

  revalidatePath("/", "layout");
  return actionSuccess(undefined);
}
