import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth.store";
import { useAuthDI } from "./useAuthDI";
import { useNavigate } from "react-router-dom";
import { toast } from "@erp-digital-printing/ui/Toast";

/**
 * useLogout Hook
 * 
 * Hook ini mengintegrasikan:
 * - TanStack Query (useMutation) untuk memicu request logout ke BE.
 * - Zustand (useAuthStore) untuk membersihkan session token lokal.
 * - Pembersihan cache react-query.
 * - Redirect ke halaman login.
 */
export const useLogout = () => {
  const { logoutUseCase } = useAuthDI();
  const clearToken = useAuthStore((state) => state.clearToken);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: () => logoutUseCase.execute(),
    onSuccess: () => {
      // Clear token di Zustand (local state)
      clearToken();
      
      // Bersihkan seluruh cache queries agar data lama tidak bocor
      queryClient.clear();
      
      toast.success("Logout Berhasil", "Anda telah keluar dari sistem.");
      
      // Redirect ke login
      navigate("/login");
    },
    onError: (error) => {
      // Walaupun API gagal, sebaiknya client tetap dipaksa logout untuk UX yang aman
      clearToken();
      queryClient.clear();
      toast.success("Logout Berhasil", "Sesi Anda telah diakhiri.");
      navigate("/login");
      console.error("Logout API Error, but logged out locally:", error);
    },
  });

  return {
    logout,
    isLoggingOut,
  };
};
