import type { Metadata } from "next";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

import { BannerManager } from "./banner-manager";

export const metadata: Metadata = { title: "Admin · Banners" };

export default async function AdminBannersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container py-8 lg:py-10 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Banners & news</h1>
        <p className="text-sm text-ink-muted">
          Publish announcements that appear inside the app.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Create a banner</CardTitle>
          <CardDescription>Add a title, body, and optional image link.</CardDescription>
        </CardHeader>
        <BannerManager initial={data ?? []} />
      </Card>
    </div>
  );
}
