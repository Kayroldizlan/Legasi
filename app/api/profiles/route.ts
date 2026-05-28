import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { searchProfiles } from "@/services/profiles";

import type { DirectorySort } from "@/types";

/**
 * GET /api/profiles
 *
 * Public, paginated profile search.
 * Query params: q, occupation, city, country, company, sort, page, pageSize
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = await createClient();

  const result = await searchProfiles(supabase, {
    query: searchParams.get("q") ?? "",
    occupation: searchParams.get("occupation") ?? "",
    city: searchParams.get("city") ?? "",
    country: searchParams.get("country") ?? "",
    company: searchParams.get("company") ?? "",
    sort: (searchParams.get("sort") ?? "newest") as DirectorySort,
    page: Number(searchParams.get("page") ?? 1),
    pageSize: Number(searchParams.get("pageSize") ?? 12),
  });

  return NextResponse.json(result);
}
