"use client";

import { Download, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

/**
 * Shows a native "Install app" banner when the browser fires beforeinstallprompt.
 * Hidden when already running as an installed PWA.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] =
    React.useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = React.useState(false);
  const [isStandalone, setIsStandalone] = React.useState(false);

  React.useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      ("standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone === true);
    setIsStandalone(standalone);

    const dismissedKey = "cd-pwa-install-dismissed";
    if (sessionStorage.getItem(dismissedKey)) {
      setDismissed(true);
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setDeferred(null);
    setDismissed(true);
    sessionStorage.setItem("cd-pwa-install-dismissed", "1");
  };

  const dismiss = () => {
    setDismissed(true);
    setDeferred(null);
    sessionStorage.setItem("cd-pwa-install-dismissed", "1");
  };

  if (isStandalone || dismissed || !deferred) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-fade-in",
        "rounded-2xl border border-border bg-surface p-4 shadow-elevated",
        "sm:left-auto sm:right-4",
      )}
      role="dialog"
      aria-label="Install app"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink">Install {APP_NAME}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            Add to your home screen for faster access and an app-like experience.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={install}>
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="rounded-lg p-1 text-ink-muted hover:bg-surface-subtle"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
