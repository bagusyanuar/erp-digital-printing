import React from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { PasswordField } from "@erp-digital-printing/ui/PasswordField";
import { Typography } from "@erp-digital-printing/ui/Typography";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@erp-digital-printing/ui/Card";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import {
  LuPlus,
  LuSearch,
  LuUsers,
  LuX,
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

const UserPage = () => {
  const {
    table,
    isLoading,
    isFetching,
    globalFilter,
    setGlobalFilter,
    isAddDialogOpen,
    setIsAddDialogOpen,
    createUser,
    isCreating,
    roles,
  } = useUserTable();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      roleId: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    createUser(
      {
        username: data.username,
        password: data.password,
        roleIds: [data.roleId],
      },
      {
        onSuccess: () => {
          reset();
        },
      },
    );
  });

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
                    colSpan={2}
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
                    colSpan={2}
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
      <Dialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <div className="relative p-6 max-w-md w-full bg-card border border-border rounded-3xl shadow-2xl space-y-6">
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

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <TextField
                id="username"
                placeholder="Masukkan username"
                {...register("username")}
                variant={errors.username ? "error" : "default"}
              />
              {errors.username && (
                <HelperText variant="error">{errors.username.message}</HelperText>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordField
                id="password"
                placeholder="Masukkan password"
                {...register("password")}
                variant={errors.password ? "error" : "default"}
              />
              {errors.password && (
                <HelperText variant="error">{errors.password.message}</HelperText>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleId">Role / Hak Akses</Label>
              <Controller
                control={control}
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
              {errors.roleId && (
                <p className="text-xs text-destructive mt-1">{errors.roleId.message}</p>
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
    </div>
  );
};

export default UserPage;
