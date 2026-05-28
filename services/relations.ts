import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Profile,
  Relation,
  RelationWithProfile,
} from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = SupabaseClient<any, any, any>;

export async function listRelations(
  supabase: SB,
  userId: string,
): Promise<RelationWithProfile[]> {
  const { data } = await supabase
    .from("relations")
    .select("*, related_profile:related_user_id(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as RelationWithProfile[];
}

/**
 * Walks one level of related profiles for a given root user.
 * For a deeper graph the admin / hierarchy page expands lazily.
 */
export async function expandNetwork(
  supabase: SB,
  rootId: string,
  depth = 1,
): Promise<{ profiles: Profile[]; relations: Relation[] }> {
  const profiles = new Map<string, Profile>();
  const relations: Relation[] = [];

  const visited = new Set<string>();
  let frontier = [rootId];

  for (let i = 0; i < depth; i++) {
    const toVisit = frontier.filter((id) => !visited.has(id));
    if (toVisit.length === 0) break;
    toVisit.forEach((id) => visited.add(id));

    // Run two queries (one per direction) — simpler than building a complex `or`.
    const [outgoing, incoming] = await Promise.all([
      supabase
        .from("relations")
        .select("*, related_profile:related_user_id(*), source:user_id(*)")
        .in("user_id", toVisit),
      supabase
        .from("relations")
        .select("*, related_profile:related_user_id(*), source:user_id(*)")
        .in("related_user_id", toVisit),
    ]);

    const rows = [...(outgoing.data ?? []), ...(incoming.data ?? [])];
    const seen = new Set<string>();
    const next: string[] = [];

    rows.forEach((row: unknown) => {
      const r = row as Relation & {
        related_profile?: Profile;
        source?: Profile;
      };
      if (seen.has(r.id)) return;
      seen.add(r.id);
      relations.push({
        id: r.id,
        user_id: r.user_id,
        related_user_id: r.related_user_id,
        relation_type: r.relation_type,
        notes: r.notes ?? null,
        created_at: r.created_at,
      });
      if (r.related_profile) profiles.set(r.related_profile.id, r.related_profile);
      if (r.source) profiles.set(r.source.id, r.source);
      next.push(r.related_user_id, r.user_id);
    });

    frontier = next;
  }

  // Always include the root profile if available
  if (!profiles.has(rootId)) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", rootId)
      .maybeSingle();
    if (data) profiles.set(rootId, data as Profile);
  }

  return { profiles: Array.from(profiles.values()), relations };
}
