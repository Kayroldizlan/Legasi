"use client";

import * as React from "react";
import toast from "react-hot-toast";

import { NotificationCard } from "@/components/notifications/notification-card";
import {
  deleteNotificationAction,
  fetchNotificationsAction,
  markAllNotificationsReadAction,
} from "@/lib/actions/notifications";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_MAP,
} from "@/lib/notifications/constants";
import { groupNotifications } from "@/lib/notifications/group-notifications";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notification-store";

import type { NotificationWithActor } from "@/types/database";

interface NotificationCenterProps {
  initial: NotificationWithActor[];
  initialTotal: number;
}

export function NotificationCenter({
  initial,
  initialTotal,
}: NotificationCenterProps) {
  const [items, setItems] = React.useState(initial);
  const [total, setTotal] = React.useState(initialTotal);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [filter, setFilter] = React.useState<
    "all" | "unread" | (typeof NOTIFICATION_CATEGORIES)[number]["id"]
  >("all");
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const removeFromStore = useNotificationStore((s) => s.remove);

  const filtered = React.useMemo(() => {
    return items.filter((item) => {
      if (filter === "unread") return !item.is_read;
      if (filter === "all") return true;
      return NOTIFICATION_CATEGORY_MAP[item.type] === filter;
    });
  }, [items, filter]);

  const grouped = React.useMemo(
    () => groupNotifications(filtered),
    [filtered],
  );

  const loadMore = async () => {
    setLoading(true);
    const nextPage = page + 1;
    const result = await fetchNotificationsAction({ page: nextPage });
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setItems((prev) => [...prev, ...result.data.data]);
    setTotal(result.data.total);
    setPage(nextPage);
  };

  const handleMarkAll = async () => {
    markAllRead();
    setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
    const result = await markAllNotificationsReadAction();
    if (!result.success) toast.error(result.error);
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    removeFromStore(id);
    const result = await deleteNotificationAction(id);
    if (!result.success) toast.error(result.error);
  };

  const hasMore = items.length < total;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
            ...NOTIFICATION_CATEGORIES.filter((c) => c.id !== "all"),
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setFilter(tab.id as typeof filter)
              }
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                filter === tab.id
                  ? "bg-brand-600 text-white shadow-[0_8px_20px_rgb(239_68_68/0.18)]"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleMarkAll}
          className="text-xs font-medium text-brand-600 hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="overflow-hidden rounded-[1.25rem] border border-zinc-200 bg-white shadow-soft">
        {grouped.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-400">
            No notifications in this filter.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {grouped.map(({ notification, isGrouped, items: groupedItems }) => (
              <NotificationCard
                key={notification.id}
                notification={{
                  ...notification,
                  message:
                    isGrouped && groupedItems.length > 1
                      ? `${groupedItems.length} similar notifications grouped`
                      : notification.message,
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {hasMore && filter === "all" && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-medium text-ink transition hover:bg-zinc-50 disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}

      <p className="text-center text-xs text-zinc-400">
        Showing {filtered.length} of {total} notifications
      </p>
    </div>
  );
}
