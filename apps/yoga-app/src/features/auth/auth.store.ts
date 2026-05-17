import { create } from "zustand";
import { type UserRole } from "@yoga-app/shared";

type AuthStore = {
  authUser: string | null;
  authRole: UserRole | null;
  setAuthUser: (payload: { authUser: string; authRole: UserRole }) => void;
  clearAuthUser: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  authUser: null,
  authRole: null,
  setAuthUser: ({ authUser, authRole }) => set({ authUser, authRole }),
  clearAuthUser: () => set({ authUser: null, authRole: null }),
}));
