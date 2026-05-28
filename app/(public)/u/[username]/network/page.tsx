import { Network } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { HierarchyFlow } from "@/components/relations/hierarchy-flow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { RELATION_META } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUsername } from "@/services/profiles";
import { expandNetwork } from "@/services/relations";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}'s network` };
}

export default async function NetworkPage({ params }: PageProps) {
  const { username } = await params;
  const supabase = await createClient();
  const root = await getProfileByUsername(supabase, username);
  if (!root) notFound();

  const { profiles, relations } = await expandNetwork(supabase, root.id, 2);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1 bg-surface-muted">
        <div className="container py-8 lg:py-10 space-y-6">
          <header className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
            <div>
              <Link
                href={`/u/${root.username}`}
                className="text-xs text-brand-600 hover:underline"
              >
                ← Back to profile
              </Link>
              <h1 className="text-2xl font-semibold tracking-tight">
                {root.full_name}'s network
              </h1>
              <p className="text-sm text-ink-muted">
                <Network className="inline h-4 w-4 mr-1" />
                {relations.length} relationships across {profiles.length} people
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(RELATION_META).map(([k, m]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-ink-muted"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
                  {m.label}
                </span>
              ))}
            </div>
          </header>

          <Tabs defaultValue="family">
            <TabsList>
              <TabsTrigger value="family">Family tree</TabsTrigger>
              <TabsTrigger value="org">Org chart</TabsTrigger>
            </TabsList>
            <TabsContent value="family">
              <HierarchyFlow
                rootProfile={root}
                relations={relations}
                profiles={profiles}
                layout="family"
                className="h-[70vh]"
              />
            </TabsContent>
            <TabsContent value="org">
              <HierarchyFlow
                rootProfile={root}
                relations={relations}
                profiles={profiles}
                layout="org"
                className="h-[70vh]"
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
