import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setToken: (token: string) => void;
  clearToken: () => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,

      setToken: (token: string) => {
        set({ accessToken: token, isAuthenticated: true }, false, "auth/setToken");
      },

      clearToken: () => {
        set({ accessToken: null, isAuthenticated: false }, false, "auth/clearToken");
      },
    }),
    { 
      name: "AuthStore", 
      enabled: import.meta.env.DEV 
    }
  )
);
