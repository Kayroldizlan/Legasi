import { redirect } from "next/navigation";

import { AppTopbar } from "@/components/layout/app-topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <Sidebar variant="admin" />
      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <AppTopbar title="Admin" />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
