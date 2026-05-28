import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

import { UserAdminTable } from "./users-table";

import type { ProfileStatus } from "@/types/database";

export const metadata: Metadata = { title: "Admin · Users" };

interface PageProps {
  searchParams: Promise<{ q?: string; status?: ProfileStatus }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (sp.q) {
    const q = sp.q.replace(/[%,]/g, "");
    query = query.or(`full_name.ilike.%${q}%,username.ilike.%${q}%,email.ilike.%${q}%`);
  }
  if (sp.status) query = query.eq("status", sp.status);

  const { data: users } = await query;

  return (
    <div className="container py-8 lg:py-10 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-ink-muted">
          Search, edit, approve, and remove members.
        </p>
      </header>

      <UserAdminTable initial={users ?? []} initialQuery={sp.q ?? ""} initialStatus={sp.status} />
    </div>
  );
}
