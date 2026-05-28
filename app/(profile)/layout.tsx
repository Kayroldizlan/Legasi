import { Suspense } from "react";

import { AppShell } from "@/components/layout/app-shell";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface-muted text-sm text-zinc-500">
          Loading profile…
        </div>
      }
    >
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
