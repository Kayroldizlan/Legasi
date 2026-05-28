"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import toast from "react-hot-toast";

import { Avatar, Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { buildProfileUrl, formatRelativeTime } from "@/lib/utils";

import type { Connection, Profile } from "@/types/database";

interface Props {
  connection: Connection;
  partner: Profile;
  mode: "incoming" | "outgoing";
}

export function ConnectionRow({ connection, partner, mode }: Props) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const accept = async () => {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("connections")
      .update({ status: "accepted", responded_at: new Date().toISOString() } as never)
      .eq("id", connection.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Connection accepted");
    router.refresh();
  };

  const decline = async () => {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("id", connection.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(mode === "incoming" ? "Request declined" : "Request cancelled");
    router.refresh();
  };

  return (
    <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <Link
        href={buildProfileUrl(partner.username)}
        className="flex items-center gap-3 min-w-0"
      >
        <Avatar src={partner.avatar_url} name={partner.full_name} size={44} />
        <div className="min-w-0">
          <p className="font-semibold truncate">{partner.full_name}</p>
          <p className="text-xs text-ink-subtle">
            @{partner.username} · {formatRelativeTime(connection.created_at)}
          </p>
        </div>
      </Link>

      <div className="flex gap-2">
        {mode === "incoming" ? (
          <>
            <Button loading={busy} onClick={accept}>
              <Check className="h-4 w-4" />
              Accept
            </Button>
            <Button variant="secondary" loading={busy} onClick={decline}>
              <X className="h-4 w-4" />
              Decline
            </Button>
          </>
        ) : (
          <Button variant="secondary" loading={busy} onClick={decline}>
            <X className="h-4 w-4" />
            Cancel request
          </Button>
        )}
      </div>
    </div>
  );
}
