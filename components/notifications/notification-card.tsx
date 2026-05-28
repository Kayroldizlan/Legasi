"use client";

import {
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  UserPlus,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/ui";
import { markNotificationReadAction } from "@/lib/actions/notifications";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useNotificationStore } from "@/store/notification-store";

import type { NotificationType, NotificationWithActor } from "@/types/database";

const ICONS: Partial<Record<NotificationType, typeof Bell>> = {
  connection_request: UserPlus,
  connection_accepted: UsersRound,
  new_follower: UsersRound,
  profile_view: UsersRound,
  new_message: MessageSquare,
  mention: MessageSquare,
  reply: MessageSquare,
  community_invite: Sparkles,
  community_event: CalendarDays,
  community_announcement: Sparkles,
  business_inquiry: Briefcase,
  partnership_request: Building2,
  verification_approved: Sparkles,
  admin_notice: Bell,
  security_alert: ShieldAlert,
  system: Bell,
};

interface NotificationCardProps {
  notification: NotificationWithActor;
  compact?: boolean;
  onNavigate?: () => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function NotificationCard({
  notification,
  compact = false,
  onNavigate,
  onDelete,
  className,
}: NotificationCardProps) {
  const Icon = ICONS[notification.type] ?? Bell;
  const href = notification.link || "/notifications";
  const markRead = useNotificationStore((s) => s.markRead);

  const handleClick = async () => {
    if (!notification.is_read) {
      markRead(notification.id);
      await markNotificationReadAction(notification.id);
    }
    onNavigate?.();
  };

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-2xl border border-transparent px-3 py-3 transition hover:border-zinc-200 hover:bg-zinc-50 hover:shadow-soft",
        !notification.is_read && "border-brand-100 bg-brand-50/50",
        className,
      )}
    >
      <Link href={href} onClick={handleClick} className="flex min-w-0 flex-1 items-start gap-3">
        {notification.actor?.avatar_url || notification.image_url ? (
          <Avatar
            src={notification.actor?.avatar_url ?? notification.image_url}
            name={notification.actor?.full_name ?? notification.title}
            size={compact ? 36 : 44}
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-ink">{notification.title}</p>
            {!notification.is_read && (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
            )}
          </div>
          {notification.message && (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">
              {notification.message}
            </p>
          )}
          <p className="mt-1.5 text-[11px] text-zinc-400">
            {formatRelativeTime(notification.created_at)}
          </p>
        </div>
      </Link>

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(notification.id)}
          className="rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-400 opacity-0 transition hover:bg-white hover:text-brand-600 group-hover:opacity-100"
        >
          Delete
        </button>
      )}
    </div>
  );
}

export function NotificationCardSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-2xl px-3 py-3">
      <div className="h-11 w-11 rounded-full bg-zinc-100 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded bg-zinc-100 animate-pulse" />
        <div className="h-3 w-full rounded bg-zinc-100 animate-pulse" />
      </div>
    </div>
  );
}
