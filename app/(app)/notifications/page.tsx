import { Bell } from "lucide-react";
import type { Metadata } from "next";

import { NotificationCenter } from "@/components/notifications/notification-center";
import { EmptyState } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { listNotifications } from "@/services/notifications";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, total } = await listNotifications(supabase, user!.id, {
    page: 1,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 lg:px-8 lg:py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Notifications
        </h1>
        <p className="text-sm text-zinc-500">
          Stay on top of activity across your network in real time.
        </p>
      </header>

      {data.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When activity happens, you'll see it here instantly."
        />
      ) : (
        <NotificationCenter initial={data} initialTotal={total} />
      )}
    </div>
  );
}
