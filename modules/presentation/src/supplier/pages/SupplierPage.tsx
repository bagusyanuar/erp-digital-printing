import React, { useState } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@erp-digital-printing/ui/Card";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Label } from "@erp-digital-printing/ui/Label";
import {
  LuPlus,
  LuSearch,
  LuX,
  LuTrash2,
  LuTruck,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HelperText } from "@erp-digital-printing/ui/HelperText";
import { z } from "zod";
import type { CreateSupplierInput } from "@core/supplier/applications/inputs";
import { useSupplierTable, type Supplier } from "../hooks/useSupplierTable";

// Zod Schema for input validation (using camelCase to align with Core inputs)
const supplierInputSchema = z.object({
  name: z.string().min(1, "Nama supplier wajib diisi"),
  contactName: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")).transform(val => val === "" ? null : val),
  address: z.string().optional().or(z.literal("")),
});

const SupplierPage = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const addForm = useForm<CreateSupplierInput>({
    resolver: zodResolver(supplierInputSchema),
    defaultValues: {
      name: "",
      contactName: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  const editForm = useForm<CreateSupplierInput>({
    resolver: zodResolver(supplierInputSchema),
    defaultValues: {
      name: "",
      contactName: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  const {
    table,
    columns,
    isLoading,
    isAdding,
    isUpdating,
    isDeleting,
    isAddDialogOpen,
    setIsAddDialogOpen,
    globalFilter,
    setGlobalFilter,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    setSelectedSupplierId,
    isFetchingDetail,
    supplierDetail,
    totalEntries,
  } = useSupplierTable({
    onEdit: (supplier) => {
      setSelectedSupplier(supplier);
      setSelectedSupplierId(supplier.id);
      setIsEditDialogOpen(true);
    },
    onDelete: (supplier) => {
      setSelectedSupplier(supplier);
      setIsDeleteDialogOpen(true);
    },
  });

  const {
    register: registerAdd,
    formState: { errors: errorsAdd },
  } = addForm;

  const {
    register: registerEdit,
    formState: { errors: errorsEdit },
  } = editForm;

  React.useEffect(() => {
    if (supplierDetail) {
      editForm.reset({
        name: supplierDetail.name,
        contactName: supplierDetail.contact_name,
        phone: supplierDetail.phone,
        email: supplierDetail.email,
        address: supplierDetail.address,
      });
    }
  }, [supplierDetail, editForm]);

  const handleSaveSupplier = addForm.handleSubmit((data) => {
    addSupplier(data);
    addForm.reset();
  });

  const handleUpdateSupplier = editForm.handleSubmit((data) => {
    if (!selectedSupplier) return;
    updateSupplier(selectedSupplier.id, data, () => {
      setIsEditDialogOpen(false);
      setSelectedSupplier(null);
      setSelectedSupplierId(null);
    });
  });

  const handleDeleteSupplier = () => {
    if (!selectedSupplier) return;
    deleteSupplier(selectedSupplier.id, () => {
      setIsDeleteDialogOpen(false);
      setSelectedSupplier(null);
    });
  };

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuTruck className="text-primary" size={32} />
            Data Supplier
          </h1>
          <p className="text-muted-foreground font-medium">
            Kelola daftar supplier bahan baku kertas, tinta, dan inventory percetakan.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-3xl overflow-hidden shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/30 p-6 bg-card">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <TextField
              placeholder="Cari supplier..."
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
              Tambah Supplier
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
                    <TableHead
                      key={header.id}
                      className={
                        header.column.id === "actions" ? "text-center" : ""
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                    colSpan={columns.length}
                    className="text-center py-10 text-muted-foreground animate-pulse"
                  >
                    Memuat data supplier...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Tidak ada data supplier ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        <TablePagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          pageSize={table.getState().pagination.pageSize}
          totalEntries={totalEntries}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      </Card>

      {/* Add Supplier Dialog */}
      <Dialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        size="md"
        showCloseButton={false}
      >
        <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-start justify-between gap-4">
          <div className="space-y-0.5">
            <CardTitle
              variant="h4"
              weight="semibold"
              className="text-lg tracking-tight"
            >
              Tambah Supplier Baru
            </CardTitle>
            <CardDescription className="text-sm">
              Masukkan detail informasi data supplier baru untuk dicatat dalam sistem.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted active:scale-90 transition-all -mr-2 -mt-0.5"
            onClick={() => setIsAddDialogOpen(false)}
            disabled={isAdding}
          >
            <LuX className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supplierName" className="text-sm font-semibold">
              Nama Supplier / Perusahaan
            </Label>
            <TextField
              id="supplierName"
              {...registerAdd("name")}
              placeholder="Contoh: PT. Kertas Nusantara"
              className="border-border/50 focus:bg-background transition-all"
              variant={errorsAdd.name ? "error" : "default"}
              disabled={isAdding}
            />
            {errorsAdd.name && (
              <HelperText variant="error">{errorsAdd.name.message}</HelperText>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName" className="text-sm font-semibold">
              Nama Kontak / PIC
            </Label>
            <TextField
              id="contactName"
              {...registerAdd("contactName")}
              placeholder="Contoh: Budi Santoso"
              className="border-border/50 focus:bg-background transition-all"
              variant={errorsAdd.contactName ? "error" : "default"}
              disabled={isAdding}
            />
            {errorsAdd.contactName && (
              <HelperText variant="error">{errorsAdd.contactName.message}</HelperText>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierEmail" className="text-sm font-semibold">
                Email Perusahaan
              </Label>
              <TextField
                id="supplierEmail"
                type="email"
                {...registerAdd("email")}
                placeholder="Contoh: budi@kertasnusantara.com"
                className="border-border/50 focus:bg-background transition-all"
                variant={errorsAdd.email ? "error" : "default"}
                disabled={isAdding}
              />
              {errorsAdd.email && (
                <HelperText variant="error">
                  {errorsAdd.email.message}
                </HelperText>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierPhone" className="text-sm font-semibold">
                Nomor Telepon
              </Label>
              <TextField
                id="supplierPhone"
                {...registerAdd("phone")}
                placeholder="Contoh: 081234567890"
                className="border-border/50 focus:bg-background transition-all"
                variant={errorsAdd.phone ? "error" : "default"}
                disabled={isAdding}
              />
              {errorsAdd.phone && (
                <HelperText variant="error">
                  {errorsAdd.phone.message}
                </HelperText>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierAddress" className="text-sm font-semibold">
              Alamat Lengkap Kantor
            </Label>
            <textarea
              id="supplierAddress"
              {...registerAdd("address")}
              className={`w-full min-h-[80px] rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none ${
                errorsAdd.address
                  ? "border-rose-500 focus-visible:ring-rose-500"
                  : "border-border/50"
              }`}
              placeholder="Tuliskan alamat lengkap supplier..."
              disabled={isAdding}
            />
            {errorsAdd.address && (
              <HelperText variant="error">
                {errorsAdd.address.message}
              </HelperText>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-6 py-4 border-t border-border/50 flex justify-end gap-2">
          <Button
            variant="outline"
            className="h-10 px-4 rounded-md font-medium border-border/50 hover:bg-muted/50 active:scale-95 transition-all"
            onClick={() => setIsAddDialogOpen(false)}
            disabled={isAdding}
          >
            Batal
          </Button>
          <Button
            className="h-10 px-4 rounded-md font-medium bg-primary hover:bg-primary/90 active:scale-95 transition-all"
            onClick={handleSaveSupplier}
            disabled={isAdding}
          >
            {isAdding ? "Menyimpan..." : "Simpan Supplier"}
          </Button>
        </CardFooter>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedSupplier(null);
        }}
        size="md"
        showCloseButton={false}
      >
        <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-start justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Ubah Data Supplier
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Perbarui rincian informasi data supplier terpilih.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted active:scale-90 transition-all -mr-2 -mt-0.5"
            onClick={() => {
              setIsEditDialogOpen(false);
              setSelectedSupplier(null);
            }}
            disabled={isFetchingDetail || isUpdating}
          >
            <LuX className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {isFetchingDetail ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-muted-foreground animate-pulse">
                Memuat data supplier...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editSupplierName" className="text-sm font-semibold">
                  Nama Supplier / Perusahaan
                </Label>
                <TextField
                  id="editSupplierName"
                  {...registerEdit("name")}
                  placeholder="Contoh: PT. Kertas Nusantara"
                  className="border-border/50 focus:bg-background transition-all"
                  variant={errorsEdit.name ? "error" : "default"}
                  disabled={isUpdating}
                />
                {errorsEdit.name && (
                  <HelperText variant="error">
                    {errorsEdit.name.message}
                  </HelperText>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="editContactName" className="text-sm font-semibold">
                  Nama Kontak / PIC
                </Label>
                <TextField
                  id="editContactName"
                  {...registerEdit("contactName")}
                  placeholder="Contoh: Budi Santoso"
                  className="border-border/50 focus:bg-background transition-all"
                  variant={errorsEdit.contactName ? "error" : "default"}
                  disabled={isUpdating}
                />
                {errorsEdit.contactName && (
                  <HelperText variant="error">
                    {errorsEdit.contactName.message}
                  </HelperText>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editSupplierEmail" className="text-sm font-semibold">
                    Email Perusahaan
                  </Label>
                  <TextField
                    id="editSupplierEmail"
                    type="email"
                    {...registerEdit("email")}
                    placeholder="Contoh: budi@kertasnusantara.com"
                    className="border-border/50 focus:bg-background transition-all"
                    variant={errorsEdit.email ? "error" : "default"}
                    disabled={isUpdating}
                  />
                  {errorsEdit.email && (
                    <HelperText variant="error">
                      {errorsEdit.email.message}
                    </HelperText>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editSupplierPhone" className="text-sm font-semibold">
                    Nomor Telepon
                  </Label>
                  <TextField
                    id="editSupplierPhone"
                    {...registerEdit("phone")}
                    placeholder="Contoh: 081234567890"
                    className="border-border/50 focus:bg-background transition-all"
                    variant={errorsEdit.phone ? "error" : "default"}
                    disabled={isUpdating}
                  />
                  {errorsEdit.phone && (
                    <HelperText variant="error">
                      {errorsEdit.phone.message}
                    </HelperText>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editSupplierAddress" className="text-sm font-semibold">
                  Alamat Lengkap Kantor
                </Label>
                <textarea
                  id="editSupplierAddress"
                  {...registerEdit("address")}
                  className={`w-full min-h-[80px] rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none ${
                    errorsEdit.address
                      ? "border-rose-500 focus-visible:ring-rose-500"
                      : "border-border/50"
                  }`}
                  placeholder="Tuliskan alamat lengkap supplier..."
                  disabled={isUpdating}
                />
                {errorsEdit.address && (
                  <HelperText variant="error">
                    {errorsEdit.address.message}
                  </HelperText>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-6 py-4 border-t border-border/50 flex justify-end gap-2">
          <Button
            variant="outline"
            className="h-10 px-4 rounded-md font-medium border-border/50 hover:bg-muted/50 active:scale-95 transition-all"
            onClick={() => {
              setIsEditDialogOpen(false);
              setSelectedSupplier(null);
            }}
            disabled={isUpdating}
          >
            Batal
          </Button>
          <Button
            className="h-10 px-4 rounded-md font-medium bg-primary hover:bg-primary/90 active:scale-95 transition-all"
            onClick={handleUpdateSupplier}
            disabled={isFetchingDetail || isUpdating}
          >
            {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </CardFooter>
      </Dialog>

      {/* Delete Supplier Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        size="sm"
        showCloseButton={false}
      >
        <div className="relative p-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-8 w-8 rounded-md text-muted-foreground hover:bg-muted active:scale-90 transition-all"
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            <LuX className="h-4 w-4" />
          </Button>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 shadow-inner">
            <LuTrash2 className="h-7 w-7 animate-bounce" style={{ animationDuration: "3s" }} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold tracking-tight text-foreground">
              Hapus Supplier
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed px-2">
              Apakah Anda yakin ingin menghapus supplier{" "}
              <strong className="text-foreground font-black">
                {selectedSupplier?.name}
              </strong>
              ?<br />
              Tindakan ini bersifat permanen dan data supplier akan dihapus dari sistem.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto min-w-[100px] h-10 rounded-xl font-bold border-border/60 hover:bg-muted/50 active:scale-95 transition-all text-sm"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              className="w-full sm:w-auto min-w-[120px] h-10 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              onClick={handleDeleteSupplier}
              disabled={isDeleting}
            >
              <LuTrash2 className="h-4 w-4" />
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default SupplierPage;
