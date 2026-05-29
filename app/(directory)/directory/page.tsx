import type { Metadata } from "next";
import { Suspense } from "react";

import { DirectoryHero } from "@/components/directory/directory-hero";
import { DirectoryStatsBar } from "@/components/directory/directory-stats-bar";
import { ProfileCardSkeleton } from "@/components/ui";
import { PROFILE_PAGE_SIZE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { getConnectionStatesForProfiles } from "@/services/connections";
import { searchProfiles } from "@/services/profiles";

import { DirectoryFilters } from "./directory-filters";
import { DirectoryResults } from "./directory-results";

import type { DirectorySort } from "@/types";

export const metadata: Metadata = {
  title: "Directory",
  description: "Search and connect with members of the Legasi directory.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    occupation?: string;
    city?: string;
    country?: string;
    company?: string;
    category?: string;
    sort?: DirectorySort;
    view?: "grid" | "list";
    page?: string;
  }>;
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filters = {
    query: sp.q ?? "",
    occupation: sp.occupation ?? "",
    city: sp.city ?? "",
    country: sp.country ?? "",
    company: sp.company ?? "",
    relation: "",
    category: sp.category ?? "",
    sort: (sp.sort ?? "newest") as DirectorySort,
    page: Number(sp.page ?? 1),
    pageSize: PROFILE_PAGE_SIZE,
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let result;
  try {
    result = await searchProfiles(supabase, filters);
  } catch (error) {
    console.error("[directory] searchProfiles failed:", error);
    result = {
      data: [],
      total: 0,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: 1,
    };
  }

  const [membersRes, connectionsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .eq("status", "accepted"),
  ]);

  const profileIds = result.data.map((profile) => profile.id);
  const { data: statsRows } = profileIds.length
    ? await supabase
        .from("profile_stats")
        .select("id, connections_count")
        .in("id", profileIds)
    : { data: [] as { id: string; connections_count: number }[] };

  const statsByProfileId = Object.fromEntries(
    (statsRows ?? []).map((row) => [row.id, row.connections_count ?? 0]),
  );

  const connectionByProfileId =
    user && profileIds.length > 0
      ? await getConnectionStatesForProfiles(supabase, user.id, profileIds).catch(
          () => ({}),
        )
      : {};

  const filterKey = [
    sp.q,
    sp.occupation,
    sp.city,
    sp.country,
    sp.company,
    sp.category,
    sp.sort,
    sp.view,
    sp.page,
  ].join("|");

  return (
    <>
      <DirectoryHero membersCount={membersRes.count ?? 0} />
      <DirectoryStatsBar
        membersCount={membersRes.count ?? 0}
        connectionsCount={connectionsRes.count ?? 0}
      />

      <div className="space-y-8 px-4 py-8 lg:px-8 lg:py-10">
        <Suspense fallback={null}>
          <DirectoryFilters />
        </Suspense>

        <Suspense
          fallback={
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProfileCardSkeleton key={index} />
              ))}
            </div>
          }
        >
          <DirectoryResults
            key={filterKey}
            result={result}
            view={sp.view ?? "grid"}
            statsByProfileId={statsByProfileId}
            connectionByProfileId={connectionByProfileId}
            viewerId={user?.id ?? null}
          />
        </Suspense>
      </div>
    </>
  );
}
