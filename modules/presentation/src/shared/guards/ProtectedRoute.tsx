import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../auth/stores/auth.store";

/**
 * ProtectedRoute
 * 
 * Guard untuk rute yang membutuhkan autentikasi.
 * Jika tidak ada token, user akan dilempar ke halaman login.
 */
export const ProtectedRoute = () => {
  const token = useAuthStore((state) => state.accessToken);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
