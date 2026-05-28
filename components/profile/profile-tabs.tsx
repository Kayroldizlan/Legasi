"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: React.ReactNode;
}

interface ProfileTabsProps {
  tabs: TabItem[];
  /** Pre-rendered content for each tab id. Keys must match `tabs[].id`. */
  panels: Record<string, React.ReactNode>;
  defaultTab?: string;
}

/**
 * Underline-style tabs for the public profile page.
 *
 * Renders an "About / Connections / Network / Posts / Media"-style horizontal
 * tab strip with a red active underline. Panels are pre-rendered on the server
 * and shown/hidden client-side, so the heavy data fetching stays on the
 * server.
 */
export function ProfileTabs({ tabs, panels, defaultTab }: ProfileTabsProps) {
  const [active, setActive] = React.useState(defaultTab ?? tabs[0]?.id);

  return (
    <div>
      <div
        role="tablist"
        className="flex w-full items-center gap-1 overflow-x-auto border-b border-border"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className={cn(
                "relative shrink-0 px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "text-ink"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "absolute inset-x-3 -bottom-px h-0.5 rounded-full transition",
                  isActive ? "bg-brand-600" : "bg-transparent",
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <div
              key={tab.id}
              role="tabpanel"
              hidden={!isActive}
              className={isActive ? "animate-fade-in" : ""}
            >
              {panels[tab.id]}
            </div>
          );
        })}
      </div>
    </div>
  );
}
