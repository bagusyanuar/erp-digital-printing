import { useEffect, useState } from "react";
import { useAuthDI } from "./useAuthDI";
import { useAuthStore } from "../stores/auth.store";
import { toast } from "@erp-digital-printing/ui/Toast";

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

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Coba refresh token menggunakan cookie yang ada
        const result = await refreshUseCase.execute();
        setToken(result.accessToken);
        console.log("Auth initialized successfully via refresh token.");
      } catch (error: unknown) {
        // Jika gagal (401), berarti session memang sudah habis atau belum login sama sekali.
        // Kita diamkan saja karena ini behavior normal.
        console.log("No valid session found during initialization.");
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [refreshUseCase, setToken]);

  return { isInitializing };
};
