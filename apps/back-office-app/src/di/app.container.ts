import { createHttpClient } from "@infrastructure/libs/http";
import {
  createLoginUseCase,
  createRefreshUseCase,
  createLogoutUseCase,
} from "@infrastructure/auth/containers/auth.container";
import { useAuthStore } from "@presentation/auth/stores/auth.store";
import type { AppContainer } from "@presentation/shared/di/DIContext";
import { getResellerUseCase, createResellerUseCase, getResellerByIdUseCase, updateResellerUseCase, deleteResellerUseCase } from "@infrastructure/reseller/containers/reseller.container";
import { getCategoryUseCase, createCategoryUseCase, getCategoryByIdUseCase, updateCategoryUseCase, deleteCategoryUseCase } from "@infrastructure/category/containers/category.container";

/**
 * createAppContainer
 *
 * Pusat perakitan seluruh dependency aplikasi (Composition Root).
 * Cukup tambahkan property baru saat modul baru dibuat.
 */
export function createAppContainer(): AppContainer {
  const httpClient = createHttpClient(
    () => useAuthStore.getState().accessToken,
    (token) => useAuthStore.getState().setToken(token),
    () => useAuthStore.getState().clearToken(),
  );

  return {
    auth: {
      loginUseCase: createLoginUseCase(httpClient),
      refreshUseCase: createRefreshUseCase(httpClient),
      logoutUseCase: createLogoutUseCase(httpClient),
    },
    reseller: {
      getResellersUseCase: getResellerUseCase(httpClient),
      createResellerUseCase: createResellerUseCase(httpClient),
      getResellerByIdUseCase: getResellerByIdUseCase(httpClient),
      updateResellerUseCase: updateResellerUseCase(httpClient),
      deleteResellerUseCase: deleteResellerUseCase(httpClient),
    },
    category: {
      getCategoriesUseCase: getCategoryUseCase(httpClient),
      createCategoryUseCase: createCategoryUseCase(httpClient),
      getCategoryByIdUseCase: getCategoryByIdUseCase(httpClient),
      updateCategoryUseCase: updateCategoryUseCase(httpClient),
      deleteCategoryUseCase: deleteCategoryUseCase(httpClient),
    },
  };
}
