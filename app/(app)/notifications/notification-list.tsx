"use client";

import { Bell, CheckCheck, MessageSquare, UserPlus, UsersRound } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

import type { NotificationRow, NotificationType } from "@/types/database";

const ICONS: Record<NotificationType, typeof Bell> = {
  connection_request: UserPlus,
  connection_accepted: UsersRound,
  new_message: MessageSquare,
  profile_view: UsersRound,
  mention: Bell,
  system: Bell,
};

export function NotificationList({ initial }: { initial: NotificationRow[] }) {
  const [items, setItems] = React.useState(initial);
  const profile = useAuthStore((s) => s.profile);

  const markAllRead = async () => {
    if (!profile) return;
    const supabase = createClient();
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase
      .from("notifications")
      .update({ is_read: true } as never)
      .eq("user_id", profile.id)
      .eq("is_read", false);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-ink-muted">{items.length} total</p>
        <button
          onClick={markAllRead}
          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
        >
          <CheckCheck className="h-3 w-3" /> Mark all as read
        </button>
      </div>
      <ul className="divide-y divide-border">
        {items.map((n) => {
          const Icon = ICONS[n.type] ?? Bell;
          return (
            <li key={n.id}>
              <Link
                href={n.link || "#"}
                className={cn(
                  "flex items-start gap-3 py-3 px-1",
                  !n.is_read && "bg-brand-50/40 dark:bg-brand-950/20 rounded-xl px-3",
                )}
              >
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{n.title}</p>
                  {n.body && (
                    <p className="text-xs text-ink-muted mt-0.5">{n.body}</p>
                  )}
                  <p className="text-[10px] text-ink-subtle mt-1">
                    {formatRelativeTime(n.created_at)}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
