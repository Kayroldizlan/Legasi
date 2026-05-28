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
    <div className="h-[calc(100vh-4rem)] flex">
      <ConversationList conversations={conversations} />

      <div className="hidden lg:flex flex-1 items-center justify-center bg-surface-muted">
        <EmptyState
          icon={MessageSquare}
          title="Pick a conversation"
          description="Select someone on the left, or start a new conversation from a profile."
          action={
            <LinkButton href="/directory" variant="secondary">
              Browse directory
            </LinkButton>
          }
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
    <aside className="w-full lg:w-80 xl:w-96 shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="border-b border-border px-5 py-4">
        <h1 className="text-lg font-semibold">Messages</h1>
        <p className="text-xs text-ink-subtle">{conversations.length} conversations</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={MessageSquare}
              title="No conversations yet"
              description="Visit a profile and tap Message to start chatting."
            />
          </div>
        ) : (
          <ul>
            {conversations.map((c) => (
              <li key={c.partner.id}>
                <Link
                  href={`/messages/${c.partner.id}`}
                  className="flex items-start gap-3 border-b border-border px-5 py-4 hover:bg-surface-subtle"
                >
                  <Avatar
                    src={c.partner.avatar_url}
                    name={c.partner.full_name}
                    size={44}
                    online={c.partner.is_online}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">
                        {c.partner.full_name}
                      </p>
                      <span className="text-[10px] text-ink-subtle whitespace-nowrap">
                        {formatRelativeTime(c.last_message?.created_at)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className="flex-1 truncate text-xs text-ink-muted">
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
