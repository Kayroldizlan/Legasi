"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { LinkButton } from "@/components/ui";
import { NAV_LINKS_PUBLIC } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function PublicNavbar() {
  const profile = useAuthStore((s) => s.profile);
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const isDarkMarketing = pathname === "/" || pathname === "/about";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur",
        isDarkMarketing
          ? "border-white/10 bg-[#050505]/85"
          : "border-border bg-surface/80",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo inverted={isDarkMarketing} />

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS_PUBLIC.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg transition",
                isDarkMarketing
                  ? "text-zinc-400 hover:bg-white/5 hover:text-white"
                  : "text-ink-muted hover:bg-surface-subtle hover:text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!isDarkMarketing && <ThemeToggle />}
          {profile ? (
            <UserMenu />
          ) : (
            <>
              <LinkButton
                href="/login"
                variant="ghost"
                size="sm"
                className={cn(
                  "hidden sm:inline-flex",
                  isDarkMarketing && "text-zinc-300 hover:bg-white/10 hover:text-white",
                )}
              >
                Log in
              </LinkButton>
              <LinkButton
                href="/register"
                variant="primary"
                size="sm"
                className={isDarkMarketing ? "shadow-[0_0_20px_rgb(239_68_68/0.2)]" : undefined}
              >
                Join Legasi
              </LinkButton>
            </>
          )}
          <button
            className={cn(
              "md:hidden ml-1 flex h-9 w-9 items-center justify-center rounded-xl border",
              isDarkMarketing ? "border-white/15 text-white" : "border-border",
            )}
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className={cn(
            "md:hidden border-t px-4 py-3 space-y-1",
            isDarkMarketing
              ? "border-white/10 bg-[#050505]"
              : "border-border bg-surface",
          )}
        >
          {NAV_LINKS_PUBLIC.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-lg text-sm font-medium",
                isDarkMarketing
                  ? "text-zinc-400 hover:bg-white/5 hover:text-white"
                  : "text-ink-muted hover:bg-surface-subtle hover:text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
          {profile && (
            <>
              <div className="my-2 h-px bg-border" />
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium",
                  isDarkMarketing
                    ? "text-zinc-400 hover:bg-white/5 hover:text-white"
                    : "text-ink-muted hover:bg-surface-subtle hover:text-ink",
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium",
                  isDarkMarketing
                    ? "text-zinc-400 hover:bg-white/5 hover:text-white"
                    : "text-ink-muted hover:bg-surface-subtle hover:text-ink",
                )}
              >
                Settings
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
