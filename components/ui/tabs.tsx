"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export function Tabs({
  defaultValue,
  value: controlled,
  onValueChange,
  children,
  className,
}: {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [internal, setInternal] = React.useState(defaultValue);
  const value = controlled ?? internal;
  const setValue = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  children,
  variant = "default",
}: {
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "pill";
}) {
  return (
    <div
      className={cn(
        variant === "pill"
          ? "flex flex-wrap gap-2"
          : "inline-flex rounded-xl bg-surface-subtle p-1 gap-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  className,
  children,
  variant = "default",
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "pill";
}) {
  const ctx = React.useContext(TabsContext)!;
  const active = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={cn(
        "text-sm font-medium transition",
        variant === "pill"
          ? cn(
              "rounded-full border px-4 py-2",
              active
                ? "border-brand-600 bg-brand-600 text-white shadow-[0_8px_20px_rgb(239_68_68/0.18)]"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50",
            )
          : cn(
              "rounded-lg px-3 py-1.5",
              active
                ? "bg-surface text-ink shadow-soft"
                : "text-ink-muted hover:text-ink",
            ),
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(TabsContext)!;
  if (ctx.value !== value) return null;
  return <div className={cn("mt-4 animate-fade-in", className)}>{children}</div>;
}
