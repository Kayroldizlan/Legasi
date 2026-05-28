"use client";

import {
  CheckCircle2,
  Search,
  ShieldCheck,
  Trash2,
  UserX,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import * as React from "react";
import toast from "react-hot-toast";

import { Avatar, Badge, Button, Card, Input, Select } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils";

import type { Profile, ProfileStatus } from "@/types/database";

interface Props {
  initial: Profile[];
  initialQuery: string;
  initialStatus?: ProfileStatus;
}

export function UserAdminTable({ initial, initialQuery, initialStatus }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const supabase = createClient();

  const [items, setItems] = React.useState(initial);
  const [q, setQ] = React.useState(initialQuery);
  const [status, setStatus] = React.useState<ProfileStatus | "">(initialStatus ?? "");

  React.useEffect(() => setItems(initial), [initial]);

  const applyFilters = () => {
    const next = new URLSearchParams(params);
    q ? next.set("q", q) : next.delete("q");
    status ? next.set("status", status) : next.delete("status");
    router.push(`${pathname}?${next.toString()}`);
  };

  const updateStatus = async (id: string, value: ProfileStatus) => {
    const prev = items;
    setItems(items.map((u) => (u.id === id ? { ...u, status: value } : u)));
    const { error } = await supabase
      .from("profiles")
      .update({ status: value } as never)
      .eq("id", id);
    if (error) {
      setItems(prev);
      toast.error(error.message);
      return;
    }
    await supabase.from("activity_logs").insert({
      action: `profile_status_${value}`,
      target_id: id,
      target_type: "profile",
    } as never);
    toast.success(`Marked ${value}`);
  };

  const toggleVerified = async (id: string, current: boolean) => {
    setItems(items.map((u) => (u.id === id ? { ...u, is_verified: !current } : u)));
    await supabase.from("profiles").update({ is_verified: !current } as never).eq("id", id);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this user? This action cannot be undone.")) return;
    setItems(items.filter((u) => u.id !== id));
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("User deleted");
    await supabase.from("activity_logs").insert({
      action: "profile_deleted",
      target_id: id,
      target_type: "profile",
    } as never);
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input
          leftIcon={<Search className="h-4 w-4" />}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, username, or email"
          className="sm:max-w-sm"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProfileStatus | "")}
          className="sm:w-44"
        >
          <option value="">All statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </Select>
        <Button variant="secondary" onClick={applyFilters}>Apply</Button>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-ink-subtle">
              <th className="py-2 font-medium">Member</th>
              <th className="py-2 font-medium hidden md:table-cell">Email</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium hidden lg:table-cell">Joined</th>
              <th className="py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((u) => (
              <tr key={u.id} className="align-middle">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={u.avatar_url} name={u.full_name} size={36} />
                    <div className="min-w-0">
                      <p className="font-semibold truncate flex items-center gap-1">
                        {u.full_name}
                        {u.is_verified && <CheckCircle2 className="h-3 w-3 text-brand-600" />}
                      </p>
                      <p className="text-xs text-ink-subtle truncate">@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 hidden md:table-cell text-ink-muted">{u.email}</td>
                <td className="py-3">
                  <Badge
                    tone={
                      u.status === "approved"
                        ? "success"
                        : u.status === "pending"
                          ? "warning"
                          : u.status === "rejected"
                            ? "danger"
                            : "muted"
                    }
                  >
                    {u.status}
                  </Badge>
                  {u.role === "admin" && (
                    <Badge tone="brand" className="ml-1">Admin</Badge>
                  )}
                </td>
                <td className="py-3 hidden lg:table-cell text-ink-subtle text-xs">
                  {formatRelativeTime(u.created_at)}
                </td>
                <td className="py-3">
                  <div className="flex justify-end gap-1">
                    <IconBtn
                      label="Verify"
                      onClick={() => toggleVerified(u.id, u.is_verified)}
                      active={u.is_verified}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </IconBtn>
                    {u.status !== "approved" && (
                      <IconBtn label="Approve" onClick={() => updateStatus(u.id, "approved")}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </IconBtn>
                    )}
                    {u.status !== "rejected" && (
                      <IconBtn label="Reject" onClick={() => updateStatus(u.id, "rejected")}>
                        <XCircle className="h-3.5 w-3.5" />
                      </IconBtn>
                    )}
                    {u.status !== "suspended" && (
                      <IconBtn label="Suspend" onClick={() => updateStatus(u.id, "suspended")}>
                        <UserX className="h-3.5 w-3.5" />
                      </IconBtn>
                    )}
                    <IconBtn label="Delete" danger onClick={() => remove(u.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-subtle">No matching users.</p>
        )}
      </div>
    </Card>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  active,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : active
            ? "bg-brand-50 text-brand-700"
            : "text-ink-muted hover:bg-surface-subtle"
      }`}
    >
      {children}
    </button>
  );
}
