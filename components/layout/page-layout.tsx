import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  avatar,
  action,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  avatar?: { src: string | null; name: string };
  action?: React.ReactNode;
}) {
  return (
    <section className="border-b border-zinc-100 bg-white">
      <div className="px-4 py-8 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {avatar && (
              <Avatar src={avatar.src} name={avatar.name} size={64} ring />
            )}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                {eyebrow}
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-sm text-zinc-500">{description}</p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </section>
  );
}

export interface PageStatItem {
  icon: LucideIcon;
  label: string;
  value: number | string;
  href?: string;
  accent?: string;
}

export function PageStatsBar({ stats }: { stats: PageStatItem[] }) {
  return (
    <section className="border-b border-zinc-100 bg-zinc-50/80">
      <div className="grid grid-cols-2 gap-3 px-4 py-5 lg:grid-cols-4 lg:px-8">
        {stats.map(({ icon: Icon, label, value, href, accent }) => {
          const inner = (
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-4 transition hover:shadow-soft">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600",
                  accent,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 sm:text-xs">
                  {label}
                </p>
                <p className="text-xl font-semibold text-ink">{value}</p>
              </div>
            </div>
          );

          return href ? (
            <Link key={label} href={href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={label}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}

export function PageContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-8 px-4 py-8 lg:px-8 lg:py-10", className)}>
      {children}
    </div>
  );
}

export function PageSection({
  title,
  description,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[1.25rem] border border-zinc-200 bg-white shadow-soft",
        className,
      )}
    >
      <div className="border-b border-zinc-100 px-6 py-5">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        )}
      </div>
      <div className={cn("p-6", bodyClassName)}>{children}</div>
    </section>
  );
}
