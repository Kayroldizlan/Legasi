"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  mapAuthError,
  mapPostgrestError,
} from "@/lib/server/action-errors";
import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@/lib/server/action-result";

import type { RelationType, RelationWithProfile } from "@/types/database";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null, error: mapAuthError(error) };
  }

  return { supabase, user, error: null };
}

function mapRelationError(error: { code?: string; message: string }): string {
  if (
    error.code === "23505" ||
    /duplicate key|unique constraint/i.test(error.message)
  ) {
    return "This relationship already exists.";
  }
  return mapPostgrestError(error as never, "profile");
}

function revalidateRelationPaths(username?: string | null) {
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  if (username) revalidatePath(`/u/${username}`);
}

export async function addRelationAction(
  relatedUserId: string,
  relationType: RelationType,
): Promise<ActionResult<RelationWithProfile>> {
  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  const { data: relatedProfile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", relatedUserId)
    .eq("status", "approved")
    .maybeSingle();

  if (profileError) return actionFailure(mapRelationError(profileError));
  if (!relatedProfile) {
    return actionFailure("That profile could not be found.");
  }

  const { data: connection } = await supabase
    .from("connections")
    .select("id")
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${relatedUserId}),and(requester_id.eq.${relatedUserId},addressee_id.eq.${user.id})`,
    )
    .limit(1)
    .maybeSingle();

  if (!connection) {
    return actionFailure("You can only add accepted connections as relationships.");
  }

  const { data, error } = await supabase
    .from("relations")
    .insert({
      user_id: user.id,
      related_user_id: relatedUserId,
      relation_type: relationType,
    } as never)
    .select("*")
    .single();

  if (error) return actionFailure(mapRelationError(error));
  if (!data) return actionFailure("Could not add this relationship.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  revalidateRelationPaths(profile?.username);

  return actionSuccess({
    ...(data as RelationWithProfile),
    related_profile: relatedProfile,
  });
}

export async function removeRelationAction(id: string): Promise<ActionResult> {
  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  const { error } = await supabase
    .from("relations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return actionFailure(mapRelationError(error));

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  revalidateRelationPaths(profile?.username);
  return actionSuccess(undefined);
}
