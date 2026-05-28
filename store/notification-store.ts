"use client";

import { create } from "zustand";

import type { NotificationRow } from "@/types/database";

interface NotificationState {
  items: NotificationRow[];
  unreadCount: number;
  hydrated: boolean;
  setAll: (items: NotificationRow[]) => void;
  prepend: (item: NotificationRow) => void;
  upsert: (item: NotificationRow) => void;
  remove: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setUnreadCount: (count: number) => void;
  setHydrated: (value: boolean) => void;
}

function countUnread(items: NotificationRow[]) {
  return items.filter((item) => !item.is_read).length;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  unreadCount: 0,
  hydrated: false,
  setAll: (items) =>
    set({ items, unreadCount: countUnread(items), hydrated: true }),
  prepend: (item) =>
    set((state) => {
      const withoutDuplicate = state.items.filter((n) => n.id !== item.id);
      const items = [item, ...withoutDuplicate];
      return { items, unreadCount: countUnread(items) };
    }),
  upsert: (item) =>
    set((state) => {
      const index = state.items.findIndex((n) => n.id === item.id);
      const items =
        index === -1
          ? [item, ...state.items]
          : state.items.map((n) => (n.id === item.id ? item : n));
      return { items, unreadCount: countUnread(items) };
    }),
  remove: (id) =>
    set((state) => {
      const items = state.items.filter((n) => n.id !== id);
      return { items, unreadCount: countUnread(items) };
    }),
  markRead: (id) =>
    set((state) => {
      const items = state.items.map((n) =>
        n.id === id ? { ...n, is_read: true } : n,
      );
      return { items, unreadCount: countUnread(items) };
    }),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),
  setUnreadCount: (count) => set({ unreadCount: count }),
  setHydrated: (value) => set({ hydrated: value }),
}));
