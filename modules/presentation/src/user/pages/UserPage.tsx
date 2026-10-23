import React, { useEffect } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { PasswordField } from "@erp-digital-printing/ui/PasswordField";
import { Typography } from "@erp-digital-printing/ui/Typography";
import {
  Card,
  CardHeader,
  CardContent,
} from "@erp-digital-printing/ui/Card";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import {
  LuPlus,
  LuSearch,
  LuUsers,
  LuX,
  LuKey,
  LuTrash2,
  LuPencil,
} from "@erp-digital-printing/ui/icons";
import { flexRender } from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TablePagination,
} from "@erp-digital-printing/ui/Table";
import { Label } from "@erp-digital-printing/ui/Label";
import { HelperText } from "@erp-digital-printing/ui/HelperText";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUserTable } from "../hooks/useUserTable";
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@erp-digital-printing/ui/Combobox";

const userFormSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  roleId: z.string().min(1, "Pilih salah satu role"),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const editUserFormSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  roleId: z.string().min(1, "Pilih salah satu role"),
});

type EditUserFormValues = z.infer<typeof editUserFormSchema>;

const changePasswordFormSchema = z
  .object({
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

const UserPage = () => {
  const {
    table,
    isLoading,
    globalFilter,
    setGlobalFilter,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isChangePasswordDialogOpen,
    setIsChangePasswordDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedUser,
    createUser,
    isCreating,
    updateUser,
    isUpdating,
    changePassword,
    isChangingPassword,
    deleteUser,
    isDeleting,
    roles,
  } = useUserTable();

  // Add User Form
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    control: controlAdd,
    formState: { errors: errorsAdd },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      roleId: "",
    },
  });

  // Edit User Form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    control: controlEdit,
    formState: { errors: errorsEdit },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      username: "",
      roleId: "",
    },
  });

  // Change Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: errorsPassword },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Populate Edit form when selectedUser changes
  useEffect(() => {
    if (selectedUser && isEditDialogOpen) {
      resetEdit({
        username: selectedUser.username,
        roleId: selectedUser.roles?.[0]?.id || "",
      });
    }
  }, [selectedUser, isEditDialogOpen, resetEdit]);

  // Reset change password form when modal opens
  useEffect(() => {
    if (isChangePasswordDialogOpen) {
      resetPassword({
        password: "",
        confirmPassword: "",
      });
    }
  }, [isChangePasswordDialogOpen, resetPassword]);

  const onAddSubmit = handleSubmitAdd((data) => {
    createUser(
      {
        username: data.username,
        password: data.password,
        roleIds: [data.roleId],
      },
      {
        onSuccess: () => {
          resetAdd();
        },
      },
    );
  });

  const onEditSubmit = handleSubmitEdit((data) => {
    if (!selectedUser) return;
    updateUser(
      {
        id: selectedUser.id,
        username: data.username,
        roleIds: [data.roleId],
      },
      {
        onSuccess: () => {
          resetEdit();
        },
      },
    );
  });

  const onChangePasswordSubmit = handleSubmitPassword((data) => {
    if (!selectedUser) return;
    changePassword(
      {
        id: selectedUser.id,
        username: selectedUser.username,
        password: data.password,
      },
      {
        onSuccess: () => {
          resetPassword();
        },
      },
    );
  });

  const onDeleteConfirm = () => {
    if (!selectedUser) return;
    deleteUser(selectedUser.id);
  };

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuUsers className="text-primary" size={32} />
            Master User
          </h1>
          <p className="text-muted-foreground font-medium">
            Kelola data akun user dan hak akses sistem ERP.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-3xl overflow-hidden shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/30 p-6 bg-card">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <TextField
              placeholder="Cari user..."
              prefixIcon={LuSearch}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button
              className="h-10 px-4 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <LuPlus size={18} />
              Tambah User
            </Button>
          </div>
        </CardHeader>

        {/* Table Body */}
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-10 text-muted-foreground animate-pulse"
                  >
                    Memuat data user...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-10 text-muted-foreground font-medium"
                  >
                    Tidak ada data user.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        <TablePagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          pageSize={table.getState().pagination.pageSize}
          totalEntries={table.getFilteredRowModel().rows.length}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      </Card>

      {/* Add User Dialog */}
      <Dialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        size="sm"
        showCloseButton={false}
      >
        <div className="relative p-6 w-full space-y-6">
          <button
            onClick={() => setIsAddDialogOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-all"
          >
            <LuX size={18} />
          </button>

          <div className="space-y-1">
            <Typography variant="h3" className="font-black text-foreground">
              Tambah User Baru
            </Typography>
            <Typography variant="muted" className="text-muted-foreground">
              Buat akun user baru beserta password dan role hak aksesnya.
            </Typography>
          </div>

          <form onSubmit={onAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <TextField
                id="username"
                placeholder="Masukkan username"
                {...registerAdd("username")}
                variant={errorsAdd.username ? "error" : "default"}
              />
              {errorsAdd.username && (
                <HelperText variant="error">{errorsAdd.username.message}</HelperText>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordField
                id="password"
                placeholder="Masukkan password"
                {...registerAdd("password")}
                variant={errorsAdd.password ? "error" : "default"}
              />
              {errorsAdd.password && (
                <HelperText variant="error">{errorsAdd.password.message}</HelperText>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleId">Role / Hak Akses</Label>
              <Controller
                control={controlAdd}
                name="roleId"
                render={({ field }) => (
                  <Combobox
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <ComboboxTrigger className="font-semibold w-full h-10 border rounded-xl px-3 border-border/50 text-sm bg-background text-left flex items-center justify-between">
                      <span>
                        {roles.find((r) => r.id === field.value)?.name || "Pilih Role"}
                      </span>
                    </ComboboxTrigger>
                    <ComboboxContent className="w-[var(--radix-popover-trigger-width)] bg-background border border-border shadow-md rounded-xl overflow-hidden z-[10000]">
                      <ComboboxInput placeholder="Cari role..." />
                      <ComboboxEmpty>Role tidak ditemukan.</ComboboxEmpty>
                      <ComboboxList className="max-h-60 overflow-y-auto p-1">
                        {roles.map((opt) => (
                          <ComboboxItem key={opt.id} value={opt.id}>
                            {opt.name}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                )}
              />
              {errorsAdd.roleId && (
                <p className="text-xs text-destructive mt-1">{errorsAdd.roleId.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="rounded-xl font-bold"
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={isCreating}
                disabled={isCreating}
                className="rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              >
                Simpan User
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        size="sm"
        showCloseButton={false}
      >
        <div className="relative p-6 w-full space-y-6">
          <button
            onClick={() => setIsEditDialogOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-all"
          >
            <LuX size={18} />
          </button>

          <div className="space-y-1">
            <Typography variant="h3" className="font-black text-foreground flex items-center gap-2">
              <LuPencil className="text-primary" size={24} />
              Edit User
            </Typography>
            <Typography variant="muted" className="text-muted-foreground">
              Perbarui username atau role hak akses untuk akun user.
            </Typography>
          </div>

          <form onSubmit={onEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <TextField
                id="edit-username"
                placeholder="Masukkan username"
                {...registerEdit("username")}
                variant={errorsEdit.username ? "error" : "default"}
              />
              {errorsEdit.username && (
                <HelperText variant="error">{errorsEdit.username.message}</HelperText>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-roleId">Role / Hak Akses</Label>
              <Controller
                control={controlEdit}
                name="roleId"
                render={({ field }) => (
                  <Combobox
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <ComboboxTrigger className="font-semibold w-full h-10 border rounded-xl px-3 border-border/50 text-sm bg-background text-left flex items-center justify-between">
                      <span>
                        {roles.find((r) => r.id === field.value)?.name || "Pilih Role"}
                      </span>
                    </ComboboxTrigger>
                    <ComboboxContent className="w-[var(--radix-popover-trigger-width)] bg-background border border-border shadow-md rounded-xl overflow-hidden z-[10000]">
                      <ComboboxInput placeholder="Cari role..." />
                      <ComboboxEmpty>Role tidak ditemukan.</ComboboxEmpty>
                      <ComboboxList className="max-h-60 overflow-y-auto p-1">
                        {roles.map((opt) => (
                          <ComboboxItem key={opt.id} value={opt.id}>
                            {opt.name}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                )}
              />
              {errorsEdit.roleId && (
                <p className="text-xs text-destructive mt-1">{errorsEdit.roleId.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-xl font-bold"
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={isUpdating}
                disabled={isUpdating}
                className="rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              >
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        isOpen={isChangePasswordDialogOpen}
        onClose={() => setIsChangePasswordDialogOpen(false)}
        size="sm"
        showCloseButton={false}
      >
        <div className="relative p-6 w-full space-y-6">
          <button
            onClick={() => setIsChangePasswordDialogOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-all"
          >
            <LuX size={18} />
          </button>

          <div className="space-y-1">
            <Typography variant="h3" className="font-black text-foreground flex items-center gap-2">
              <LuKey className="text-amber-500" size={24} />
              Ganti Password
            </Typography>
            <Typography variant="muted" className="text-muted-foreground">
              Ubah password untuk user{" "}
              <span className="font-bold text-foreground">
                "{selectedUser?.username}"
              </span>
              .
            </Typography>
          </div>

          <form onSubmit={onChangePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="change-password">Password Baru</Label>
              <PasswordField
                id="change-password"
                placeholder="Masukkan password baru"
                {...registerPassword("password")}
                variant={errorsPassword.password ? "error" : "default"}
              />
              {errorsPassword.password && (
                <HelperText variant="error">
                  {errorsPassword.password.message}
                </HelperText>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
              <PasswordField
                id="confirm-password"
                placeholder="Ketik ulang password baru"
                {...registerPassword("confirmPassword")}
                variant={errorsPassword.confirmPassword ? "error" : "default"}
              />
              {errorsPassword.confirmPassword && (
                <HelperText variant="error">
                  {errorsPassword.confirmPassword.message}
                </HelperText>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangePasswordDialogOpen(false)}
                className="rounded-xl font-bold"
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={isChangingPassword}
                disabled={isChangingPassword}
                className="rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20"
              >
                Ubah Password
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        size="sm"
        showCloseButton={false}
      >
        <div className="relative p-6 w-full space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
              <LuTrash2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <Typography variant="h3" className="font-black text-foreground">
                Hapus User
              </Typography>
              <Typography variant="muted" className="text-muted-foreground text-sm max-w-xs">
                Apakah Anda yakin ingin menghapus user{" "}
                <span className="font-bold text-foreground">
                  "{selectedUser?.username}"
                </span>
                ? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
              </Typography>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="rounded-xl font-bold"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={onDeleteConfirm}
              loading={isDeleting}
              disabled={isDeleting}
              className="rounded-xl font-bold bg-rose-600 hover:bg-rose-500 active:scale-95 text-white shadow-lg shadow-rose-600/20"
            >
              Hapus User
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default UserPage;
