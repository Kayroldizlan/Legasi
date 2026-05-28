import { Suspense } from "react";

import { DirectoryShell } from "@/components/directory/directory-shell";

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface-muted text-sm text-zinc-500">
          Loading directory…
        </div>
      }
    >
      <DirectoryShell>{children}</DirectoryShell>
    </Suspense>
  );
}
