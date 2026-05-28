import { Home, RefreshCw, WifiOff } from "lucide-react";
import Link from "next/link";

import { LinkButton } from "@/components/ui";

export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-surface-muted">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
        <WifiOff className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">
        You&apos;re offline
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        ConnectDirectory needs a network connection for messaging and live
        updates. Cached pages may still be available.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:bg-surface-subtle"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </Link>
        <LinkButton href="/" variant="primary">
          <Home className="h-4 w-4" />
          Go home
        </LinkButton>
      </div>
    </div>
  );
}
