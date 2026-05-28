"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_NOTIFICATION_TYPE_SETTINGS,
  NOTIFICATIONS_PAGE_SIZE,
} from "@/lib/notifications/constants";
import { mapAuthError, mapPostgrestError } from "@/lib/server/action-errors";
import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@/lib/server/action-result";
import { listNotifications } from "@/services/notifications";

import type {
  NotificationPreferences,
  NotificationRow,
  NotificationType,
  NotificationWithActor,
} from "@/types/database";

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

export async function markNotificationReadAction(
  notificationId: string,
): Promise<ActionResult> {
  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true } as never)
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) return actionFailure(mapPostgrestError(error, "profile"));
  revalidatePath("/notifications");
  return actionSuccess(undefined);
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true } as never)
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return actionFailure(mapPostgrestError(error, "profile"));
  revalidatePath("/notifications");
  return actionSuccess(undefined);
}

export async function deleteNotificationAction(
  notificationId: string,
): Promise<ActionResult> {
  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) return actionFailure(mapPostgrestError(error, "profile"));
  revalidatePath("/notifications");
  return actionSuccess(undefined);
}

export async function fetchNotificationsAction(options?: {
  page?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}): Promise<ActionResult<{ data: NotificationWithActor[]; total: number }>> {
  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  try {
    const result = await listNotifications(supabase, user.id, {
      page: options?.page ?? 1,
      pageSize: NOTIFICATIONS_PAGE_SIZE,
      unreadOnly: options?.unreadOnly,
      type: options?.type,
    });
    return actionSuccess(result);
  } catch (error) {
    return actionFailure(
      error instanceof Error ? error.message : "Could not load notifications.",
    );
  }
}

export async function recordProfileViewAction(
  profileId: string,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return actionSuccess(undefined);
  if (user.id === profileId) return actionSuccess(undefined);

  const { data: viewer } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase.rpc("create_notification", {
    p_user_id: profileId,
    p_actor_id: user.id,
    p_type: "profile_view",
    p_title: "Profile view",
    p_message: "Someone viewed your profile",
    p_link: viewer?.username ? `/u/${viewer.username}` : "/directory",
    p_image_url: viewer?.avatar_url ?? null,
    p_metadata: {
      group_key: `profile:${profileId}`,
      actor_count: 1,
      actor_ids: [user.id],
    },
  });

  if (error) return actionFailure(mapPostgrestError(error, "profile"));
  return actionSuccess(undefined);
}

export async function updateNotificationPreferencesAction(input: {
  typeSettings?: Partial<Record<NotificationType, boolean>>;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  soundEnabled?: boolean;
}): Promise<ActionResult<NotificationPreferences>> {
  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  const existing = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const current = (existing.data as NotificationPreferences | null)?.type_settings ?? {};
  const typeSettings = {
    ...DEFAULT_NOTIFICATION_TYPE_SETTINGS,
    ...current,
    ...input.typeSettings,
  };

  const payload = {
    user_id: user.id,
    type_settings: typeSettings,
    email_enabled: input.emailEnabled ?? existing.data?.email_enabled ?? true,
    push_enabled: input.pushEnabled ?? existing.data?.push_enabled ?? false,
    sound_enabled: input.soundEnabled ?? existing.data?.sound_enabled ?? true,
  };

  const { data, error } = await supabase
    .from("notification_preferences")
    .upsert(payload as never, { onConflict: "user_id" })
    .select()
    .single();

  if (error) return actionFailure(mapPostgrestError(error, "profile"));
  revalidatePath("/settings");
  return actionSuccess(data as NotificationPreferences);
}

export async function getNotificationPreferencesAction(): Promise<
  ActionResult<NotificationPreferences>
> {
  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (data) return actionSuccess(data as NotificationPreferences);

  return actionSuccess({
    user_id: user.id,
    type_settings: DEFAULT_NOTIFICATION_TYPE_SETTINGS,
    email_enabled: true,
    push_enabled: false,
    sound_enabled: true,
    updated_at: new Date().toISOString(),
  });
}

/** Admin/system helper for future server-side alerts. */
export async function createSystemNotificationAction(input: {
  userId: string;
  title: string;
  message?: string;
  link?: string;
  type?: NotificationType;
}): Promise<ActionResult<NotificationRow>> {
  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return actionFailure("You don't have permission to create system notifications.");
  }

  const { data, error } = await supabase.rpc("create_notification", {
    p_user_id: input.userId,
    p_actor_id: user.id,
    p_type: input.type ?? "admin_notice",
    p_title: input.title,
    p_message: input.message ?? null,
    p_link: input.link ?? "/notifications",
    p_image_url: null,
    p_metadata: { source: "admin" },
  });

  if (error) return actionFailure(mapPostgrestError(error, "profile"));
  return actionSuccess(data as NotificationRow);
}
