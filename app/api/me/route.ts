import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/me
 *
 * Returns the currently signed-in user's profile, social links and stats.
 * Protected: 401 when not authenticated.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profileResult, socialResult, statsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("social_links").select("*").eq("profile_id", user.id).maybeSingle(),
    supabase.from("profile_stats").select("*").eq("id", user.id).maybeSingle(),
  ]);

  return NextResponse.json({
    profile: profileResult.data,
    social_links: socialResult.data,
    stats: statsResult.data,
  });
}
