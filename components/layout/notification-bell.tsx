"use client";

import { Bell } from "lucide-react";
import * as React from "react";

import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";

export function NotificationBell() {
  const profile = useAuthStore((s) => s.profile);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!profile) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-ink",
          open && "border-brand-200 bg-brand-50 text-brand-600",
        )}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-50" />
            <span className="relative inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      <NotificationDropdown open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
