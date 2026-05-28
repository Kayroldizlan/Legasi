import toast from "react-hot-toast";

import { TOAST_NOTIFICATION_TYPES } from "@/lib/notifications/constants";

import type { NotificationRow } from "@/types/database";

export function showNotificationToast(notification: NotificationRow) {
  if (!TOAST_NOTIFICATION_TYPES.has(notification.type)) return;

  const text = notification.message
    ? `${notification.title} — ${notification.message}`
    : notification.title;

  toast(text, {
    icon: "🔔",
    className:
      "!bg-white !text-ink !border !border-zinc-200 !shadow-elevated !rounded-xl",
  });
}
