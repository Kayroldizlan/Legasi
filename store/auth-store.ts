"use client";

import { create } from "zustand";

import type { Profile } from "@/types/database";

interface AuthState {
  profile: Profile | null;
  loading: boolean;
  setProfile: (profile: Profile | null) => void;
  patchProfile: (patch: Partial<Profile>) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  loading: true,
  setProfile: (profile) => set({ profile, loading: false }),
  patchProfile: (patch) =>
    set((state) =>
      state.profile ? { profile: { ...state.profile, ...patch } } : state,
    ),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ profile: null, loading: false }),
}));
