"use client";

import * as React from "react";

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";

import type { Profile } from "@/types/database";

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

  // Heartbeat: keep last_seen_at fresh while the tab is visible
  React.useEffect(() => {
    if (!initialProfile) return;
    const supabase = createClient();
    const ping = () => {
      void supabase
        .from("profiles")
        .update({ is_online: true, last_seen_at: new Date().toISOString() } as never)
        .eq("id", initialProfile.id);
    };
    ping();
    const interval = setInterval(ping, 60_000);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        void supabase
          .from("profiles")
          .update({ is_online: false } as never)
          .eq("id", initialProfile.id);
      } else {
        ping();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [initialProfile]);

  return <>{children}</>;
}
