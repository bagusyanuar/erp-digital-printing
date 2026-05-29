import { createContext, useContext } from "react";
import type {
  Login,
  Refresh,
  Logout,
} from "@core/auth/applications/usecases/auth.usecase";
import type { GetResellers, CreateReseller, GetResellerById, UpdateReseller, DeleteReseller } from "@core/reseller/applications/usecases/reseller.usecase";
import type { GetCategories, CreateCategory, GetCategoryById, UpdateCategory, DeleteCategory } from "@core/category/applications/usecases/category.usecase";
import type { GetAttributes, CreateAttribute, GetAttributeById, UpdateAttribute, DeleteAttribute } from "@core/attribute/applications/usecases/attribute.usecase";

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
  getResellerByIdUseCase: GetResellerById;
  updateResellerUseCase: UpdateReseller;
  deleteResellerUseCase: DeleteReseller;
}

export interface GetCategoryUseCases {
  getCategoriesUseCase: GetCategories;
  createCategoryUseCase: CreateCategory;
  getCategoryByIdUseCase: GetCategoryById;
  updateCategoryUseCase: UpdateCategory;
  deleteCategoryUseCase: DeleteCategory;
}

export interface GetAttributeUseCases {
  getAttributesUseCase: GetAttributes;
  createAttributeUseCase: CreateAttribute;
  getAttributeByIdUseCase: GetAttributeById;
  updateAttributeUseCase: UpdateAttribute;
  deleteAttributeUseCase: DeleteAttribute;
}

// ──────────────────────────────────────────────
// App Container
// Gabungan seluruh modul. Satu property per modul.
// ──────────────────────────────────────────────

export interface AppContainer {
  auth: AuthUseCases;
  reseller: GetResellerUseCases;
  category: GetCategoryUseCases;
  attribute: GetAttributeUseCases;
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
