import Image from "next/image";

import { cn } from "@/lib/utils";

const MARK_SIZE = 36;

/** Lion icon only — wordmark stays as real HTML text in `Logo`. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      width={MARK_SIZE}
      height={MARK_SIZE}
      priority
      aria-hidden
      className={cn("h-9 w-9 shrink-0 object-contain", className)}
    />
  );
}
