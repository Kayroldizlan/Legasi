"use client";

import { Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { useUIStore } from "@/store/ui-store";

import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function AppTopbar({ title }: { title?: string }) {
  const toggle = useUIStore((s) => s.toggleSidebar);
  const router = useRouter();
  const [q, setQ] = React.useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const value = q.trim();
    if (!value) return;
    router.push(`/directory?q=${encodeURIComponent(value)}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur lg:px-6">
      <button
        onClick={toggle}
        className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {title && (
        <h1 className="hidden sm:block text-base font-semibold text-ink">
          {title}
        </h1>
      )}

      <form onSubmit={onSearch} className="ml-auto flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people, jobs, companies…"
            className="input-base pl-10"
          />
        </div>
      </form>

      <div className="ml-auto md:ml-0 flex items-center gap-2">
        <ThemeToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
