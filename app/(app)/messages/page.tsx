import { MessageSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  Avatar,
  Badge,
  EmptyState,
  LinkButton,
} from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { listConversations } from "@/services/messages";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const conversations = await listConversations(supabase, user!.id);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ConversationList conversations={conversations} />

      <div className="hidden flex-1 items-center justify-center bg-zinc-50/80 lg:flex">
        <EmptyState
          icon={MessageSquare}
          title="Pick a conversation"
          description="Select someone on the left, or start a new conversation from a profile."
          action={
            <LinkButton href="/directory" variant="secondary">
              Browse directory
            </LinkButton>
          }
          className="border-zinc-200 bg-white"
        />
      </div>
    </div>
  );
}

function ConversationList({
  conversations,
}: {
  conversations: Awaited<ReturnType<typeof listConversations>>;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-r border-zinc-100 bg-white lg:w-80 xl:w-96">
      <div className="border-b border-zinc-100 px-5 py-6">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Inbox
        </p>
        <h1 className="mt-1 text-xl font-semibold text-ink">Messages</h1>
        <p className="mt-1 text-xs text-zinc-500">
          {conversations.length} conversations
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={MessageSquare}
              title="No conversations yet"
              description="Visit a profile and tap Message to start chatting."
              className="border-zinc-200 bg-zinc-50/50"
            />
          </div>
        ) : (
          <ul>
            {conversations.map((c) => (
              <li key={c.partner.id}>
                <Link
                  href={`/messages/${c.partner.id}`}
                  className="flex items-start gap-3 border-b border-zinc-100 px-5 py-4 transition hover:bg-zinc-50"
                >
                  <Avatar
                    src={c.partner.avatar_url}
                    name={c.partner.full_name}
                    size={44}
                    online={c.partner.is_online}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-ink">
                        {c.partner.full_name}
                      </p>
                      <span className="whitespace-nowrap text-[10px] text-zinc-400">
                        {formatRelativeTime(c.last_message?.created_at)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className="flex-1 truncate text-xs text-zinc-500">
                        {truncate(c.last_message?.message, 60) || "Say hi 👋"}
                      </p>
                      {c.unread_count > 0 && (
                        <Badge tone="brand">{c.unread_count}</Badge>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
