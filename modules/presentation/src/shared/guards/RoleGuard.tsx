import React, { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { useProfile } from "../../user/hooks/useProfile";
import { hasAnyRole } from "../utils/role.utils";

const ForbiddenPage = lazy(() => import("../pages/ForbiddenPage"));

interface RoleGuardProps {
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

/**
 * RoleGuard
 *
 * Guard untuk membatasi akses rute berdasarkan role pengguna.
 * Jika role tidak memenuhi syarat (misal role designer mencoba bypass URL admin),
 * guard ini akan menampilkan halaman 403 Forbidden.
 */
export const RoleGuard = ({ allowedRoles, fallback }: RoleGuardProps) => {
  const { data: userProfile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="h-full min-h-[50vh] w-full flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-sm font-medium text-muted-foreground">
          Memverifikasi hak akses...
        </span>
      </div>
    );
  }

  const hasAccess = hasAnyRole(userProfile?.roles, allowedRoles);

  if (!hasAccess) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <Suspense
        fallback={
          <div className="h-full min-h-[50vh] w-full flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          </div>
        }
      >
        <ForbiddenPage />
      </Suspense>
    );
  }

  return <Outlet />;
};

export default RoleGuard;
