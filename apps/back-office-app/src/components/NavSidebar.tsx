import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarHeader,
  SidebarAppSwitcher,
  SidebarContent,
  SidebarGroup,
  SidebarItem,
  SidebarFooter,
} from "@erp-digital-printing/ui/Sidebar";
import {
  LuLayoutDashboard,
  LuDatabase,
  LuTruck,
  LuFileText,
  LuCreditCard,
  LuBox,
  LuPrinter,
  LuBanknote,
  LuSignature,
  LuTags,
  LuBriefcase,
  LuReceipt,
  LuArrowRightLeft,
  LuTrendingDown,
  LuUsers,
  LuKey,
  LuX,
} from "@erp-digital-printing/ui/icons";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@erp-digital-printing/ui/Card";
import { PasswordField } from "@erp-digital-printing/ui/PasswordField";
import { Label } from "@erp-digital-printing/ui/Label";
import { HelperText } from "@erp-digital-printing/ui/HelperText";
import { Button } from "@erp-digital-printing/ui/Button";
import { toast } from "@erp-digital-printing/ui/Toast";
import { useMutation } from "@tanstack/react-query";
import { useLogout } from "@presentation/auth/hooks/useLogout";
import { useProfile } from "@presentation/user/hooks/useProfile";
import { useUserDI } from "@presentation/user/hooks/useUserDI";
import {
  isAdministrator,
  isAdmin,
  isOnlyDesigner,
} from "@presentation/shared/utils/role.utils";
import type { UserModel } from "@core/user/domains/models/user.model";
import type { ChangeUserPasswordInput } from "@core/user/domains/repositories/user.repository";
import type { AppError } from "@core/shared/errors/domain.error";

