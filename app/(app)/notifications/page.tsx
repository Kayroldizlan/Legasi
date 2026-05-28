import { Bell } from "lucide-react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

import { NotificationList } from "./notification-list";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="container py-8 lg:py-10 max-w-3xl space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-ink-muted">
          Stay on top of activity across your network.
        </p>
      </header>

      {(!data || data.length === 0) ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When activity happens we'll let you know here."
        />
      ) : (
        <NotificationList initial={data} />
      )}
    </div>
  );
}
