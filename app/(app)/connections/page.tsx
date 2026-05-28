import { UserPlus } from "lucide-react";
import type { Metadata } from "next";

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
    <div className="container py-8 lg:py-10 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Connections</h1>
        <p className="text-sm text-ink-muted">
          Manage who's in your professional network.
        </p>
      </header>

      <Tabs defaultValue="accepted">
        <TabsList>
          <TabsTrigger value="accepted">Connected ({accepted.length})</TabsTrigger>
          <TabsTrigger value="incoming">
            Incoming requests ({incoming.length})
          </TabsTrigger>
          <TabsTrigger value="outgoing">
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
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
