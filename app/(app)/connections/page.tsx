import { UserPlus, Users, UserCheck, Send } from "lucide-react";
import type { Metadata } from "next";

import {
  PageContent,
  PageHero,
  PageStatsBar,
} from "@/components/layout/page-layout";
import { ProfileCard } from "@/components/profile/profile-card";
import {
  EmptyState,
  LinkButton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { listMyConnections } from "@/services/connections";

import { ConnectionRow } from "./connection-row";

export const metadata: Metadata = { title: "Connections" };

export default async function ConnectionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const all = await listMyConnections(supabase, user!.id);

  const accepted = all.filter((c) => c.status === "accepted");
  const incoming = all.filter(
    (c) => c.status === "pending" && c.addressee_id === user!.id,
  );
  const outgoing = all.filter(
    (c) => c.status === "pending" && c.requester_id === user!.id,
  );

  return (
    <>
      <PageHero
        eyebrow="Network"
        title="Connections"
        description="Manage who's in your professional network."
      />

      <PageStatsBar
        stats={[
          {
            icon: Users,
            label: "Connected",
            value: accepted.length,
            accent: "bg-brand-50 text-brand-600",
          },
          {
            icon: UserPlus,
            label: "Incoming",
            value: incoming.length,
            accent: "bg-pink-50 text-pink-600",
          },
          {
            icon: Send,
            label: "Sent",
            value: outgoing.length,
            accent: "bg-amber-50 text-amber-600",
          },
          {
            icon: UserCheck,
            label: "Total",
            value: all.length,
            accent: "bg-emerald-50 text-emerald-600",
          },
        ]}
      />

      <PageContent>
        <Tabs defaultValue="accepted">
          <TabsList variant="pill">
            <TabsTrigger variant="pill" value="accepted">
              Connected ({accepted.length})
            </TabsTrigger>
            <TabsTrigger variant="pill" value="incoming">
              Incoming requests ({incoming.length})
            </TabsTrigger>
            <TabsTrigger variant="pill" value="outgoing">
              Sent requests ({outgoing.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accepted">
            {accepted.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title="No connections yet"
                description="Find people in the directory and send a connection request."
                action={<LinkButton href="/directory">Open directory</LinkButton>}
                className="border-zinc-200 bg-zinc-50/50"
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {accepted.map((c) => {
                  const partner =
                    c.requester_id === user!.id ? c.addressee : c.requester;
                  return <ProfileCard key={c.id} profile={partner} />;
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="incoming">
            {incoming.length === 0 ? (
              <EmptyState
                title="No new requests"
                description="Incoming connection requests will appear here."
                className="border-zinc-200 bg-zinc-50/50"
              />
            ) : (
              <div className="space-y-3">
                {incoming.map((c) => (
                  <ConnectionRow
                    key={c.id}
                    connection={c}
                    partner={c.requester}
                    mode="incoming"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="outgoing">
            {outgoing.length === 0 ? (
              <EmptyState
                title="No pending requests"
                description="Requests you've sent that are still pending will appear here."
                className="border-zinc-200 bg-zinc-50/50"
              />
            ) : (
              <div className="space-y-3">
                {outgoing.map((c) => (
                  <ConnectionRow
                    key={c.id}
                    connection={c}
                    partner={c.addressee}
                    mode="outgoing"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PageContent>
    </>
  );
}
