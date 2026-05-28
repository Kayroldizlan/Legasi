import { Bell, CheckCheck, Inbox } from "lucide-react";
import type { Metadata } from "next";

import {
  PageContent,
  PageHero,
  PageStatsBar,
} from "@/components/layout/page-layout";
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

  const unread = data.filter((n) => !n.is_read).length;

  return (
    <>
      <PageHero
        eyebrow="Activity"
        title="Notifications"
        description="Stay on top of activity across your network in real time."
      />

      <PageStatsBar
        stats={[
          {
            icon: Inbox,
            label: "Total",
            value: total,
            accent: "bg-brand-50 text-brand-600",
          },
          {
            icon: Bell,
            label: "Unread",
            value: unread,
            accent: "bg-pink-50 text-pink-600",
          },
          {
            icon: CheckCheck,
            label: "Read",
            value: total - unread,
            accent: "bg-emerald-50 text-emerald-600",
          },
          {
            icon: Bell,
            label: "This page",
            value: data.length,
            accent: "bg-amber-50 text-amber-600",
          },
        ]}
      />

      <PageContent className="mx-auto max-w-3xl">
        {data.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="When activity happens, you'll see it here instantly."
            className="border-zinc-200 bg-zinc-50/50"
          />
        ) : (
          <NotificationCenter initial={data} initialTotal={total} />
        )}
      </PageContent>
    </>
  );
}
