"use server";

import { createClient } from "@/lib/supabase/server";
import {
  normalizeProfileInput,
  profileSchema,
  type ProfileInput,
} from "@/lib/validations";

export type UpdateProfileResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Persist profile edits using the server Supabase client (cookie auth).
 * Avoids browser-side auth lock / hung fetch issues on client updates.
 */
export async function updateProfileAction(
  input: ProfileInput,
): Promise<UpdateProfileResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Invalid profile data.";
    return { success: false, error: message };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Not authenticated. Please sign in again.",
    };
  }

  const normalized = normalizeProfileInput(parsed.data);

  const { error } = await supabase
    .from("profiles")
    .update(normalized as never)
    .eq("id", user.id);

  if (error) {
    if (
      error.code === "23505" ||
      /duplicate key|unique constraint/i.test(error.message)
    ) {
      return { success: false, error: "That username is already taken." };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}
