import type { Metadata } from "next";

import { Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Activity log" };

export default async function ActivityLogPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="container py-8 lg:py-10 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Activity log</h1>
        <p className="text-sm text-ink-muted">
          Audit trail of recent admin and system actions.
        </p>
      </header>

      <Card>
        <ul className="divide-y divide-border">
          {(data ?? []).map((a) => (
            <li key={a.id} className="py-3 text-sm flex items-center justify-between">
              <div>
                <p className="font-medium">{a.action}</p>
                {a.target_id && (
                  <p className="text-xs text-ink-subtle font-mono">
                    {a.target_type}: {a.target_id}
                  </p>
                )}
              </div>
              <span className="text-xs text-ink-subtle">
                {formatRelativeTime(a.created_at)}
              </span>
            </li>
          ))}
          {(!data || data.length === 0) && (
            <li className="py-10 text-center text-sm text-ink-subtle">
              No activity yet.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
