import { LOGO_WORDMARK } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LogoWordmark({
  className,
  inverted = false,
}: {
  className?: string;
  /** White text on dark backgrounds (auth panel, etc.). */
  inverted?: boolean;
}) {
  return (
    <span
      className={cn(
        "text-base font-semibold tracking-tight",
        inverted ? "text-white" : "text-ink",
        className,
      )}
    >
      {LOGO_WORDMARK}
    </span>
  );
}
