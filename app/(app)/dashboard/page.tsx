import {
  ArrowRight,
  MessageSquare,
  Network,
  UserPlus,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  PageContent,
  PageHero,
  PageSection,
  PageStatsBar,
} from "@/components/layout/page-layout";
import { ProfileCard } from "@/components/profile/profile-card";
import {
  Avatar,
  Badge,
  EmptyState,
  LinkButton,
} from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { buildProfileUrl, formatRelativeTime } from "@/lib/utils";
import { getProfileStats } from "@/services/profiles";

import type { Message, Profile } from "@/types/database";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = ((
    await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()
  ).data as Profile);

  const [stats, { data: pendingConnects }, { data: recent }, { data: latestMsgs }] =
    await Promise.all([
      getProfileStats(supabase, profile.id),
      supabase
        .from("connections")
        .select("*, requester:requester_id(*)")
        .eq("addressee_id", profile.id)
        .eq("status", "pending"),
      supabase
        .from("profiles")
        .select("*")
        .eq("status", "approved")
        .neq("id", profile.id)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("messages")
        .select("*, sender:sender_id(full_name, username, avatar_url)")
        .eq("receiver_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const firstName = profile.full_name.split(" ")[0];

  return (
    <>
      <PageHero
        eyebrow="Dashboard"
        title={
          <>
            Welcome back, {firstName}!{" "}
            <span className="inline-block" aria-hidden>
              👋
            </span>
          </>
        }
        avatar={{ src: profile.avatar_url, name: profile.full_name }}
        action={
          <LinkButton href={buildProfileUrl(profile.username)}>
            View public profile <ArrowRight className="h-4 w-4" />
          </LinkButton>
        }
      />

      <PageStatsBar
        stats={[
          {
            icon: Users,
            label: "Connections",
            value: stats?.connections_count ?? 0,
            accent: "bg-brand-50 text-brand-600",
            href: "/connections",
          },
          {
            icon: Network,
            label: "Relations",
            value: stats?.relations_count ?? 0,
            accent: "bg-emerald-50 text-emerald-600",
            href: "/settings",
          },
          {
            icon: MessageSquare,
            label: "Messages sent",
            value: stats?.messages_sent ?? 0,
            accent: "bg-amber-50 text-amber-600",
            href: "/messages",
          },
          {
            icon: UserPlus,
            label: "Pending requests",
            value: pendingConnects?.length ?? 0,
            accent: "bg-pink-50 text-pink-600",
            href: "/connections",
          },
        ]}
      />

      <PageContent>
        <div className="grid gap-6 lg:grid-cols-3">
          <PageSection
            className="lg:col-span-2"
            title="Pending connection requests"
            description="Decide who to add to your network."
          >
            {pendingConnects && pendingConnects.length > 0 ? (
              <div className="space-y-3">
                {(pendingConnects as Array<{ id: string; created_at: string; requester: { full_name: string; username: string; avatar_url: string | null } }>).map((c) => {
                  const requester = c.requester;
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3"
                    >
                      <Link href={`/u/${requester.username}`} className="flex items-center gap-3">
                        <Avatar src={requester.avatar_url} name={requester.full_name} size={36} />
                        <div>
                          <p className="text-sm font-semibold text-ink">{requester.full_name}</p>
                          <p className="text-xs text-zinc-500">
                            {formatRelativeTime(c.created_at)}
                          </p>
                        </div>
                      </Link>
                      <Link
                        href="/connections"
                        className="text-xs font-medium text-brand-600 hover:underline"
                      >
                        Review →
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No pending requests"
                description="When someone asks to connect, they'll show up here."
                className="border-zinc-200 bg-zinc-50/50"
              />
            )}
          </PageSection>

          <PageSection
            title="Recent messages"
            description="Latest inbox activity."
          >
            {latestMsgs && latestMsgs.length > 0 ? (
              <ul className="space-y-3">
                {(latestMsgs as Array<Message & { sender: { full_name: string; username: string; avatar_url: string | null } }>).map((m) => {
                  const sender = m.sender;
                  return (
                    <li key={m.id}>
                      <Link
                        href={`/messages/${m.sender_id}`}
                        className="flex gap-3 rounded-xl px-1 py-1.5 transition hover:bg-zinc-50"
                      >
                        <Avatar src={sender.avatar_url} name={sender.full_name} size={32} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="truncate text-sm font-semibold text-ink">{sender.full_name}</p>
                            {!m.read_status && <Badge tone="brand">New</Badge>}
                          </div>
                          <p className="truncate text-xs text-zinc-500">{m.message}</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                title="Inbox is empty"
                description="Start a conversation."
                className="border-zinc-200 bg-zinc-50/50"
              />
            )}
          </PageSection>
        </div>

        {recent && recent.length > 0 && (
          <section>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">Discover people</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Recently joined members you might know.
                </p>
              </div>
              <Link href="/directory" className="text-sm font-medium text-brand-600 hover:underline">
                See all
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {(recent as Profile[]).map((p) => (
                <ProfileCard key={p.id} profile={p} />
              ))}
            </div>
          </section>
        )}
      </PageContent>
    </>
  );
}
