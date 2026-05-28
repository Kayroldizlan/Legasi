import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  variant = "full",
}: {
  className?: string;
  href?: string;
  variant?: "full" | "mark";
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="12" cy="18" r="2.5" />
          <path d="M6 8.5l5.4 7.2M18 8.5l-5.4 7.2M8 6h8" />
        </svg>
      </span>
      {variant === "full" && (
        <span className="text-base font-semibold tracking-tight text-ink">
          {APP_NAME}
        </span>
      )}
    </Link>
  );
}
