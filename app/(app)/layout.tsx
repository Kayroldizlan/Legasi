import { redirect } from "next/navigation";

import { AppTopbar } from "@/components/layout/app-topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <Sidebar variant="user" />
      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <AppTopbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
