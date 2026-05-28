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
    <aside className="hidden w-80 shrink-0 flex-col border-r border-zinc-100 bg-white lg:flex xl:w-96">
      <div className="border-b border-zinc-100 px-5 py-6">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Inbox
        </p>
        <h1 className="mt-1 text-xl font-semibold text-ink">Messages</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((c) => (
          <Link
            key={c.partner.id}
            href={`/messages/${c.partner.id}`}
            className={cn(
              "flex items-start gap-3 border-b border-zinc-100 px-5 py-4 transition",
              c.partner.id === activePartnerId
                ? "bg-brand-50/60"
                : "hover:bg-zinc-50",
            )}
          >
            <Avatar
              src={c.partner.avatar_url}
              name={c.partner.full_name}
              size={44}
              online={c.partner.is_online}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-ink">{c.partner.full_name}</p>
                <span className="text-[10px] text-zinc-400">
                  {formatRelativeTime(c.last_message?.created_at)}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <p className="flex-1 truncate text-xs text-zinc-500">
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
