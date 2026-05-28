import type { SupabaseClient } from "@supabase/supabase-js";

import { NOTIFICATIONS_PAGE_SIZE } from "@/lib/notifications/constants";

import type {
  NotificationPreferences,
  NotificationRow,
  NotificationType,
  NotificationWithActor,
  Profile,
} from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = SupabaseClient<any, any, any>;

export interface ListNotificationsOptions {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}

export async function listNotifications(
  supabase: SB,
  userId: string,
  options: ListNotificationsOptions = {},
): Promise<{ data: NotificationWithActor[]; total: number }> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(
    50,
    Math.max(1, options.pageSize ?? NOTIFICATIONS_PAGE_SIZE),
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("notifications")
    .select("*, actor:actor_id(id, username, full_name, avatar_url)", {
      count: "exact",
    })
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (options.unreadOnly) query = query.eq("is_read", false);
  if (options.type) query = query.eq("type", options.type);

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  return {
    data: normalizeNotificationsWithActor(data),
    total: count ?? 0,
  };
}

export async function getUnreadNotificationCount(
  supabase: SB,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
  return count ?? 0;
}

export async function getNotificationPreferences(
  supabase: SB,
  userId: string,
): Promise<NotificationPreferences | null> {
  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return (data as NotificationPreferences | null) ?? null;
}

function normalizeNotificationsWithActor(
  rows: unknown,
): NotificationWithActor[] {
  return ((rows ?? []) as Array<
    NotificationRow & { actor: Profile | Profile[] | null }
  >).map((row) => {
    const actor = Array.isArray(row.actor) ? row.actor[0] : row.actor;
    return {
      ...row,
      actor: actor ?? null,
    };
  });
}
