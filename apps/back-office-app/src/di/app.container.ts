import { createHttpClient } from "@infrastructure/libs/http";
import { createLoginUseCase } from "@infrastructure/auth/containers/auth.container";
import { useAuthStore } from "@presentation/auth/stores/auth.store";
import type { AppContainer } from "@presentation/shared/di/DIContext";

/**
 * createAppContainer
 *
 * Pusat perakitan seluruh dependency aplikasi (Composition Root).
 * Cukup tambahkan property baru saat modul baru dibuat.
 */
export function createAppContainer(): AppContainer {
  const httpClient = createHttpClient(() => useAuthStore.getState().accessToken);

  return {
    auth: {
      loginUseCase: createLoginUseCase(httpClient),
    },
  };
}
