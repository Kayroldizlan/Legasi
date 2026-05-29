import type { SupabaseClient } from "@supabase/supabase-js";

import { PROFILE_PAGE_SIZE } from "@/lib/constants";

import type { Profile } from "@/types/database";
import type { DirectoryFilters, PaginatedResult } from "@/types";

// We intentionally use an untyped client. See lib/supabase/client.ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = SupabaseClient<any, any, any>;

function escapeIlike(value: string) {
  return value.replace(/[\\%,]/g, "");
}

function emptyResult(page: number, pageSize: number): PaginatedResult<Profile> {
  return {
    data: [],
    total: 0,
    page,
    pageSize,
    totalPages: 1,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProfileQuery = any;

async function getCommunityProfileIds(supabase: SB): Promise<string[]> {
  const { data, error } = await supabase.from("relations").select("user_id");
  if (error) throw error;
  return [...new Set((data ?? []).map((row) => row.user_id as string))];
}

function applyProfileFilters(
  query: ProfileQuery,
  filters: Partial<DirectoryFilters>,
  communityIds?: string[] | null,
) {
  let next = query.eq("status", "approved");

  if (communityIds) {
    next = next.in("id", communityIds);
  }

  if (filters.query?.trim()) {
    const q = escapeIlike(filters.query.trim());
    next = next.or(
      `full_name.ilike.%${q}%,username.ilike.%${q}%,occupation.ilike.%${q}%,company.ilike.%${q}%,city.ilike.%${q}%,address.ilike.%${q}%`,
    );
  }

  if (filters.occupation?.trim()) {
    next = next.ilike("occupation", `%${escapeIlike(filters.occupation.trim())}%`);
  }
  if (filters.city?.trim()) {
    const city = escapeIlike(filters.city.trim());
    next = next.or(`city.ilike.%${city}%,address.ilike.%${city}%`);
  }
  if (filters.country?.trim()) {
    next = next.ilike("country", `%${escapeIlike(filters.country.trim())}%`);
  }
  if (filters.company?.trim()) {
    next = next.ilike("company", `%${escapeIlike(filters.company.trim())}%`);
  }

  switch (filters.category) {
    case "verified":
      next = next.eq("is_verified", true);
      break;
    case "businesses":
      next = next.not("company", "is", null).neq("company", "");
      break;
    case "people":
      next = next.or("company.is.null,company.eq.");
      break;
    case "families":
      next = next.not("address", "is", null).neq("address", "");
      break;
    default:
      break;
  }

  return next;
}

async function sortPageByConnections(
  supabase: SB,
  profiles: Profile[],
): Promise<Profile[]> {
  if (profiles.length === 0) return profiles;

  const { data: stats, error } = await supabase
    .from("profile_stats")
    .select("id, connections_count")
    .in(
      "id",
      profiles.map((profile) => profile.id),
    );

  if (error || !stats) return profiles;

  const countMap = Object.fromEntries(
    stats.map((row) => [row.id as string, (row.connections_count as number) ?? 0]),
  );

  return [...profiles].sort(
    (a, b) => (countMap[b.id] ?? 0) - (countMap[a.id] ?? 0),
  );
}

/**
 * Server-side directory search with filters, sort, and pagination.
 */
export async function searchProfiles(
  supabase: SB,
  filters: Partial<DirectoryFilters>,
): Promise<PaginatedResult<Profile>> {
  const page = Math.max(1, Number(filters.page ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(filters.pageSize ?? PROFILE_PAGE_SIZE)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let communityIds: string[] | null = null;
  if (filters.category === "communities") {
    communityIds = await getCommunityProfileIds(supabase);
    if (communityIds.length === 0) return emptyResult(page, pageSize);
  }

  let query = applyProfileFilters(
    supabase.from("profiles").select("*", { count: "exact" }),
    filters,
    communityIds,
  );

  switch (filters.sort) {
    case "alphabetical":
      query = query.order("full_name", { ascending: true });
      break;
    case "most_connected":
      query = query
        .order("is_verified", { ascending: false })
        .order("created_at", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  let profiles = (data ?? []) as Profile[];

  if (filters.sort === "most_connected") {
    profiles = await sortPageByConnections(supabase, profiles);
  }

  const total = count ?? 0;
  return {
    data: profiles,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getProfileByUsername(
  supabase: SB,
  username: string,
): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .maybeSingle();
  return data as Profile | null;
}

export async function getProfileStats(supabase: SB, id: string) {
  const { data } = await supabase
    .from("profile_stats")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getSocialLinks(supabase: SB, profileId: string) {
  const { data } = await supabase
    .from("social_links")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  return data;
}
