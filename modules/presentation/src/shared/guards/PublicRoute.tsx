import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../auth/stores/auth.store";

/**
 * PublicRoute
 * 
 * Guard untuk rute publik (seperti Login).
 * Jika user sudah terautentikasi, mereka akan dilempar langsung ke dashboard.
 */
export const PublicRoute = () => {
  const token = useAuthStore((state) => state.accessToken);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
