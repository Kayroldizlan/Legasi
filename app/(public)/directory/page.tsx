import type { Metadata } from "next";
import { Suspense } from "react";

import { ProfileCardSkeleton } from "@/components/ui";
import { PROFILE_PAGE_SIZE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { searchProfiles } from "@/services/profiles";

import { DirectoryFilters } from "./directory-filters";
import { DirectoryResults } from "./directory-results";

import type { DirectorySort } from "@/types";

export const metadata: Metadata = {
  title: "Directory",
  description: "Search and connect with members of the directory.",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    occupation?: string;
    city?: string;
    country?: string;
    company?: string;
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
    sort: (sp.sort ?? "newest") as DirectorySort,
    page: Number(sp.page ?? 1),
    pageSize: PROFILE_PAGE_SIZE,
  };

  const supabase = await createClient();
  const result = await searchProfiles(supabase, filters);

  return (
    <div className="container py-10 md:py-16 space-y-8">
      <header className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Directory
        </h1>
        <p className="text-sm md:text-base text-ink-muted">
          Search the community by name, occupation, company, or location.
        </p>
      </header>

      <DirectoryFilters />

      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProfileCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <DirectoryResults result={result} view={sp.view ?? "grid"} />
      </Suspense>
    </div>
  );
}
