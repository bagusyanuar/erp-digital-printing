import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../auth/stores/auth.store";
import { useProfile } from "../../user/hooks/useProfile";
import { getDefaultHomePath } from "../utils/role.utils";

/**
 * PublicRoute
 *
 * Guard untuk rute publik (seperti Login).
 * Jika user sudah terautentikasi:
 * - administrator diarahkan ke /dashboard
 * - admin diarahkan ke /order
 * - designer diarahkan ke /ticket-order
 */
export const PublicRoute = () => {
  const token = useAuthStore((state) => state.accessToken);
  const { data: userProfile, isLoading } = useProfile();

  if (token) {
    if (isLoading) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    const homePath = getDefaultHomePath(userProfile?.roles);
    return <Navigate to={homePath} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
