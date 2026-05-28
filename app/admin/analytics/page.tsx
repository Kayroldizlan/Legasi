import { CheckCircle2, MessageSquare, Network, UserPlus, Users } from "lucide-react";
import type { Metadata } from "next";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Analytics" };

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const since = (days: number) =>
    new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: usersWeek },
    { count: messagesWeek },
    { count: connectionsWeek },
    { count: relationsWeek },
    { data: countries },
    { data: occupations },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("last_seen_at", since(7)),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since(7)),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since(7)),
    supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since(7)),
    supabase
      .from("relations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since(7)),
    supabase
      .from("profiles")
      .select("country")
      .not("country", "is", null)
      .limit(2000),
    supabase
      .from("profiles")
      .select("occupation")
      .not("occupation", "is", null)
      .limit(2000),
  ]);

  const topCountries = topN(
    (countries ?? []).map((c) => c.country as string),
    8,
  );
  const topOccupations = topN(
    (occupations ?? []).map((o) => o.occupation as string),
    8,
  );

  const maxCountry = Math.max(1, ...topCountries.map((c) => c.count));
  const maxOccupation = Math.max(1, ...topOccupations.map((c) => c.count));

  return (
    <div className="container py-8 lg:py-10 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-ink-muted">
          High-level metrics across the platform.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Metric label="Total members" value={totalUsers ?? 0} icon={Users} />
        <Metric label="Active last 7d" value={activeUsers ?? 0} icon={CheckCircle2} />
        <Metric label="Signups last 7d" value={usersWeek ?? 0} icon={UserPlus} />
        <Metric label="Messages last 7d" value={messagesWeek ?? 0} icon={MessageSquare} />
        <Metric label="New connections 7d" value={connectionsWeek ?? 0} icon={UserPlus} />
        <Metric label="New relations 7d" value={relationsWeek ?? 0} icon={Network} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top countries</CardTitle>
            <CardDescription>Where members are based.</CardDescription>
          </CardHeader>
          <BarList items={topCountries} max={maxCountry} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top occupations</CardTitle>
            <CardDescription>Most common job titles.</CardDescription>
          </CardHeader>
          <BarList items={topOccupations} max={maxOccupation} />
        </Card>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <div className="card flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-ink-subtle">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value.toLocaleString()}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

function BarList({
  items,
  max,
}: {
  items: { label: string; count: number }[];
  max: number;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-subtle">No data yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((c) => (
        <li key={c.label}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="truncate font-medium">{c.label}</span>
            <span className="text-ink-subtle text-xs">{c.count}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
              style={{ width: `${(c.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function topN(values: string[], n: number): { label: string; count: number }[] {
  const map = new Map<string, number>();
  values.forEach((v) => {
    const k = v.trim();
    if (!k) return;
    map.set(k, (map.get(k) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}
