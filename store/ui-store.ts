"use client";

import { create } from "zustand";

import type { ViewMode } from "@/types";

interface UIState {
  sidebarOpen: boolean;
  directoryView: ViewMode;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setDirectoryView: (mode: ViewMode) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  directoryView: "grid",
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setDirectoryView: (mode) => set({ directoryView: mode }),
}));
