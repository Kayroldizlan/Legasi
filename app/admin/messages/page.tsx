import type { Metadata } from "next";

import { Avatar, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/utils";

import { DeleteMessageButton } from "./delete-button";

import type { Message, Profile } from "@/types/database";

export const metadata: Metadata = { title: "Admin · Messages" };

interface AdminMessageRow extends Message {
  sender: Pick<Profile, "id" | "full_name" | "username" | "avatar_url">;
  receiver: Pick<Profile, "id" | "full_name" | "username" | "avatar_url">;
}

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select(
      "*, sender:sender_id(id, full_name, username, avatar_url), receiver:receiver_id(id, full_name, username, avatar_url)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (data ?? []) as unknown as AdminMessageRow[];

  return (
    <div className="container py-8 lg:py-10 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-ink-muted">
          Moderate platform messages. Deleted messages cannot be recovered.
        </p>
      </header>

      <Card>
        <ul className="divide-y divide-border">
          {rows.map((m) => (
            <li key={m.id} className="py-4 flex items-start gap-4">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Avatar src={m.sender.avatar_url} name={m.sender.full_name} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold truncate">
                      {m.sender.full_name}{" "}
                      <span className="text-ink-subtle font-normal">
                        → {m.receiver.full_name}
                      </span>
                    </p>
                    <span className="text-[10px] text-ink-subtle whitespace-nowrap">
                      {formatRelativeTime(m.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-ink-muted mt-1 break-words">{m.message}</p>
                </div>
              </div>
              <DeleteMessageButton id={m.id} />
            </li>
          ))}
        </ul>
        {rows.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-subtle">
            No messages have been sent yet.
          </p>
        )}
      </Card>
    </div>
  );
}
