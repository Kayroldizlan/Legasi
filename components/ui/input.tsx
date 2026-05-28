import * as React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Visible platform prefix (e.g. instagram.com/) — user types the handle only. */
  prefix?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      prefix,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const field = (
      <input
        id={inputId}
        ref={ref}
        className={cn(
          prefix ? "min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm focus:outline-none" : "input-base",
          !prefix && leftIcon && "pl-10",
          !prefix && rightIcon && "pr-10",
          error && !prefix && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          prefix && error && "text-red-600",
          className,
        )}
        {...props}
      />
    );

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-ink-muted"
          >
            {label}
          </label>
        )}
        {prefix ? (
          <div
            className={cn(
              "flex overflow-hidden rounded-xl border border-border bg-surface text-sm",
              "focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20",
              error && "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20",
            )}
          >
            <span className="inline-flex shrink-0 items-center border-r border-border bg-surface-subtle px-3 text-xs text-ink-subtle">
              {prefix}
            </span>
            {field}
          </div>
        ) : (
          <div className="relative">
            {leftIcon && (
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-subtle">
                {leftIcon}
              </span>
            )}
            {field}
            {rightIcon && (
              <span className="absolute inset-y-0 right-3 flex items-center text-ink-subtle">
                {rightIcon}
              </span>
            )}
          </div>
        )}
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="text-xs text-ink-subtle">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, rows = 4, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-ink-muted">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={cn(
            "input-base resize-y",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="text-xs text-ink-subtle">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, id, children, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-ink-muted">
            {label}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          className={cn(
            "input-base appearance-none pr-8 bg-[url('data:image/svg+xml;utf8,<svg fill=%22%23475569%22 xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22><path d=%22M5.516 7.548L10 12.032l4.484-4.484L16 9.064l-6 6-6-6z%22/></svg>')] bg-no-repeat bg-[length:18px_18px] bg-[right_0.5rem_center]",
            error && "border-red-500",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="text-xs text-ink-subtle">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Select.displayName = "Select";
