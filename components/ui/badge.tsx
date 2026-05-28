import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "brand" | "success" | "warning" | "danger" | "muted";

const tones: Record<Tone, string> = {
  default: "bg-surface-subtle text-ink",
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  danger: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  muted: "bg-surface-muted text-ink-muted",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
