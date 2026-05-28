"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { DirectoryTopbar } from "@/components/directory/directory-topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-muted">
      <Sidebar variant="user" />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
        <DirectoryTopbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
