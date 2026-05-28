"use server";

import { createClient } from "@/lib/supabase/server";
import {
  mapAuthError,
  mapPostgrestError,
  mapStorageError,
  mapUnknownError,
} from "@/lib/server/action-errors";
import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@/lib/server/action-result";
import {
  normalizeProfileInput,
  normalizeSocialLinksInput,
  profileSchema,
  socialLinksSchema,
  type ProfileInput,
  type SocialLinksInput,
} from "@/lib/validations";

const IMAGE_FIELDS = ["avatar_url", "cover_url"] as const;
export type ProfileImageField = (typeof IMAGE_FIELDS)[number];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function isProfileImageField(value: unknown): value is ProfileImageField {
  return (
    typeof value === "string" &&
    (IMAGE_FIELDS as readonly string[]).includes(value)
  );
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null, error: mapAuthError(error) };
  }

  return { supabase, user, error: null };
}

/** Persist profile text fields (cookie auth, server-side Supabase). */
export async function updateProfileAction(
  input: ProfileInput,
): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Invalid profile data.";
    return actionFailure(message);
  }

  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  const normalized = normalizeProfileInput(parsed.data);

  const { error } = await supabase
    .from("profiles")
    .update(normalized as never)
    .eq("id", user.id);

  if (error) {
    return actionFailure(mapPostgrestError(error, "profile"));
  }

  return actionSuccess(undefined);
}

/** Upsert social links for the signed-in user. */
export async function updateSocialLinksAction(
  input: SocialLinksInput,
): Promise<ActionResult> {
  const parsed = socialLinksSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Invalid social links.";
    return actionFailure(message);
  }

  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  const payload = normalizeSocialLinksInput(parsed.data, user.id);

  const { error } = await supabase
    .from("social_links")
    .upsert(payload as never, { onConflict: "profile_id" });

  if (error) {
    return actionFailure(mapPostgrestError(error, "socials"));
  }

  return actionSuccess(undefined);
}

/** Upload a compressed image and persist its public URL on the profile. */
export async function uploadProfileImageAction(
  formData: FormData,
): Promise<ActionResult<{ publicUrl: string; field: ProfileImageField }>> {
  const field = formData.get("field");
  const file = formData.get("file");

  if (!isProfileImageField(field)) {
    return actionFailure("Invalid upload target.");
  }

  if (!(file instanceof File) || file.size === 0) {
    return actionFailure("No image file provided.");
  }

  if (!file.type.startsWith("image/")) {
    return actionFailure("File must be an image.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return actionFailure("Image is too large. Try a smaller file.");
  }

  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  const bucket = field === "avatar_url" ? "avatars" : "covers";
  const path = `${user.id}/${field}-${Date.now()}.webp`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      upsert: true,
      cacheControl: "3600",
      contentType: file.type || "image/webp",
    });

  if (uploadError) {
    return actionFailure(mapStorageError(uploadError));
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  const { error: dbError } = await supabase
    .from("profiles")
    .update({ [field]: publicUrl } as never)
    .eq("id", user.id);

  if (dbError) {
    return actionFailure(mapPostgrestError(dbError, "profile"));
  }

  return actionSuccess({ publicUrl, field });
}

/** Clear avatar or cover URL on the signed-in user's profile. */
export async function removeProfileImageAction(
  field: ProfileImageField,
): Promise<ActionResult> {
  if (!isProfileImageField(field)) {
    return actionFailure("Invalid image field.");
  }

  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  const { error } = await supabase
    .from("profiles")
    .update({ [field]: null } as never)
    .eq("id", user.id);

  if (error) {
    return actionFailure(mapPostgrestError(error, "profile"));
  }

  return actionSuccess(undefined);
}

/** Keep online presence fresh without browser-side profile mutations. */
export async function updatePresenceAction(
  isOnline: boolean,
): Promise<ActionResult> {
  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  const payload = isOnline
    ? { is_online: true, last_seen_at: new Date().toISOString() }
    : { is_online: false };

  const { error } = await supabase
    .from("profiles")
    .update(payload as never)
    .eq("id", user.id);

  if (error) {
    return actionFailure(mapUnknownError());
  }

  return actionSuccess(undefined);
}
