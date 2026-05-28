"use client";

import {
  LogOut,
  Settings,
  Shield,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import toast from "react-hot-toast";

import { Avatar } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { buildProfileUrl } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export function UserMenu() {
  const profile = useAuthStore((s) => s.profile);
  const reset = useAuthStore((s) => s.reset);
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!profile) return null;

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    reset();
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-border bg-surface p-1 pr-3 hover:bg-surface-subtle"
      >
        <Avatar src={profile.avatar_url} name={profile.full_name} size={28} />
        <span className="hidden sm:block text-sm font-medium text-ink">
          {profile.full_name.split(" ")[0]}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-border bg-surface shadow-elevated overflow-hidden animate-fade-in">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold">{profile.full_name}</p>
            <p className="truncate text-xs text-ink-subtle">@{profile.username}</p>
          </div>
          <div className="py-1">
            <MenuItem href={buildProfileUrl(profile.username)} icon={UserIcon} label="View profile" onClick={() => setOpen(false)} />
            <MenuItem href="/settings" icon={Settings} label="Settings" onClick={() => setOpen(false)} />
            {profile.role === "admin" && (
              <MenuItem href="/admin" icon={Shield} label="Admin panel" onClick={() => setOpen(false)} />
            )}
          </div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: typeof UserIcon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-surface-subtle"
    >
      <Icon className="h-4 w-4 text-ink-muted" />
      {label}
    </Link>
  );
}
