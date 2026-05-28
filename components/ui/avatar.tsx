"use client";

import Image from "next/image";
import * as React from "react";

import { cn, colorFromString, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  ring?: boolean;
  online?: boolean;
}

export function Avatar({
  src,
  name,
  size = 40,
  className,
  ring,
  online,
}: AvatarProps) {
  const [errored, setErrored] = React.useState(false);
  const initials = getInitials(name);
  const bg = colorFromString(name || src || "?");
  const showImage = src && !errored;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full text-white font-semibold",
        ring && "ring-2 ring-surface ring-offset-2 ring-offset-surface-muted",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: showImage ? undefined : bg,
        fontSize: Math.max(10, size * 0.36),
      }}
    >
      {showImage ? (
        <Image
          src={src}
          alt={name || "avatar"}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
          unoptimized={src.startsWith("data:")}
        />
      ) : (
        <span>{initials}</span>
      )}
      {online && (
        <span
          className="absolute right-0 bottom-0 block rounded-full bg-emerald-500 ring-2 ring-surface"
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </span>
  );
}
