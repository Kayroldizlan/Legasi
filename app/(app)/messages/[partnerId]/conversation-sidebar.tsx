"use client";

import Link from "next/link";

import { Avatar, Badge } from "@/components/ui";
import { cn, formatRelativeTime, truncate } from "@/lib/utils";

import type { ConversationPreview } from "@/types/database";

export function ConversationSidebar({
  conversations,
  activePartnerId,
}: {
  conversations: ConversationPreview[];
  activePartnerId: string;
}) {
  return (
    <aside className="hidden lg:flex w-80 xl:w-96 shrink-0 border-r border-border bg-surface flex-col">
      <div className="border-b border-border px-5 py-4">
        <h1 className="text-lg font-semibold">Messages</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((c) => (
          <Link
            key={c.partner.id}
            href={`/messages/${c.partner.id}`}
            className={cn(
              "flex items-start gap-3 border-b border-border px-5 py-4 transition",
              c.partner.id === activePartnerId
                ? "bg-brand-50/60 dark:bg-brand-950/30"
                : "hover:bg-surface-subtle",
            )}
          >
            <Avatar
              src={c.partner.avatar_url}
              name={c.partner.full_name}
              size={44}
              online={c.partner.is_online}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">{c.partner.full_name}</p>
                <span className="text-[10px] text-ink-subtle">
                  {formatRelativeTime(c.last_message?.created_at)}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <p className="flex-1 truncate text-xs text-ink-muted">
                  {truncate(c.last_message?.message, 60)}
                </p>
                {c.unread_count > 0 && <Badge tone="brand">{c.unread_count}</Badge>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
