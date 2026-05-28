"use client";

import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { createClient } from "@/lib/supabase/client";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";

import type { NotificationRow } from "@/types/database";

export function NotificationBell() {
  const profile = useAuthStore((s) => s.profile);
  const { items, unreadCount, setAll, prepend, markAllRead } =
    useNotificationStore();
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  // Click-outside
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  React.useEffect(() => {
    if (!profile) return;
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setAll(data);
    })();

    const channel = supabase
      .channel(`notifications:${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => prepend(payload.new as NotificationRow),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, setAll, prepend]);

  const markAll = async () => {
    if (!profile) return;
    const supabase = createClient();
    markAllRead();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", profile.id)
      .eq("is_read", false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-ink-muted hover:text-ink hover:bg-surface-subtle"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1rem)] rounded-2xl border border-border bg-surface shadow-elevated animate-fade-in overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            <button
              onClick={markAll}
              className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
            >
              <CheckCheck className="h-3 w-3" /> Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-10 text-center text-sm text-ink-subtle">
                You're all caught up
              </div>
            ) : (
              items.slice(0, 12).map((n) => (
                <Link
                  key={n.id}
                  href={n.link || "/notifications"}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex flex-col gap-1 border-b border-border px-4 py-3 text-sm hover:bg-surface-subtle",
                    !n.is_read && "bg-brand-50/40 dark:bg-brand-950/20",
                  )}
                >
                  <span className="font-medium text-ink">{n.title}</span>
                  {n.body && (
                    <span className="text-xs text-ink-muted line-clamp-2">
                      {n.body}
                    </span>
                  )}
                  <span className="text-[10px] text-ink-subtle">
                    {formatRelativeTime(n.created_at)}
                  </span>
                </Link>
              ))
            )}
          </div>
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-border bg-surface-muted px-4 py-3 text-center text-xs font-medium text-brand-600 hover:bg-surface-subtle"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
