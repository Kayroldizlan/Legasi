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

export type DirectoryConnectionState =
  | { kind: "accepted" }
  | { kind: "pending"; direction: "sent" | "received" };

/** Connection state between the viewer and each profile on the directory page. */
export async function getConnectionStatesForProfiles(
  supabase: SB,
  viewerId: string,
  profileIds: string[],
): Promise<Record<string, DirectoryConnectionState>> {
  if (profileIds.length === 0) return {};

  const profileIdSet = new Set(profileIds);
  const { data, error } = await supabase
    .from("connections")
    .select("status, requester_id, addressee_id")
    .or(`requester_id.eq.${viewerId},addressee_id.eq.${viewerId}`)
    .in("status", ["accepted", "pending"]);

  if (error) return {};

  const map: Record<string, DirectoryConnectionState> = {};

  for (const row of data ?? []) {
    const partnerId =
      row.requester_id === viewerId ? row.addressee_id : row.requester_id;
    if (!profileIdSet.has(partnerId)) continue;

    if (row.status === "accepted") {
      map[partnerId] = { kind: "accepted" };
    } else if (row.status === "pending") {
      map[partnerId] = {
        kind: "pending",
        direction: row.requester_id === viewerId ? "sent" : "received",
      };
    }
  }

  return map;
}

function partnerId(connection: { requester_id: string; addressee_id: string }, userId: string) {
  return connection.requester_id === userId
    ? connection.addressee_id
    : connection.requester_id;
}

/** Accepted connections shared between two members. */
export async function getMutualConnections(
  supabase: SB,
  viewerId: string,
  profileId: string,
  limit = 8,
): Promise<Profile[]> {
  if (!viewerId || viewerId === profileId) return [];

  const [{ data: viewerConns }, { data: profileConns }] = await Promise.all([
    supabase
      .from("connections")
      .select("requester_id, addressee_id")
      .eq("status", "accepted")
      .or(`requester_id.eq.${viewerId},addressee_id.eq.${viewerId}`),
    supabase
      .from("connections")
      .select("requester_id, addressee_id")
      .eq("status", "accepted")
      .or(`requester_id.eq.${profileId},addressee_id.eq.${profileId}`),
  ]);

  const viewerNetwork = new Set(
    (viewerConns ?? []).map((row) => partnerId(row, viewerId)),
  );

  const mutualIds = [
    ...new Set(
      (profileConns ?? [])
        .map((row) => partnerId(row, profileId))
        .filter(
          (id) =>
            id !== viewerId &&
            id !== profileId &&
            viewerNetwork.has(id),
        ),
    ),
  ].slice(0, limit);

  if (mutualIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", mutualIds)
    .eq("status", "approved");

  return (profiles ?? []) as Profile[];
}
