import {
  ArrowRight,
  MessageSquare,
  Network,
  UserPlus,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ProfileCard } from "@/components/profile/profile-card";
import {
  Avatar,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
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

  return (
    <div className="container py-8 lg:py-10 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar src={profile.avatar_url} name={profile.full_name} size={56} ring />
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-subtle">
              Dashboard
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back, {profile.full_name.split(" ")[0]}!{" "}
              <span className="inline-block" aria-hidden>
                👋
              </span>
            </h1>
          </div>
        </div>
        <LinkButton href={buildProfileUrl(profile.username)}>
          View public profile <ArrowRight className="h-4 w-4" />
        </LinkButton>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Connections"
          value={stats?.connections_count ?? 0}
          accent="bg-brand-50 text-brand-700"
          href="/connections"
        />
        <StatCard
          icon={Network}
          label="Relations"
          value={stats?.relations_count ?? 0}
          accent="bg-emerald-50 text-emerald-700"
          href="/settings/relations"
        />
        <StatCard
          icon={MessageSquare}
          label="Messages sent"
          value={stats?.messages_sent ?? 0}
          accent="bg-amber-50 text-amber-700"
          href="/messages"
        />
        <StatCard
          icon={UserPlus}
          label="Pending requests"
          value={pendingConnects?.length ?? 0}
          accent="bg-pink-50 text-pink-700"
          href="/connections"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pending connection requests</CardTitle>
            <CardDescription>
              Decide who to add to your network.
            </CardDescription>
          </CardHeader>
          {pendingConnects && pendingConnects.length > 0 ? (
            <div className="space-y-3">
              {(pendingConnects as Array<{ id: string; created_at: string; requester: { full_name: string; username: string; avatar_url: string | null } }>).map((c) => {
                const requester = c.requester;
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-surface-muted px-4 py-3"
                  >
                    <Link href={`/u/${requester.username}`} className="flex items-center gap-3">
                      <Avatar src={requester.avatar_url} name={requester.full_name} size={36} />
                      <div>
                        <p className="text-sm font-semibold">{requester.full_name}</p>
                        <p className="text-xs text-ink-subtle">
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
            />
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent messages</CardTitle>
            <CardDescription>Latest inbox activity.</CardDescription>
          </CardHeader>
          {latestMsgs && latestMsgs.length > 0 ? (
            <ul className="space-y-3">
              {(latestMsgs as Array<Message & { sender: { full_name: string; username: string; avatar_url: string | null } }>).map((m) => {
                const sender = m.sender;
                return (
                  <li key={m.id}>
                    <Link
                      href={`/messages/${m.sender_id}`}
                      className="flex gap-3 rounded-xl px-1 py-1.5 hover:bg-surface-subtle"
                    >
                      <Avatar src={sender.avatar_url} name={sender.full_name} size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold truncate">{sender.full_name}</p>
                          {!m.read_status && <Badge tone="brand">New</Badge>}
                        </div>
                        <p className="text-xs text-ink-muted truncate">{m.message}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title="Inbox is empty" description="Start a conversation." />
          )}
        </Card>
      </section>

      {recent && recent.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-lg font-semibold">Discover people</h2>
            <Link href="/directory" className="text-sm font-medium text-brand-600 hover:underline">
              See all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(recent as Profile[]).map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  href,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  accent: string;
  href?: string;
}) {
  const inner = (
    <div className="card flex items-center gap-4 hover:shadow-elevated transition">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-ink-subtle">{label}</p>
        <p className="text-2xl font-semibold leading-tight">{value}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
