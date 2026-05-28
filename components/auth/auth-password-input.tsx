"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface AuthPasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

export const AuthPasswordInput = React.forwardRef<
  HTMLInputElement,
  AuthPasswordInputProps
>(function AuthPasswordInput(
  { label, error, className, id, ...props },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-ink"
      >
        {label}
      </label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
        <input
          id={inputId}
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(
            "input-base pl-10 pr-11",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle transition hover:text-ink"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
});
