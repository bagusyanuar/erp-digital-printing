import { useEffect, useRef, useState } from "react";
import { useAuthDI } from "./useAuthDI";
import { useAuthStore } from "../stores/auth.store";

/**
 * useInitializeAuth
 *
 * Hook ini bertanggung jawab untuk melakukan "Silent Refresh" saat aplikasi pertama kali dimuat.
 * Ini memastikan bahwa jika user mereload halaman, status login tetap terjaga selama cookie refresh_token valid.
 */
export const useInitializeAuth = () => {
  const { refreshUseCase } = useAuthDI();
  const setToken = useAuthStore((state) => state.setToken);
  const [isInitializing, setIsInitializing] = useState(true);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const initAuth = async () => {
      try {
        // Coba refresh token menggunakan cookie yang ada
        const result = await refreshUseCase.execute();
        setToken(result.accessToken);
        console.log("Auth initialized successfully via refresh token.");
      } catch (error: unknown) {
        // Jika gagal (401), berarti session habis atau cookie belum terkirim
        console.warn("No valid session found during initialization:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [refreshUseCase, setToken]);

  return { isInitializing };
};
