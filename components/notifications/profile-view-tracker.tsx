"use client";

import * as React from "react";

import { recordProfileViewAction } from "@/lib/actions/notifications";
import { useAuthStore } from "@/store/auth-store";

export function ProfileViewTracker({ profileId }: { profileId: string }) {
  const me = useAuthStore((s) => s.profile);
  const tracked = React.useRef(false);

  React.useEffect(() => {
    if (!me || me.id === profileId || tracked.current) return;
    tracked.current = true;
    void recordProfileViewAction(profileId);
  }, [me, profileId]);

  return null;
}
