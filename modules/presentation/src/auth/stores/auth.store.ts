import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setToken: (token: string) => void;
  clearToken: () => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  isAuthenticated: false,

  setToken: (token: string) => {
    set({ accessToken: token, isAuthenticated: true });
  },

  clearToken: () => {
    set({ accessToken: null, isAuthenticated: false });
  },
}));
