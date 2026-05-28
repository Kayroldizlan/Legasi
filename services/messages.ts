import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ConversationPreview,
  Message,
  Profile,
} from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = SupabaseClient<any, any, any>;

/**
 * List all conversation partners for the given user with the latest message
 * preview and unread count.
 */
export async function listConversations(
  supabase: SB,
  userId: string,
): Promise<ConversationPreview[]> {
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(400);

  const partnerIds = new Set<string>();
  const latestByPartner = new Map<string, Message>();
  const unreadByPartner = new Map<string, number>();

  (messages ?? []).forEach((m) => {
    const partner = m.sender_id === userId ? m.receiver_id : m.sender_id;
    partnerIds.add(partner);
    if (!latestByPartner.has(partner)) latestByPartner.set(partner, m as Message);
    if (m.receiver_id === userId && !m.read_status) {
      unreadByPartner.set(partner, (unreadByPartner.get(partner) ?? 0) + 1);
    }
  });

  if (partnerIds.size === 0) return [];

  const { data: partners } = await supabase
    .from("profiles")
    .select("*")
    .in("id", Array.from(partnerIds));

  const byId = new Map<string, Profile>();
  (partners ?? []).forEach((p) => byId.set(p.id, p as Profile));

  return Array.from(partnerIds)
    .map<ConversationPreview | null>((id) => {
      const partner = byId.get(id);
      if (!partner) return null;
      return {
        partner,
        last_message: latestByPartner.get(id) ?? null,
        unread_count: unreadByPartner.get(id) ?? 0,
      };
    })
    .filter((c): c is ConversationPreview => Boolean(c))
    .sort((a, b) => {
      const ad = a.last_message?.created_at ?? "0";
      const bd = b.last_message?.created_at ?? "0";
      return bd.localeCompare(ad);
    });
}

export async function getConversation(
  supabase: SB,
  userId: string,
  partnerId: string,
): Promise<Message[]> {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`,
    )
    .order("created_at", { ascending: true })
    .limit(300);
  return (data ?? []) as Message[];
}

export async function markConversationRead(
  supabase: SB,
  userId: string,
  partnerId: string,
) {
  await supabase
    .from("messages")
    .update({ read_status: true })
    .eq("sender_id", partnerId)
    .eq("receiver_id", userId)
    .eq("read_status", false);
}
