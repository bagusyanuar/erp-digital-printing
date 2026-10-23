import type { RoleModel } from "@core/user/domains/models/user.model";

/**
 * Normalisasi string nama role (lowercase & trim)
 */
export const normalizeRole = (roleName: string): string => {
  return roleName.toLowerCase().trim();
};

/**
 * Cek apakah user memiliki salah satu dari role yang diizinkan
 */
export const hasAnyRole = (
  userRoles: RoleModel[] | undefined,
  allowedRoles: string[]
): boolean => {
  if (!userRoles || userRoles.length === 0) return false;
  const normalizedAllowed = allowedRoles.map(normalizeRole);
  return userRoles.some((role) =>
    normalizedAllowed.includes(normalizeRole(role.name))
  );
};

/**
 * Cek apakah user memiliki role administrator (super user dengan akses penuh)
 */
export const isAdministrator = (userRoles: RoleModel[] | undefined): boolean => {
  if (!userRoles || userRoles.length === 0) return false;
  return userRoles.some((r) => normalizeRole(r.name) === "administrator");
};

/**
 * Cek apakah user memiliki role admin biasa (bukan administrator)
 */
export const isAdmin = (userRoles: RoleModel[] | undefined): boolean => {
  if (!userRoles || userRoles.length === 0) return false;
  const names = userRoles.map((r) => normalizeRole(r.name));
  return names.includes("admin") && !names.includes("administrator");
};

/**
 * Cek apakah user HANYA memiliki role designer (tanpa akses administrator/admin)
 */
export const isOnlyDesigner = (userRoles: RoleModel[] | undefined): boolean => {
  if (!userRoles || userRoles.length === 0) return false;
  const names = userRoles.map((r) => normalizeRole(r.name));
  const hasElevatedRole =
    names.includes("admin") || names.includes("administrator");
  return names.includes("designer") && !hasElevatedRole;
};

/**
 * Dapatkan rute beranda default berdasarkan role pengguna:
 * - administrator -> /dashboard
 * - admin -> /order (Pesanan Baru)
 * - designer -> /ticket-order (Tiket Pesanan)
 */
export const getDefaultHomePath = (
  userRoles: RoleModel[] | undefined
): string => {
  if (!userRoles || userRoles.length === 0) return "/dashboard";
  const names = userRoles.map((r) => normalizeRole(r.name));

  if (names.includes("administrator") || names.includes("admin")) {
    return "/dashboard";
  }
  if (names.includes("designer")) {
    return "/ticket-order";
  }
  return "/dashboard";
};
