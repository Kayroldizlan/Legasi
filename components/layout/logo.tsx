"use client";

import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { LogoMark } from "./logo-mark";
import { LogoWordmark } from "./logo-wordmark";

export function Logo({
  className,
  href = "/",
  variant = "full",
  inverted = false,
}: {
  className?: string;
  href?: string;
  variant?: "full" | "mark";
  inverted?: boolean;
}) {
  const isMarkOnly = variant === "mark";

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label={APP_NAME}
    >
      <LogoMark />
      {!isMarkOnly && <LogoWordmark inverted={inverted} />}
    </Link>
  );
}
