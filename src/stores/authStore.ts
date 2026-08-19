import { create } from "zustand";
import type { AuthData, ParentUser } from "../auth/types";

type AuthState = {
  user: ParentUser | null;
  accessToken: string | null;
  isRestoring: boolean;
  selectedChildId: number | null;
  setSession: (session: AuthData) => void;
  clearSession: () => void;
  setRestoring: (isRestoring: boolean) => void;
  selectChild: (childId: number | null) => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isRestoring: true,
  selectedChildId: null,
  setSession: (session) => set({
    user: session.user,
    accessToken: session.accessToken,
    isRestoring: false,
  }),
  clearSession: () => set({
    user: null,
    accessToken: null,
    isRestoring: false,
    selectedChildId: null,
  }),
  setRestoring: (isRestoring) => set({ isRestoring }),
  selectChild: (selectedChildId) => set({ selectedChildId }),
}));
