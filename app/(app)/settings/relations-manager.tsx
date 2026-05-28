"use client";

import { Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import toast from "react-hot-toast";

import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Input,
  Select,
} from "@/components/ui";
import { RELATION_META, RELATION_TYPES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

import type {
  Profile,
  RelationType,
  RelationWithProfile,
} from "@/types/database";

interface Props {
  userId: string;
  initial: RelationWithProfile[];
}

export function RelationsManager({ userId, initial }: Props) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  const [items, setItems] = React.useState(initial);
  const [search, setSearch] = React.useState("");
  const [results, setResults] = React.useState<Profile[]>([]);
  const [selected, setSelected] = React.useState<Profile | null>(null);
  const [relationType, setRelationType] = React.useState<RelationType>("friend");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const id = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("status", "approved")
        .neq("id", userId)
        .or(`full_name.ilike.%${q}%,username.ilike.%${q}%`)
        .limit(6);
      setResults((data as Profile[]) ?? []);
    }, 300);
    return () => clearTimeout(id);
  }, [search, supabase, userId]);

  const add = async () => {
    if (!selected) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("relations")
      .insert({
        user_id: userId,
        related_user_id: selected.id,
        relation_type: relationType,
      } as never)
      .select("*, related_profile:related_user_id(*)")
      .single();
    setBusy(false);
    if (error) return toast.error(error.message);
    setItems((prev) => [data as unknown as RelationWithProfile, ...prev]);
    setSelected(null);
    setSearch("");
    setResults([]);
    toast.success("Relation added");
    router.refresh();
  };

  const remove = async (id: string) => {
    const prev = items;
    setItems(items.filter((r) => r.id !== id));
    const { error } = await supabase.from("relations").delete().eq("id", id);
    if (error) {
      setItems(prev);
      toast.error(error.message);
      return;
    }
    toast.success("Relation removed");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface-muted p-4 space-y-3">
        <p className="text-sm font-medium">Add a relationship</p>

        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
          <div className="relative">
            <Input
              leftIcon={<Search className="h-4 w-4" />}
              value={selected ? selected.full_name : search}
              onChange={(e) => {
                setSelected(null);
                setSearch(e.target.value);
              }}
              placeholder="Search by name or username"
            />
            {results.length > 0 && !selected && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-surface shadow-elevated max-h-60 overflow-y-auto">
                {results.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelected(p);
                      setResults([]);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-subtle"
                  >
                    <Avatar src={p.avatar_url} name={p.full_name} size={28} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.full_name}</p>
                      <p className="text-xs text-ink-subtle truncate">@{p.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Select
            value={relationType}
            onChange={(e) => setRelationType(e.target.value as RelationType)}
          >
            {RELATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {RELATION_META[t].label}
              </option>
            ))}
          </Select>

          <Button onClick={add} loading={busy} disabled={!selected}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No relationships yet"
          description="Add the people connected to you to see your network graph come alive."
        />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((r) => {
            const meta = RELATION_META[r.relation_type];
            return (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    src={r.related_profile.avatar_url}
                    name={r.related_profile.full_name}
                    size={36}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {r.related_profile.full_name}
                    </p>
                    <p className="text-xs text-ink-subtle truncate">
                      @{r.related_profile.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    tone="default"
                    style={{ background: `${meta.color}15`, color: meta.color }}
                  >
                    {meta.label}
                  </Badge>
                  <button
                    onClick={() => remove(r.id)}
                    className="rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove relation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
