"use client";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  Image as ImageIcon,
  LayoutDashboard,
  type LucideIcon,
  MessageSquare,
  Network,
  Settings,
  Shield,
  Sparkles,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_LINKS_ADMIN, NAV_LINKS_PRIVATE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";
import { useUIStore } from "@/store/ui-store";

import { Logo } from "./logo";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  UserPlus,
  MessageSquare,
  Bell,
  Settings,
  Network,
  BarChart3,
  Activity,
  Image: ImageIcon,
  Shield,
};

interface SidebarProps {
  variant?: "user" | "admin";
}

export function Sidebar({ variant = "user" }: SidebarProps) {
  const profile = useAuthStore((s) => s.profile);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const unreadNotifications = useNotificationStore((s) => s.unreadCount);
  const pathname = usePathname();

  const links = variant === "admin" ? NAV_LINKS_ADMIN : NAV_LINKS_PRIVATE;
  const showAdminEntry = variant === "user" && profile?.role === "admin";

  // Per-link badge counts (shown as small red pills, matching the mockup).
  const badges: Record<string, number | undefined> = {
    "/notifications": unreadNotifications > 0 ? unreadNotifications : undefined,
  };

  const Content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5 border-b border-border">
        <Logo />
        <button
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {variant === "admin" && (
          <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
            Admin
          </p>
        )}
        {links.map((link) => {
          const Icon = ICONS[link.icon] ?? Users;
          const active =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href + "/")) ||
            (link.href === "/admin" && pathname === "/admin");
          const badge = badges[link.href];
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-brand-600 text-white shadow-soft dark:bg-brand-600"
                  : "text-ink-muted hover:bg-surface-subtle hover:text-ink",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-white" : "")} />
              <span className="flex-1">{link.label}</span>
              {badge !== undefined && (
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-brand-600 text-white",
                  )}
                >
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}

        {showAdminEntry && (
          <>
            <div className="my-3 h-px bg-border" />
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-subtle hover:text-ink"
            >
              <Shield className="h-4 w-4" />
              Admin panel
            </Link>
          </>
        )}
      </nav>

      <div className="border-t border-border p-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-white">
          <Sparkles
            className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 text-white/10"
            aria-hidden
          />
          <p className="text-sm font-semibold">Upgrade to Premium</p>
          <p className="mt-1 text-xs leading-snug text-white/85">
            Unlock more features and grow your network faster.
          </p>
          <Link
            href="/settings"
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-soft transition hover:bg-white/90"
          >
            Upgrade Now <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-border bg-surface">
        {Content}
      </aside>

      {/* Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface border-r border-border shadow-elevated animate-fade-in">
            {Content}
          </aside>
        </div>
      )}
    </>
  );
}
