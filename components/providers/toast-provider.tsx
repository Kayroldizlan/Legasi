"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "!bg-surface !text-ink !border !border-border !shadow-soft",
        duration: 3500,
        success: {
          iconTheme: { primary: "#10b981", secondary: "white" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "white" },
        },
      }}
    />
  );
}
