import { Bell, Network, UserCog } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  PageContent,
  PageHero,
  PageSection,
  PageStatsBar,
} from "@/components/layout/page-layout";
import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_NOTIFICATION_TYPE_SETTINGS } from "@/lib/notifications/constants";
import { listRelations } from "@/services/relations";
import { getNotificationPreferences } from "@/services/notifications";

import { RelationsManager } from "./relations-manager";
import { ProfileSettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: socials } = await supabase
    .from("social_links")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  const relations = await listRelations(supabase, user.id);
  const notificationPrefs = await getNotificationPreferences(supabase, user.id);

  if (!profile) redirect("/");

  return (
    <>
      <PageHero
        eyebrow="Account"
        title="Settings"
        description="Manage your profile, social links, and relationships."
      />

      <PageStatsBar
        stats={[
          {
            icon: UserCog,
            label: "Profile",
            value: profile.status === "approved" ? "Active" : profile.status,
            accent: "bg-brand-50 text-brand-600",
          },
          {
            icon: Network,
            label: "Relations",
            value: relations.length,
            accent: "bg-emerald-50 text-emerald-600",
          },
          {
            icon: Bell,
            label: "Email alerts",
            value: notificationPrefs?.email_enabled !== false ? "On" : "Off",
            accent: "bg-amber-50 text-amber-600",
          },
          {
            icon: Bell,
            label: "Push alerts",
            value: notificationPrefs?.push_enabled ? "On" : "Off",
            accent: "bg-pink-50 text-pink-600",
          },
        ]}
      />

      <PageContent className="mx-auto max-w-4xl">
        <ProfileSettingsForm profile={profile} socials={socials} />

        <NotificationPreferencesForm
          initial={
            notificationPrefs ?? {
              user_id: user.id,
              type_settings: DEFAULT_NOTIFICATION_TYPE_SETTINGS,
              email_enabled: true,
              push_enabled: false,
              sound_enabled: true,
              updated_at: new Date().toISOString(),
            }
          }
        />

        <PageSection
          title="Relationships"
          description="Add the people connected to you so the network graph reflects real life."
        >
          <RelationsManager initial={relations} userId={user.id} />
        </PageSection>
      </PageContent>
    </>
  );
}
