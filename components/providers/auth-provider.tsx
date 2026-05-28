"use client";

import * as React from "react";

import { updatePresenceAction } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";

import type { Profile } from "@/types/database";

const PRESENCE_INTERVAL_MS = 60_000;

export function AuthProvider({
  initialProfile,
  children,
}: {
  initialProfile: Profile | null;
  children: React.ReactNode;
}) {
  const setProfile = useAuthStore((s) => s.setProfile);

  React.useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile, setProfile]);

  React.useEffect(() => {
    const supabase = createClient();

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setProfile(null);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();
      if (profile) setProfile(profile);
    });

    return () => data.subscription.unsubscribe();
  }, [setProfile]);

  React.useEffect(() => {
    if (!initialProfile) return;

    const ping = () => {
      void updatePresenceAction(true);
    };

    ping();
    const interval = setInterval(ping, PRESENCE_INTERVAL_MS);

    const onVisibility = () => {
      void updatePresenceAction(document.visibilityState !== "hidden");
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      void updatePresenceAction(false);
    };
  }, [initialProfile]);

  return <>{children}</>;
}
