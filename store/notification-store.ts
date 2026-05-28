"use client";

import { create } from "zustand";

import type { NotificationRow } from "@/types/database";

interface NotificationState {
  items: NotificationRow[];
  unreadCount: number;
  setAll: (items: NotificationRow[]) => void;
  prepend: (item: NotificationRow) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  unreadCount: 0,
  setAll: (items) =>
    set({ items, unreadCount: items.filter((n) => !n.is_read).length }),
  prepend: (item) =>
    set((state) => ({
      items: [item, ...state.items],
      unreadCount: state.unreadCount + (item.is_read ? 0 : 1),
    })),
  markRead: (id) =>
    set((state) => {
      const items = state.items.map((n) =>
        n.id === id ? { ...n, is_read: true } : n,
      );
      return { items, unreadCount: items.filter((n) => !n.is_read).length };
    }),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),
}));
