import {
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Network,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Avatar, Badge, Card, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: pendingCount },
    { count: messagesCount },
    { count: relationsCount },
    { count: connectionsCount },
    { count: bannersCount },
    { data: recentUsers },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase.from("relations").select("*", { count: "exact", head: true }),
    supabase.from("connections").select("*", { count: "exact", head: true }),
    supabase.from("banners").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, status, role, created_at, occupation")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return (
    <div className="container py-8 lg:py-10 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin overview
          </h1>
          <p className="text-sm text-ink-muted">
            A snapshot of platform activity and pending tasks.
          </p>
        </div>
        <Badge tone="success">
          <ShieldCheck className="h-3 w-3" /> Admin
        </Badge>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total members" value={usersCount ?? 0} accent="bg-brand-50 text-brand-700" href="/admin/users" />
        <StatCard icon={AlertTriangle} label="Pending approval" value={pendingCount ?? 0} accent="bg-amber-50 text-amber-700" href="/admin/users?status=pending" />
        <StatCard icon={UserPlus} label="Connections" value={connectionsCount ?? 0} accent="bg-emerald-50 text-emerald-700" />
        <StatCard icon={MessageSquare} label="Messages" value={messagesCount ?? 0} accent="bg-pink-50 text-pink-700" href="/admin/messages" />
        <StatCard icon={Network} label="Relations" value={relationsCount ?? 0} accent="bg-violet-50 text-violet-700" href="/admin/relations" />
        <StatCard icon={CheckCircle2} label="Active banners" value={bannersCount ?? 0} accent="bg-slate-100 text-slate-700" href="/admin/banners" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recently joined</CardTitle>
            <CardDescription>The newest members on the platform.</CardDescription>
          </CardHeader>
          <ul className="divide-y divide-border">
            {(recentUsers ?? []).map((u) => (
              <li key={u.id} className="flex items-center justify-between py-3">
                <Link href={`/u/${u.username}`} className="flex items-center gap-3 min-w-0">
                  <Avatar src={u.avatar_url} name={u.full_name} size={36} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{u.full_name}</p>
                    <p className="text-xs text-ink-subtle truncate">
                      @{u.username} · {u.occupation || "Member"}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <Badge
                    tone={u.status === "approved" ? "success" : u.status === "pending" ? "warning" : "danger"}
                  >
                    {u.status}
                  </Badge>
                  <span className="text-[10px] text-ink-subtle whitespace-nowrap">
                    {formatRelativeTime(u.created_at)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity log</CardTitle>
            <CardDescription>Recent admin actions.</CardDescription>
          </CardHeader>
          {recentActivity && recentActivity.length > 0 ? (
            <ul className="space-y-3">
              {recentActivity.map((a) => (
                <li key={a.id} className="text-sm">
                  <p className="font-medium">{a.action}</p>
                  <p className="text-xs text-ink-subtle">
                    {formatRelativeTime(a.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-subtle">No activity logged yet.</p>
          )}
        </Card>
      </section>
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
