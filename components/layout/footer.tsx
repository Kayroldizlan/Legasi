import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm text-ink-muted max-w-xs">
            A modern professional directory built for teams, communities, and
            networks that value real connections.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
            Product
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-brand-600" href="/directory">Directory</Link></li>
            <li><Link className="hover:text-brand-600" href="/about">About</Link></li>
            <li><Link className="hover:text-brand-600" href="/register">Sign up</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
            Account
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-brand-600" href="/login">Sign in</Link></li>
            <li><Link className="hover:text-brand-600" href="/forgot-password">Forgot password</Link></li>
            <li><Link className="hover:text-brand-600" href="/dashboard">Dashboard</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
            Legal
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-brand-600" href="/about">Terms</Link></li>
            <li><Link className="hover:text-brand-600" href="/about">Privacy</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-subtle">
          <span>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
          <span>Built with Next.js · Supabase · React Flow</span>
        </div>
      </div>
    </footer>
  );
}
