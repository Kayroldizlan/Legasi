"use client";

import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { ProfileCard } from "@/components/profile/profile-card";
import { EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils";

import type { Profile } from "@/types/database";
import type { PaginatedResult } from "@/types";

interface Props {
  result: PaginatedResult<Profile>;
  view: string;
}

export function DirectoryResults({ result, view }: Props) {
  if (result.data.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members found"
        description="Try adjusting your filters or search query."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-ink-muted">
        Showing <strong className="text-ink">{result.data.length}</strong> of{" "}
        <strong className="text-ink">{result.total}</strong> members
      </div>

      {view === "list" ? (
        <div className="space-y-3">
          {result.data.map((p) => (
            <ProfileCard key={p.id} profile={p} variant="list" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.data.map((p) => (
            <ProfileCard key={p.id} profile={p} variant="grid" />
          ))}
        </div>
      )}

      {result.totalPages > 1 && <Pagination total={result.totalPages} current={result.page} />}
    </div>
  );
}

function Pagination({ total, current }: { total: number; current: number }) {
  const params = useSearchParams();
  const pathname = usePathname();

  const buildHref = (page: number) => {
    const next = new URLSearchParams(params);
    if (page <= 1) next.delete("page");
    else next.set("page", String(page));
    return `${pathname}?${next.toString()}`;
  };

  const pages = (() => {
    const around = 1;
    const items: (number | "ellipsis")[] = [];
    for (let p = 1; p <= total; p++) {
      if (
        p === 1 ||
        p === total ||
        (p >= current - around && p <= current + around)
      ) {
        items.push(p);
      } else if (items[items.length - 1] !== "ellipsis") {
        items.push("ellipsis");
      }
    }
    return items;
  })();

  return (
    <nav className="flex items-center justify-center gap-1.5">
      <PaginationLink
        href={buildHref(Math.max(1, current - 1))}
        disabled={current === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </PaginationLink>
      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="px-2 text-ink-subtle">
            …
          </span>
        ) : (
          <PaginationLink key={p} href={buildHref(p)} active={p === current}>
            {p}
          </PaginationLink>
        ),
      )}
      <PaginationLink
        href={buildHref(Math.min(total, current + 1))}
        disabled={current === total}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  href,
  active,
  disabled,
  children,
  ...rest
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLAnchorElement>) {
  if (disabled) {
    return (
      <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm text-ink-subtle opacity-50">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-medium border border-border",
        active
          ? "bg-brand-600 text-white border-brand-600"
          : "bg-surface text-ink hover:bg-surface-subtle",
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}