export const NavSidebar = () => {
  const { logout } = useLogout();
  const { data: userProfile, isLoading } = useProfile();
  const roles = userProfile?.roles;
  const canAccessDashboard = isAdministrator(roles) || isAdmin(roles);
  const canAccessTiketPesanan = isAdministrator(roles) || isOnlyDesigner(roles);
  const canAccessPesananBaru = isAdministrator(roles) || isAdmin(roles);
  const canAccessInvoice = isAdministrator(roles) || isAdmin(roles);
  const canAccessKeuangan = isAdministrator(roles) || isAdmin(roles);
  const canAccessMasterData = isAdministrator(roles) || isAdmin(roles);
  const canAccessMasterOther = isAdministrator(roles);
  const canAccessLaporan = isAdministrator(roles) || isAdmin(roles);
  const { changeUserPasswordUseCase } = useUserDI();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<{ password?: string; confirmPassword?: string }>({});

  const handleOpenChangePassword = () => {
    setPassword("");
    setConfirmPassword("");
    setFormError({});
    setIsChangePasswordOpen(true);
  };

  const handleCloseChangePassword = () => {
    setIsChangePasswordOpen(false);
    setPassword("");
    setConfirmPassword("");
    setFormError({});
  };

  const changePasswordMutation = useMutation<
    UserModel,
    AppError,
    ChangeUserPasswordInput
  >({
    mutationFn: (input: ChangeUserPasswordInput) =>
      changeUserPasswordUseCase.execute(input),
    onSuccess: () => {
      toast.success("Password Anda berhasil diubah");
      setIsChangePasswordOpen(false);
      setPassword("");
      setConfirmPassword("");
      setFormError({});
    },
    onError: (error) => {
      toast.error(error.message || "Gagal mengubah password");
    },
  });

  const onSubmitChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    const errors: { password?: string; confirmPassword?: string } = {};
    if (!password || password.length < 6) {
      errors.password = "Password minimal 6 karakter";
    }
    if (confirmPassword !== password) {
      errors.confirmPassword = "Konfirmasi password tidak cocok";
    }

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }

    setFormError({});
    changePasswordMutation.mutate({
      id: userProfile.id,
      username: userProfile.username,
      password,
    });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold">
            <LuBox className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-sidebar-foreground tracking-tighter leading-none">
              MADE
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
              Digital Printing ERP
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarAppSwitcher
        currentApp={{
          name: "Digital Printing",
          description: "Production & Sales",
          icon: <LuPrinter className="h-6 w-6" />,
        }}
      />

      <SidebarContent>
        {canAccessDashboard && (
          <SidebarGroup>
            <NavLink to="/dashboard" className="contents">
              {({ isActive }) => (
                <SidebarItem
                  asChild
                  icon={<LuLayoutDashboard />}
                  label="Dashboard"
                  active={isActive}
                >
                  <button />
                </SidebarItem>
              )}
            </NavLink>
          </SidebarGroup>
        )}

        {(canAccessTiketPesanan || canAccessPesananBaru || canAccessInvoice) && (
          <SidebarGroup label="Transaksi">
            {canAccessTiketPesanan && (
              <NavLink to="/ticket-order" className="contents">
                {({ isActive }) => (
                  <SidebarItem
                    asChild
                    icon={<LuFileText />}
                    label="Tiket Pesanan"
                    active={isActive}
                  >
                    <button />
                  </SidebarItem>
                )}
              </NavLink>
            )}
            {canAccessPesananBaru && (
              <NavLink to="/order" className="contents">
                {({ isActive }) => (
                  <SidebarItem
                    asChild
                    icon={<LuSignature />}
                    label="Pesanan Baru"
                    active={isActive}
                  >
                    <button />
                  </SidebarItem>
                )}
              </NavLink>
            )}
            {canAccessInvoice && (
              <NavLink to="/invoice" className="contents">
                {({ isActive }) => (
                  <SidebarItem
                    asChild
                    icon={<LuReceipt />}
                    label="Invoice"
                    active={isActive}
                  >
                    <button />
                  </SidebarItem>
                )}
              </NavLink>
            )}
          </SidebarGroup>
        )}

        {canAccessKeuangan && (
          <SidebarGroup label="Keuangan">
            <NavLink to="/expense" className="contents">
              {({ isActive }) => (
                <SidebarItem
                  asChild
                  icon={<LuCreditCard />}
                  label="Pengeluaran (Expense)"
                  active={isActive}
                >
                  <button />
                </SidebarItem>
              )}
            </NavLink>
            <NavLink to="/capital-injection" className="contents">
              {({ isActive }) => (
                <SidebarItem
                  asChild
                  icon={<LuBanknote />}
                  label="Setoran Modal"
                  active={isActive}
                >
                  <button />
                </SidebarItem>
              )}
            </NavLink>
            <NavLink to="/capital-withdrawal" className="contents">
              {({ isActive }) => (
                <SidebarItem
                  asChild
                  icon={<LuCreditCard />}
                  label="Penarikan Modal (Prive)"
                  active={isActive}
                >
                  <button />
                </SidebarItem>
              )}
            </NavLink>
            <NavLink to="/fund-transfer" className="contents">
              {({ isActive }) => (
                <SidebarItem
                  asChild
                  icon={<LuArrowRightLeft />}
                  label="Pemindahan Dana"
                  active={isActive}
                >
                  <button />
                </SidebarItem>
              )}
            </NavLink>
          </SidebarGroup>
        )}

        {canAccessMasterData && (
          <SidebarGroup label="Master Data">
            {canAccessMasterOther && (
              <>
                <NavLink to="/category" className="contents">
                  {({ isActive }) => (
                    <SidebarItem
                      asChild
                      icon={<LuTags />}
                      label="Kategori Produk"
                      active={isActive}
                    >
                      <button />
                    </SidebarItem>
                  )}
                </NavLink>
                <NavLink to="/expense-category" className="contents">
                  {({ isActive }) => (
                    <SidebarItem
                      asChild
                      icon={<LuReceipt />}
                      label="Kategori Pengeluaran"
                      active={isActive}
                    >
                      <button />
                    </SidebarItem>
                  )}
                </NavLink>
                <NavLink to="/product" className="contents">
                  {({ isActive }) => (
                    <SidebarItem
                      asChild
                      icon={<LuDatabase />}
                      label="Produk"
                      active={isActive}
                    >
                      <button />
                    </SidebarItem>
                  )}
                </NavLink>
                <NavLink to="/attribute" className="contents">
                  {({ isActive }) => (
                    <SidebarItem
                      asChild
                      icon={<LuBox />}
                      label="Atribut Varian"
                      active={isActive}
                    >
                      <button />
                    </SidebarItem>
                  )}
                </NavLink>
              </>
            )}
            <NavLink to="/reseller" className="contents">
              {({ isActive }) => (
                <SidebarItem
                  asChild
                  icon={<LuBriefcase />}
                  label="Biro / Reseller"
                  active={isActive}
                >
                  <button />
                </SidebarItem>
              )}
            </NavLink>
            <NavLink to="/supplier" className="contents">
              {({ isActive }) => (
                <SidebarItem
                  asChild
                  icon={<LuTruck />}
                  label="Database Supplier"
                  active={isActive}
                >
                  <button />
                </SidebarItem>
              )}
            </NavLink>
            {canAccessMasterOther && (
              <NavLink to="/user" className="contents">
                {({ isActive }) => (
                  <SidebarItem
                    asChild
                    icon={<LuUsers />}
                    label="Database User"
                    active={isActive}
                  >
                    <button />
                  </SidebarItem>
                )}
              </NavLink>
            )}
          </SidebarGroup>
        )}

        {canAccessLaporan && (
          <SidebarGroup label="Laporan">
            <NavLink to="/report/selling" className="contents">
              {({ isActive }) => (
                <SidebarItem
                  asChild
                  icon={<LuFileText />}
                  label="Laporan Penjualan"
                  active={isActive}
                >
                  <button />
                </SidebarItem>
              )}
            </NavLink>
            <NavLink to="/report/expense" className="contents">
              {({ isActive }) => (
                <SidebarItem
                  asChild
                  icon={<LuTrendingDown />}
                  label="Laporan Pengeluaran"
                  active={isActive}
                >
                  <button />
                </SidebarItem>
              )}
            </NavLink>
            <NavLink to="/report/cash-flow" className="contents">
              {({ isActive }) => (
                <SidebarItem
                  asChild
                  icon={<LuBanknote />}
                  label="Laporan Arus Kas"
                  active={isActive}
                >
                  <button />
                </SidebarItem>
              )}
            </NavLink>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter
        user={{
          name: isLoading ? "Loading..." : (userProfile?.username || "Guest"),
          role: isLoading ? "..." : (userProfile?.roles?.[0]?.name || "User"),
        }}
        onChangePassword={handleOpenChangePassword}
        onLogout={logout}
      />

      {/* Change Password Dialog */}
      <Dialog
        isOpen={isChangePasswordOpen}
        onClose={handleCloseChangePassword}
        size="sm"
        showCloseButton={false}
      >
        <form onSubmit={onSubmitChangePassword}>
          <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-start justify-between gap-4">
            <div className="space-y-0.5">
              <CardTitle variant="h4" weight="semibold" className="text-lg tracking-tight flex items-center gap-2">
                <LuKey className="text-amber-500" size={20} />
                Ganti Password
              </CardTitle>
              <CardDescription className="text-sm">
                Ubah password akun Anda (
                <span className="font-bold text-foreground">
                  {userProfile?.username}
                </span>
                ).
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted active:scale-90 transition-all -mr-2 -mt-0.5"
              type="button"
              onClick={handleCloseChangePassword}
            >
              <LuX className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-user-new-password">Password Baru</Label>
              <PasswordField
                id="current-user-new-password"
                placeholder="Masukkan password baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant={formError.password ? "error" : "default"}
              />
              {formError.password && (
                <HelperText variant="error">
                  {formError.password}
                </HelperText>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-user-confirm-password">Konfirmasi Password Baru</Label>
              <PasswordField
                id="current-user-confirm-password"
                placeholder="Ketik ulang password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                variant={formError.confirmPassword ? "error" : "default"}
              />
              {formError.confirmPassword && (
                <HelperText variant="error">
                  {formError.confirmPassword}
                </HelperText>
              )}
            </div>
          </CardContent>

          <CardFooter className="px-6 py-4 border-t border-border/50 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseChangePassword}
              className="rounded-xl font-bold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              loading={changePasswordMutation.isPending}
              disabled={changePasswordMutation.isPending}
              className="rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20"
            >
              Ubah Password
            </Button>
          </CardFooter>
        </form>
      </Dialog>
    </Sidebar>
  );
};
