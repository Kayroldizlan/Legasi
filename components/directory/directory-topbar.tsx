"use client";

import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { LinkButton } from "@/components/ui";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";

export function DirectoryTopbar() {
  const router = useRouter();
  const params = useSearchParams();
  const profile = useAuthStore((s) => s.profile);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const [query, setQuery] = React.useState(params.get("q") ?? "");

  React.useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams(params);
    const value = query.trim();
    if (value) next.set("q", value);
    else next.delete("q");
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `/directory?${qs}` : "/directory");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-zinc-100 bg-white/90 px-4 backdrop-blur lg:px-6">
      <button
        type="button"
        onClick={toggleSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <form onSubmit={onSubmit} className="mx-auto hidden w-full max-w-xl md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, families, businesses, communities…"
            className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-16 text-sm text-ink placeholder:text-zinc-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/15"
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] text-zinc-400 sm:inline">
            ⌘K
          </span>
        </div>
      </form>

      <div className="ml-auto flex items-center gap-2">
        {profile ? (
          <>
            <NotificationBell />
            <Link
              href="/messages"
              className="hidden h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 sm:inline-flex"
              aria-label="Messages"
            >
              <MessageSquareIcon />
            </Link>
            <UserMenu />
          </>
        ) : (
          <>
            <LinkButton href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
              Log in
            </LinkButton>
            <LinkButton href="/register" variant="primary" size="sm">
              Join Legasi
            </LinkButton>
          </>
        )}
      </div>
    </header>
  );
}

function MessageSquareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}
