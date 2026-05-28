"use client";

import {
  Activity,
  BarChart3,
  Compass,
  Image as ImageIcon,
  LayoutDashboard,
  type LucideIcon,
  MessageSquare,
  Network,
  Settings,
  Shield,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_LINKS_ADMIN, NAV_LINKS_PRIVATE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";

import { Logo } from "./logo";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  UserPlus,
  MessageSquare,
  Compass,
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
  const pathname = usePathname();

  const links = variant === "admin" ? NAV_LINKS_ADMIN : NAV_LINKS_PRIVATE;
  const showAdminEntry = variant === "user" && profile?.role === "admin";

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
