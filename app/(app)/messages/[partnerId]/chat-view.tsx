"use client";

import { ArrowLeft, Check, CheckCheck, Send } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import toast from "react-hot-toast";

import { Avatar } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { buildProfileUrl, cn, formatRelativeTime } from "@/lib/utils";

import type { Message, Profile, TypingIndicator } from "@/types/database";

interface ChatViewProps {
  currentUserId: string;
  partner: Profile;
  initialMessages: Message[];
}

export function ChatView({
  currentUserId,
  partner,
  initialMessages,
}: ChatViewProps) {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [partnerTyping, setPartnerTyping] = React.useState(false);
  const [partnerOnline, setPartnerOnline] = React.useState(partner.is_online);
  const endRef = React.useRef<HTMLDivElement>(null);
  const supabase = createClient();

  React.useEffect(() => {
    const el = endRef.current;
    if (el && "scrollIntoView" in el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, partnerTyping]);

  // Realtime: subscribe to incoming messages, typing, and partner status
  React.useEffect(() => {
    const channel = supabase
      .channel(`chat:${[currentUserId, partner.id].sort().join(":")}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const m = payload.new as Message;
          const ok =
            (m.sender_id === currentUserId && m.receiver_id === partner.id) ||
            (m.sender_id === partner.id && m.receiver_id === currentUserId);
          if (!ok) return;
          setMessages((prev) =>
            prev.some((x) => x.id === m.id) ? prev : [...prev, m],
          );
          if (m.sender_id === partner.id) {
            // Mark read on receipt
            void supabase
              .from("messages")
              .update({ read_status: true } as never)
              .eq("id", m.id);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => prev.map((x) => (x.id === m.id ? m : x)));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_indicators",
          filter: `sender_id=eq.${partner.id}`,
        },
        (payload) => {
          const t = payload.new as TypingIndicator | null;
          if (!t || t.receiver_id !== currentUserId) return;
          setPartnerTyping(t.is_typing);
          if (t.is_typing) {
            setTimeout(() => setPartnerTyping(false), 4000);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${partner.id}`,
        },
        (payload) => {
          setPartnerOnline(Boolean((payload.new as Profile).is_online));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, currentUserId, partner.id]);

  const typingTimer = React.useRef<NodeJS.Timeout | null>(null);
  const broadcastTyping = React.useCallback(
    (isTyping: boolean) => {
      void supabase
        .from("typing_indicators")
        .upsert(
          {
            sender_id: currentUserId,
            receiver_id: partner.id,
            is_typing: isTyping,
            updated_at: new Date().toISOString(),
          } as never,
          { onConflict: "sender_id,receiver_id" },
        );
    },
    [supabase, currentUserId, partner.id],
  );

  const handleDraftChange = (value: string) => {
    setDraft(value);
    broadcastTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => broadcastTyping(false), 1500);
  };

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      sender_id: currentUserId,
      receiver_id: partner.id,
      message: text,
      read_status: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");
    broadcastTyping(false);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUserId,
        receiver_id: partner.id,
        message: text,
      } as never)
      .select()
      .single();

    setSending(false);
    if (error) {
      toast.error(error.message);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      return;
    }
    if (data) {
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? (data as Message) : m)),
      );
    }
  };

  return (
    <section className="flex flex-1 flex-col bg-surface-muted">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 lg:px-6">
        <Link
          href="/messages"
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Link
          href={buildProfileUrl(partner.username)}
          className="flex items-center gap-3 min-w-0 flex-1"
        >
          <Avatar
            src={partner.avatar_url}
            name={partner.full_name}
            size={40}
            online={partnerOnline}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{partner.full_name}</p>
            <p className="text-[10px] text-ink-subtle">
              {partnerTyping
                ? "typing…"
                : partnerOnline
                  ? "online"
                  : `last seen ${formatRelativeTime(partner.last_seen_at)}`}
            </p>
          </div>
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-ink-subtle mt-10">
            No messages yet. Say hello!
          </p>
        ) : (
          <MessageList
            currentUserId={currentUserId}
            messages={messages}
            partner={partner}
          />
        )}

        {partnerTyping && <TypingBubble partner={partner} />}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={send}
        className="border-t border-border bg-surface px-4 py-3 lg:px-6 flex items-end gap-2"
      >
        <textarea
          value={draft}
          onChange={(e) => handleDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={`Message @${partner.username}`}
          rows={1}
          className="input-base flex-1 resize-none max-h-32"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}

function MessageList({
  currentUserId,
  messages,
  partner,
}: {
  currentUserId: string;
  messages: Message[];
  partner: Profile;
}) {
  let lastDate = "";
  return (
    <>
      {messages.map((m) => {
        const mine = m.sender_id === currentUserId;
        const day = new Date(m.created_at).toLocaleDateString();
        const showDate = day !== lastDate;
        lastDate = day;
        return (
          <React.Fragment key={m.id}>
            {showDate && (
              <div className="flex justify-center py-2">
                <span className="rounded-full bg-surface px-3 py-1 text-[10px] uppercase tracking-wider text-ink-subtle border border-border">
                  {day}
                </span>
              </div>
            )}
            <div className={cn("flex gap-2", mine ? "justify-end" : "justify-start")}>
              {!mine && (
                <Avatar
                  src={partner.avatar_url}
                  name={partner.full_name}
                  size={28}
                />
              )}
              <div
                className={cn(
                  "max-w-[80%] sm:max-w-[65%] rounded-2xl px-3.5 py-2 text-sm shadow-soft",
                  mine
                    ? "bg-brand-600 text-white rounded-br-sm"
                    : "bg-surface border border-border rounded-bl-sm",
                )}
              >
                <p className="whitespace-pre-wrap break-words">{m.message}</p>
                <div
                  className={cn(
                    "mt-1 flex items-center gap-1 text-[10px]",
                    mine ? "text-white/70 justify-end" : "text-ink-subtle",
                  )}
                >
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {mine &&
                    (m.read_status ? (
                      <CheckCheck className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    ))}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
}

function TypingBubble({ partner }: { partner: Profile }) {
  return (
    <div className="flex items-end gap-2">
      <Avatar src={partner.avatar_url} name={partner.full_name} size={28} />
      <div className="rounded-2xl rounded-bl-sm bg-surface border border-border px-4 py-3 shadow-soft">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-subtle animate-pulse-dot" />
          <span
            className="h-1.5 w-1.5 rounded-full bg-ink-subtle animate-pulse-dot"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-ink-subtle animate-pulse-dot"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
