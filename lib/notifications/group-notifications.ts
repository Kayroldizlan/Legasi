import { NOTIFICATION_GROUPING_TYPES } from "@/lib/notifications/constants";

import type { NotificationWithActor } from "@/types/database";

export interface GroupedNotification {
  id: string;
  items: NotificationWithActor[];
  notification: NotificationWithActor;
  isGrouped: boolean;
}

function groupKey(notification: NotificationWithActor): string {
  const metaKey = notification.metadata?.group_key;
  if (typeof metaKey === "string" && metaKey.length > 0) {
    return `${notification.type}:${metaKey}`;
  }
  return notification.id;
}

/** Collapse similar unread notifications for cleaner UI (e.g. profile views). */
export function groupNotifications(
  items: NotificationWithActor[],
): GroupedNotification[] {
  const groups = new Map<string, NotificationWithActor[]>();

  for (const item of items) {
    const key =
      NOTIFICATION_GROUPING_TYPES.has(item.type) && !item.is_read
        ? groupKey(item)
        : item.id;
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }

  return [...groups.values()].map((bucket) => {
    const sorted = [...bucket].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const primary = sorted[0]!;
    return {
      id: primary.id,
      items: sorted,
      notification: primary,
      isGrouped: sorted.length > 1,
    };
  });
}
