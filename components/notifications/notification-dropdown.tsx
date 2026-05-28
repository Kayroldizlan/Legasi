"use client";

import { CheckCheck } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { NotificationCard } from "@/components/notifications/notification-card";
import { markAllNotificationsReadAction } from "@/lib/actions/notifications";
import { groupNotifications } from "@/lib/notifications/group-notifications";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notification-store";

export function NotificationDropdown({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const items = useNotificationStore((s) => s.items);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  const grouped = React.useMemo(
    () => groupNotifications(items.slice(0, 12).map((item) => ({ ...item, actor: null }))),
    [items],
  );

  const markAll = async () => {
    markAllRead();
    await markAllNotificationsReadAction();
  };

  if (!open) return null;

  return (
    <div className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-[1.25rem] border border-zinc-200 bg-white shadow-elevated animate-fade-in">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <p className="text-sm font-semibold text-ink">Notifications</p>
        <button
          type="button"
          onClick={markAll}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Mark all read
        </button>
      </div>

      <div className="max-h-[28rem] overflow-y-auto">
        {grouped.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-400">
            You&apos;re all caught up
          </div>
        ) : (
          grouped.map(({ notification, isGrouped, items: groupedItems }) => (
            <NotificationCard
              key={notification.id}
              notification={{
                ...notification,
                message:
                  isGrouped && groupedItems.length > 1
                    ? `${groupedItems.length} similar notifications`
                    : notification.message,
              }}
              compact
              onNavigate={onClose}
            />
          ))
        )}
      </div>

      <Link
        href="/notifications"
        onClick={onClose}
        className={cn(
          "block border-t border-zinc-100 bg-zinc-50 px-4 py-3 text-center text-xs font-semibold text-brand-600 transition hover:bg-zinc-100",
        )}
      >
        View all notifications
      </Link>
    </div>
  );
}
