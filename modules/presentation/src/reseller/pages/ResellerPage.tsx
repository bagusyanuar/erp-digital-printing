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
import { toast } from "@erp-digital-printing/ui/Toast";
import {
  LuPlus,
  LuSearch,
  LuFilter,
  LuBriefcase,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HelperText } from "@erp-digital-printing/ui/HelperText";
import { resellerInputSchema } from "@infrastructure/reseller/validators";
import type { CreateResellerInput } from "@core/reseller/applications/inputs";
import { useResellerTable, type Reseller } from "../hooks/useResellerTable";

const ResellerPage = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null);

  const addForm = useForm<CreateResellerInput>({
    resolver: zodResolver(resellerInputSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      creditLimit: 0,
    },
  });

  const editForm = useForm<CreateResellerInput>({
    resolver: zodResolver(resellerInputSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      creditLimit: 0,
    },
  });

  const {
    table,
    columns,
    isLoading,
    isAdding,
    isAddDialogOpen,
    setIsAddDialogOpen,
    globalFilter,
    setGlobalFilter,
    addReseller,
    updateReseller,
    deleteReseller,
    selectedResellerId,
    setSelectedResellerId,
    isFetchingDetail,
    isUpdating,
    resellerDetail,
    totalEntries,
  } = useResellerTable({
    onEdit: (reseller) => {
      setSelectedReseller(reseller);
      setSelectedResellerId(reseller.id);
      setIsEditDialogOpen(true);
    },
    onDelete: (reseller) => {
      setSelectedReseller(reseller);
      setIsDeleteDialogOpen(true);
    },
  });

  const { register: registerAdd, formState: { errors: errorsAdd } } = addForm;
  const { register: registerEdit, formState: { errors: errorsEdit } } = editForm;

  React.useEffect(() => {
    if (resellerDetail) {
      editForm.reset({
        name: resellerDetail.name,
        email: resellerDetail.email,
        phone: resellerDetail.phone,
        address: resellerDetail.address,
        creditLimit: resellerDetail.credit_limit,
      });
    }
  }, [resellerDetail, editForm]);

  const handleSaveReseller = addForm.handleSubmit((data) => {
    addReseller(data);
    addForm.reset();
  });

  const handleUpdateReseller = editForm.handleSubmit((data) => {
    if (!selectedReseller) return;
    updateReseller(selectedReseller.id, data, () => {
      setIsEditDialogOpen(false);
      setSelectedReseller(null);
      setSelectedResellerId(null);
    });
  });

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuBriefcase className="text-primary" size={32} />
            Biro / Reseller
          </h1>
          <p className="text-muted-foreground font-medium">
            Kelola mitra biro dan reseller pencetakan beserta limit kredit
            plafon transaksi mereka.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-3xl overflow-hidden shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/30 p-6 bg-card">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <TextField
              placeholder="Cari reseller berdasarkan nama atau kontak..."
              prefixIcon={LuSearch}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-10 px-4 rounded-xl font-bold border-border/50 hover:bg-muted transition-all flex items-center gap-2"
            >
              <LuFilter size={18} />
              Filter
            </Button>
            <Button
              className="h-10 px-4 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <LuPlus size={18} />
              Tambah Reseller
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
                    colSpan={columns.length}
                    className="text-center py-10 text-muted-foreground animate-pulse"
                  >
                    Memuat data mitra reseller...
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
                    colSpan={columns.length}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Tidak ada data reseller ditemukan.
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

      {/* Add Reseller Dialog */}
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
              Tambah Mitra Reseller Baru
            </CardTitle>
            <CardDescription className="text-sm">
              Masukkan detail informasi reseller beserta batas/limit kredit
              plafon transaksi.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted active:scale-90 transition-all -mr-2 -mt-0.5"
            onClick={() => setIsAddDialogOpen(false)}
          >
            <LuX className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resellerName" className="text-sm font-semibold">
              Nama Reseller / Biro
            </Label>
            <TextField
              id="resellerName"
              {...registerAdd("name")}
              placeholder="Contoh: Joni Biro, Sinar Printing, dll"
              className="border-border/50 focus:bg-background transition-all"
              variant={errorsAdd.name ? "error" : "default"}
              disabled={isAdding}
            />
            {errorsAdd.name && (
              <HelperText variant="error">{errorsAdd.name.message}</HelperText>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resellerEmail" className="text-sm font-semibold">
                Email Mitra
              </Label>
              <TextField
                id="resellerEmail"
                type="email"
                {...registerAdd("email")}
                placeholder="Contoh: biro.joni@gmail.com"
                className="border-border/50 focus:bg-background transition-all"
                variant={errorsAdd.email ? "error" : "default"}
                disabled={isAdding}
              />
              {errorsAdd.email && (
                <HelperText variant="error">{errorsAdd.email.message}</HelperText>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="resellerPhone" className="text-sm font-semibold">
                Nomor Telepon / WA
              </Label>
              <TextField
                id="resellerPhone"
                {...registerAdd("phone")}
                placeholder="Contoh: 081234567890"
                className="border-border/50 focus:bg-background transition-all"
                variant={errorsAdd.phone ? "error" : "default"}
                disabled={isAdding}
              />
              {errorsAdd.phone && (
                <HelperText variant="error">{errorsAdd.phone.message}</HelperText>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="resellerCreditLimit"
              className="text-sm font-semibold"
            >
              Limit Kredit (Rupiah Plafon)
            </Label>
            <TextField
              id="resellerCreditLimit"
              type="number"
              {...registerAdd("creditLimit", { valueAsNumber: true })}
              placeholder="Contoh: 5000000"
              className="border-border/50 focus:bg-background transition-all"
              variant={errorsAdd.creditLimit ? "error" : "default"}
              disabled={isAdding}
            />
            {errorsAdd.creditLimit && (
              <HelperText variant="error">{errorsAdd.creditLimit.message}</HelperText>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resellerAddress" className="text-sm font-semibold">
              Alamat Kantor/Toko
            </Label>
            <textarea
              id="resellerAddress"
              {...registerAdd("address")}
              className={`w-full min-h-[80px] rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none ${
                errorsAdd.address ? "border-rose-500 focus-visible:ring-rose-500" : "border-border/50"
              }`}
              placeholder="Tuliskan alamat lengkap mitra biro/reseller..."
              disabled={isAdding}
            />
            {errorsAdd.address && (
              <HelperText variant="error">{errorsAdd.address.message}</HelperText>
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
            onClick={handleSaveReseller}
            disabled={isAdding}
          >
            {isAdding ? "Menyimpan..." : "Simpan Mitra"}
          </Button>
        </CardFooter>
      </Dialog>

      {/* Edit Reseller Dialog */}
      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedResellerId(null);
        }}
        size="md"
        showCloseButton={false}
      >
        <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-start justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Ubah Data Reseller
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Perbarui rincian informasi dan kredit limit plafon untuk mitra ini.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted active:scale-90 transition-all -mr-2 -mt-0.5"
            onClick={() => {
              setIsEditDialogOpen(false);
              setSelectedResellerId(null);
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
                Memuat data mitra...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editResellerName" className="text-sm font-semibold">
                  Nama Biro / Reseller
                </Label>
                <TextField
                  id="editResellerName"
                  {...registerEdit("name")}
                  placeholder="Contoh: CV. Jaya Grafika"
                  className="border-border/50 focus:bg-background transition-all"
                  variant={errorsEdit.name ? "error" : "default"}
                  disabled={isUpdating}
                />
                {errorsEdit.name && (
                  <HelperText variant="error">{errorsEdit.name.message}</HelperText>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editResellerEmail" className="text-sm font-semibold">
                    Email Mitra
                  </Label>
                  <TextField
                    id="editResellerEmail"
                    type="email"
                    {...registerEdit("email")}
                    placeholder="Contoh: biro.joni@gmail.com"
                    className="border-border/50 focus:bg-background transition-all"
                    variant={errorsEdit.email ? "error" : "default"}
                    disabled={isUpdating}
                  />
                  {errorsEdit.email && (
                    <HelperText variant="error">{errorsEdit.email.message}</HelperText>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editResellerPhone" className="text-sm font-semibold">
                    Nomor Telepon / WA
                  </Label>
                  <TextField
                    id="editResellerPhone"
                    {...registerEdit("phone")}
                    placeholder="Contoh: 081234567890"
                    className="border-border/50 focus:bg-background transition-all"
                    variant={errorsEdit.phone ? "error" : "default"}
                    disabled={isUpdating}
                  />
                  {errorsEdit.phone && (
                    <HelperText variant="error">{errorsEdit.phone.message}</HelperText>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="editResellerCreditLimit"
                  className="text-sm font-semibold"
                >
                  Limit Kredit (Rupiah Plafon)
                </Label>
                <TextField
                  id="editResellerCreditLimit"
                  type="number"
                  {...registerEdit("creditLimit", { valueAsNumber: true })}
                  placeholder="Contoh: 5000000"
                  className="border-border/50 focus:bg-background transition-all"
                  variant={errorsEdit.creditLimit ? "error" : "default"}
                  disabled={isUpdating}
                />
                {errorsEdit.creditLimit && (
                  <HelperText variant="error">{errorsEdit.creditLimit.message}</HelperText>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="editResellerAddress" className="text-sm font-semibold">
                  Alamat Kantor/Toko
                </Label>
                <textarea
                  id="editResellerAddress"
                  {...registerEdit("address")}
                  className={`w-full min-h-[80px] rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none ${
                    errorsEdit.address ? "border-rose-500 focus-visible:ring-rose-500" : "border-border/50"
                  }`}
                  placeholder="Tuliskan alamat lengkap mitra biro/reseller..."
                  disabled={isUpdating}
                />
                {errorsEdit.address && (
                  <HelperText variant="error">{errorsEdit.address.message}</HelperText>
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
              setSelectedResellerId(null);
            }}
            disabled={isUpdating}
          >
            Batal
          </Button>
          <Button
            className="h-10 px-4 rounded-md font-medium bg-primary hover:bg-primary/90 active:scale-95 transition-all"
            onClick={handleUpdateReseller}
            disabled={isFetchingDetail || isUpdating}
          >
            {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </CardFooter>
      </Dialog>

      {/* Delete Reseller Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        size="sm"
        showCloseButton={false}
      >
        <CardHeader className="px-6 py-4 border-b border-border/50">
          <h2 className="text-lg font-bold tracking-tight text-rose-600">
            Hapus Mitra Reseller
          </h2>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-foreground font-medium">
            Apakah Anda yakin ingin menghapus mitra <strong>{selectedReseller?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
        </CardContent>
        <CardFooter className="px-6 py-4 border-t border-border/50 flex justify-end gap-2">
          <Button
            variant="outline"
            className="h-9 px-3 rounded-md font-medium border-border/50 hover:bg-muted/50 active:scale-95 transition-all"
            onClick={() => setIsDeleteDialogOpen(false)}
          >
            Batal
          </Button>
          <Button
            className="h-9 px-3 rounded-md font-medium bg-rose-600 hover:bg-rose-700 text-white active:scale-95 transition-all"
            onClick={() => {
              if (selectedReseller) {
                deleteReseller(selectedReseller.id, selectedReseller.name);
                setIsDeleteDialogOpen(false);
                setSelectedReseller(null);
              }
            }}
          >
            Ya, Hapus
          </Button>
        </CardFooter>
      </Dialog>
    </div>
  );
};

export default ResellerPage;
