import type { AuthError, PostgrestError } from "@supabase/supabase-js";

const GENERIC_ERROR = "Something went wrong. Please try again.";

export function mapAuthError(error: AuthError | null): string {
  if (!error) {
    return "Your session has expired. Please sign in again.";
  }
  if (/jwt|session|token|expired|invalid/i.test(error.message)) {
    return "Your session has expired. Please sign in again.";
  }
  return "You must be signed in to continue.";
}

export function mapPostgrestError(
  error: PostgrestError,
  context: "profile" | "socials" = "profile",
): string {
  if (
    error.code === "23505" ||
    /duplicate key|unique constraint/i.test(error.message)
  ) {
    return context === "profile"
      ? "That username is already taken."
      : "Could not save social links due to a conflict.";
  }

  if (error.code === "42501" || /permission|policy|row-level/i.test(error.message)) {
    return "You don't have permission to make this change.";
  }

  return GENERIC_ERROR;
}

export function mapStorageError(error: { message: string }): string {
  if (/payload too large|entity too large/i.test(error.message)) {
    return "Image is too large. Try a smaller file.";
  }
  if (/not found|bucket/i.test(error.message)) {
    return "Upload storage is unavailable. Please try again later.";
  }
  return GENERIC_ERROR;
}

export function mapUnknownError(): string {
  return GENERIC_ERROR;
}
