import type { SupabaseClient } from "@supabase/supabase-js";

import type { Connection, Profile } from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = SupabaseClient<any, any, any>;

export interface ConnectionWithProfile extends Connection {
  requester: Profile;
  addressee: Profile;
}

export async function getConnectionBetween(
  supabase: SB,
  a: string,
  b: string,
): Promise<Connection | null> {
  const { data } = await supabase
    .from("connections")
    .select("*")
    .or(
      `and(requester_id.eq.${a},addressee_id.eq.${b}),and(requester_id.eq.${b},addressee_id.eq.${a})`,
    )
    .limit(1);
  return ((data?.[0] as Connection) ?? null);
}

export async function listMyConnections(supabase: SB, userId: string) {
  const { data } = await supabase
    .from("connections")
    .select(
      "*, requester:requester_id(*), addressee:addressee_id(*)",
    )
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as ConnectionWithProfile[];
}
