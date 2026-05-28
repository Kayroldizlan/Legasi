"use client";

import { Plus, Search, Trash2 } from "lucide-react";
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
import {
  addRelationAction,
  removeRelationAction,
} from "@/lib/actions/relations";
import { RELATION_META, RELATION_TYPES } from "@/lib/constants";

import type {
  Profile,
  RelationType,
  RelationWithProfile,
} from "@/types/database";

interface Props {
  initial: RelationWithProfile[];
  connectionProfiles: Profile[];
}

export function RelationsManager({
  initial,
  connectionProfiles,
}: Props) {
  const [items, setItems] = React.useState(initial);
  const [search, setSearch] = React.useState("");
  const [results, setResults] = React.useState<Profile[]>([]);
  const [selected, setSelected] = React.useState<Profile | null>(null);
  const [relationType, setRelationType] = React.useState<RelationType>("friend");
  const [busy, setBusy] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const availableConnections = React.useMemo(() => {
    const relatedIds = new Set(items.map((r) => r.related_user_id));
    return connectionProfiles.filter((p) => !relatedIds.has(p.id));
  }, [connectionProfiles, items]);

  React.useEffect(() => {
    const q = search.trim().toLowerCase();
    const pool = q
      ? availableConnections.filter(
          (p) =>
            p.full_name.toLowerCase().includes(q) ||
            p.username.toLowerCase().includes(q),
        )
      : availableConnections;

    setResults(pool.slice(0, 8));
  }, [search, availableConnections]);

  const add = async () => {
    if (!selected || busy) return;
    setBusy(true);
    try {
      const result = await addRelationAction(selected.id, relationType);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setItems((prev) => [result.data, ...prev]);
      setSelected(null);
      setSearch("");
      setDropdownOpen(false);
      toast.success("Relation added");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    const prev = items;
    setItems(items.filter((r) => r.id !== id));
    const result = await removeRelationAction(id);
    if (!result.success) {
      setItems(prev);
      toast.error(result.error);
      return;
    }
    toast.success("Relation removed");
  };

  const showDropdown = dropdownOpen && results.length > 0 && !selected;

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
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setDropdownOpen(false), 150);
              }}
              placeholder="Search your connections"
            />
            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-surface shadow-elevated max-h-60 overflow-y-auto">
                {results.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelected(p);
                      setSearch("");
                      setDropdownOpen(false);
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
            {dropdownOpen && !selected && availableConnections.length === 0 && (
              <p className="mt-2 text-xs text-ink-subtle">
                Accept connection requests first, then add them here as relationships.
              </p>
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

          <Button onClick={add} loading={busy} disabled={!selected || busy}>
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
