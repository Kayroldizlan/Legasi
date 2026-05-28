import type { SupabaseClient } from "@supabase/supabase-js";

import { PROFILE_PAGE_SIZE } from "@/lib/constants";

import type { Profile } from "@/types/database";
import type { DirectoryFilters, PaginatedResult } from "@/types";

// We intentionally use an untyped client. See lib/supabase/client.ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = SupabaseClient<any, any, any>;

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

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("status", "approved");

  if (filters.query?.trim()) {
    const q = filters.query.trim().replace(/[%,]/g, "");
    query = query.or(
      `full_name.ilike.%${q}%,username.ilike.%${q}%,occupation.ilike.%${q}%,company.ilike.%${q}%`,
    );
  }
  if (filters.occupation) query = query.ilike("occupation", `%${filters.occupation}%`);
  if (filters.city)       query = query.ilike("city", `%${filters.city}%`);
  if (filters.country)    query = query.ilike("country", `%${filters.country}%`);
  if (filters.company)    query = query.ilike("company", `%${filters.company}%`);

  switch (filters.category) {
    case "verified":
      query = query.eq("is_verified", true);
      break;
    case "businesses":
      query = query.not("company", "is", null).neq("company", "");
      break;
    case "families":
      query = query.not("address", "is", null).neq("address", "");
      break;
    default:
      break;
  }

  switch (filters.sort) {
    case "alphabetical":
      query = query.order("full_name", { ascending: true });
      break;
    case "most_connected":
      // RLS-safe approximation: order by created_at then resolve counts client-side
      query = query.order("is_verified", { ascending: false }).order("created_at", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as Profile[],
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
