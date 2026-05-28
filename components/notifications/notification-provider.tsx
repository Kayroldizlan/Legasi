"use client";

import * as React from "react";

import { createClient } from "@/lib/supabase/client";
import { showNotificationToast } from "@/lib/notifications/toast";
import { NOTIFICATIONS_PAGE_SIZE } from "@/lib/notifications/constants";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";

import type { NotificationRow } from "@/types/database";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const profile = useAuthStore((s) => s.profile);
  const { setAll, prepend, upsert, remove, setHydrated } = useNotificationStore();

  React.useEffect(() => {
    if (!profile) {
      setAll([]);
      setHydrated(false);
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(NOTIFICATIONS_PAGE_SIZE);

      if (!cancelled) {
        if (data) setAll(data as NotificationRow[]);
        else setHydrated(true);
      }
    })();

    const channel = supabase
      .channel(`notifications:${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          const row = payload.new as NotificationRow;
          prepend(row);
          showNotificationToast(row);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => upsert(payload.new as NotificationRow),
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => remove((payload.old as NotificationRow).id),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [profile, setAll, prepend, upsert, remove, setHydrated]);

  return <>{children}</>;
}
