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

import type { Connection } from "@/types/database";

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

function revalidateConnectionPaths(username?: string) {
  revalidatePath("/connections");
  revalidatePath("/dashboard");
  revalidatePath("/directory");
  if (username) revalidatePath(`/u/${username}`);
}

function mapConnectionError(error: { code?: string; message: string }): string {
  if (error.code === "PGRST116") {
    return "Connection request not found or already handled.";
  }
  return mapPostgrestError(error as never, "profile");
}

/** Accept an incoming pending connection request (addressee only). */
export async function acceptConnectionAction(
  connectionId: string,
  partnerUsername?: string,
): Promise<ActionResult<Connection>> {
  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  const { data, error } = await supabase
    .from("connections")
    .update({
      status: "accepted",
      responded_at: new Date().toISOString(),
    } as never)
    .eq("id", connectionId)
    .eq("addressee_id", user.id)
    .eq("status", "pending")
    .select()
    .single();

  if (error) return actionFailure(mapConnectionError(error));
  if (!data) {
    return actionFailure("Connection request not found or already handled.");
  }

  revalidateConnectionPaths(partnerUsername);
  return actionSuccess(data as Connection);
}

/** Decline an incoming pending connection request (addressee only). */
export async function declineConnectionAction(
  connectionId: string,
  partnerUsername?: string,
): Promise<ActionResult> {
  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  const { data, error } = await supabase
    .from("connections")
    .delete()
    .eq("id", connectionId)
    .eq("addressee_id", user.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) return actionFailure(mapConnectionError(error));
  if (!data) {
    return actionFailure("Connection request not found or already handled.");
  }

  revalidateConnectionPaths(partnerUsername);
  return actionSuccess(undefined);
}

/** Cancel an outgoing pending connection request (requester only). */
export async function cancelConnectionRequestAction(
  connectionId: string,
  partnerUsername?: string,
): Promise<ActionResult> {
  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  const { data, error } = await supabase
    .from("connections")
    .delete()
    .eq("id", connectionId)
    .eq("requester_id", user.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) return actionFailure(mapConnectionError(error));
  if (!data) {
    return actionFailure("Connection request not found or already handled.");
  }

  revalidateConnectionPaths(partnerUsername);
  return actionSuccess(undefined);
}

/** Send a new connection request to another member. */
export async function sendConnectionRequestAction(
  addresseeId: string,
  partnerUsername?: string,
): Promise<ActionResult<Connection>> {
  const { supabase, user, error: authError } = await requireUser();
  if (!user) return actionFailure(authError!);

  if (user.id === addresseeId) {
    return actionFailure("You cannot connect with yourself.");
  }

  const { data, error } = await supabase
    .from("connections")
    .insert({
      requester_id: user.id,
      addressee_id: addresseeId,
    } as never)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return actionFailure("A connection request already exists.");
    }
    return actionFailure(mapConnectionError(error));
  }

  revalidateConnectionPaths(partnerUsername);
  return actionSuccess(data as Connection);
}
