import { createContext, useContext } from "react";
import type {
  Login,
  Refresh,
  Logout,
} from "@core/auth/applications/usecases/auth.usecase";
import type { GetResellers, CreateReseller } from "@core/reseller/applications/usecases/reseller.usecase";

// ──────────────────────────────────────────────
// Module Use Case Types
// Tambahkan interface baru di sini saat modul bertambah.
// ──────────────────────────────────────────────

export interface AuthUseCases {
  loginUseCase: Login;
  refreshUseCase: Refresh;
  logoutUseCase: Logout;
}

export interface GetResellerUseCases {
  getResellersUseCase: GetResellers;
  createResellerUseCase: CreateReseller;
}

// ──────────────────────────────────────────────
// App Container
// Gabungan seluruh modul. Satu property per modul.
// ──────────────────────────────────────────────

export interface AppContainer {
  auth: AuthUseCases;
  reseller: GetResellerUseCases;
}

// ──────────────────────────────────────────────
// React Context (Single)
// ──────────────────────────────────────────────

export const DIContext = createContext<AppContainer | null>(null);

/**
 * useDI
 * Base hook untuk mengakses seluruh container.
 * Biasanya tidak dipanggil langsung — gunakan selector hook per modul.
 */
export const useDI = (): AppContainer => {
  const context = useContext(DIContext);
  if (!context) {
    throw new Error("useDI must be used within DIProvider.");
  }
  return context;
};
