"use client";

import { Users } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  DirectoryCtaBanner,
  DirectoryLoadMore,
  DirectoryMemberCard,
} from "@/components/directory/directory-member-card";
import { ProfileCard } from "@/components/profile/profile-card";
import { EmptyState } from "@/components/ui";

import type { Profile } from "@/types/database";
import type { PaginatedResult } from "@/types";

interface Props {
  result: PaginatedResult<Profile>;
  view: string;
  statsByProfileId: Record<string, number>;
}

export function DirectoryResults({ result, view, statsByProfileId }: Props) {
  const params = useSearchParams();
  const pathname = usePathname();

  const nextHref = (() => {
    const next = new URLSearchParams(params);
    next.set("page", String(result.page + 1));
    return `${pathname}?${next.toString()}`;
  })();

  if (result.data.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members found"
        description="Try adjusting your filters or search query."
      />
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-zinc-500">
        Showing <strong className="text-ink">{result.data.length}</strong> of{" "}
        <strong className="text-ink">{result.total}</strong> members
      </p>

      {view === "list" ? (
        <div className="space-y-3">
          {result.data.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} variant="list" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {result.data.map((profile) => (
            <DirectoryMemberCard
              key={profile.id}
              profile={profile}
              connectionsCount={statsByProfileId[profile.id] ?? 0}
            />
          ))}
        </div>
      )}

      <DirectoryLoadMore
        hasMore={result.page < result.totalPages}
        nextHref={nextHref}
      />

      <DirectoryCtaBanner />
    </div>
  );
}
