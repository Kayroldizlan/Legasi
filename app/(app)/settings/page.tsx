import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { listRelations } from "@/services/relations";

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

  if (!profile) redirect("/");

  return (
    <div className="container py-8 lg:py-10 space-y-8 max-w-4xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-ink-muted">
          Manage your profile, social links, and relationships.
        </p>
      </header>

      <ProfileSettingsForm profile={profile} socials={socials} />

      <Card>
        <CardHeader>
          <CardTitle>Relationships</CardTitle>
          <CardDescription>
            Add the people connected to you so the network graph reflects
            real life.
          </CardDescription>
        </CardHeader>
        <RelationsManager initial={relations} userId={user.id} />
      </Card>
    </div>
  );
}
