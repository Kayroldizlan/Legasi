"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Avatar, LinkButton } from "@/components/ui";
import { NAV_LINKS_PUBLIC } from "@/lib/constants";
import { useAuthStore } from "@/store/auth-store";

import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export function PublicNavbar() {
  const profile = useAuthStore((s) => s.profile);
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS_PUBLIC.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm font-medium text-ink-muted rounded-lg hover:bg-surface-subtle hover:text-ink transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {profile ? (
            <LinkButton
              href="/dashboard"
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Avatar src={profile.avatar_url} name={profile.full_name} size={22} />
              <span className="ml-1">Dashboard</span>
            </LinkButton>
          ) : (
            <>
              <LinkButton
                href="/login"
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                Sign in
              </LinkButton>
              <LinkButton href="/register" variant="primary" size="sm">
                Get started
              </LinkButton>
            </>
          )}
          <button
            className="md:hidden ml-1 flex h-9 w-9 items-center justify-center rounded-xl border border-border"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border bg-surface px-4 py-3 space-y-1">
          {NAV_LINKS_PUBLIC.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-ink-muted hover:bg-surface-subtle hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
