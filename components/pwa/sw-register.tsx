"use client";

import { useEffect } from "react";

/**
 * Registers the Serwist-generated service worker in production.
 */
export function SwRegister() {
  useEffect(() => {
    // TEMP (debugging profile save flow): disable SW caching in all
    // environments and actively unregister existing workers to avoid
    // serving stale JS bundles.
    if (!("serviceWorker" in navigator)) return;

    void (async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));

      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    })();
  }, []);

  return null;
}
