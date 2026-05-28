import type { Metadata } from "next";

import { Avatar, Badge, Card } from "@/components/ui";
import { RELATION_META } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/utils";

import { DeleteRelationButton } from "./delete-button";

import type { Profile, Relation } from "@/types/database";

export const metadata: Metadata = { title: "Admin · Relations" };

interface AdminRelationRow extends Relation {
  user: Pick<Profile, "id" | "username" | "full_name" | "avatar_url">;
  related: Pick<Profile, "id" | "username" | "full_name" | "avatar_url">;
}

export default async function AdminRelationsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("relations")
    .select(
      "*, user:user_id(id, username, full_name, avatar_url), related:related_user_id(id, username, full_name, avatar_url)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as unknown as AdminRelationRow[];

  return (
    <div className="container py-8 lg:py-10 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Relations</h1>
        <p className="text-sm text-ink-muted">
          Review and moderate relationships between members.
        </p>
      </header>

      <Card>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-ink-subtle">
                <th className="py-2">Member</th>
                <th className="py-2">Type</th>
                <th className="py-2">Related to</th>
                <th className="py-2 hidden md:table-cell">Created</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => {
                const meta = RELATION_META[r.relation_type];
                return (
                  <tr key={r.id}>
                    <td className="py-3">
                      <UserCell profile={r.user} />
                    </td>
                    <td className="py-3">
                      <Badge style={{ background: `${meta.color}15`, color: meta.color }}>
                        {meta.label}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <UserCell profile={r.related} />
                    </td>
                    <td className="py-3 text-xs text-ink-subtle hidden md:table-cell">
                      {formatRelativeTime(r.created_at)}
                    </td>
                    <td className="py-3 text-right">
                      <DeleteRelationButton id={r.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="py-10 text-center text-sm text-ink-subtle">
              No relationships yet.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

function UserCell({ profile }: { profile: AdminRelationRow["user"] }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar src={profile.avatar_url} name={profile.full_name} size={28} />
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{profile.full_name}</p>
        <p className="text-xs text-ink-subtle truncate">@{profile.username}</p>
      </div>
    </div>
  );
}
