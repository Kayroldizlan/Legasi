import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  getConversation,
  listConversations,
  markConversationRead,
} from "@/services/messages";

import { ChatView } from "./chat-view";
import { ConversationSidebar } from "./conversation-sidebar";

interface PageProps {
  params: Promise<{ partnerId: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { partnerId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: partner } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", partnerId)
    .maybeSingle();
  if (!partner) notFound();

  const [messages, conversations] = await Promise.all([
    getConversation(supabase, user!.id, partnerId),
    listConversations(supabase, user!.id),
  ]);

  await markConversationRead(supabase, user!.id, partnerId);

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <ConversationSidebar
        conversations={conversations}
        activePartnerId={partnerId}
      />
      <ChatView
        currentUserId={user!.id}
        partner={partner}
        initialMessages={messages}
      />
    </div>
  );
}
