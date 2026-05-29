import React, { useState } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Typography } from "@erp-digital-printing/ui/Typography";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@erp-digital-printing/ui/Card";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import {
  LuPlus,
  LuSearch,
  LuTags,
  LuX,
  LuTrash2,
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
import { categoryInputSchema } from "@infrastructure/category/validators";
import type { CreateCategoryInput } from "@core/category/applications/inputs";
import { useCategoryTable, type Category } from "../hooks/useCategoryTable";

const CategoryPage = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const addForm = useForm<CreateCategoryInput>({
    resolver: zodResolver(categoryInputSchema),
    defaultValues: { name: "" },
  });

  const editForm = useForm<CreateCategoryInput>({
    resolver: zodResolver(categoryInputSchema),
    defaultValues: { name: "" },
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
    addCategory,
    updateCategory,
    deleteCategory,
    totalEntries,
  } = useCategoryTable({
    onEdit: (category) => {
      setSelectedCategory(category);
      editForm.reset({ name: category.name });
      setIsEditDialogOpen(true);
    },
    onDelete: (category) => {
      setSelectedCategory(category);
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

  const handleSaveCategory = addForm.handleSubmit((data) => {
    addCategory(data.name);
    addForm.reset();
  });

  const handleUpdateCategory = editForm.handleSubmit((data) => {
    if (!selectedCategory) return;
    updateCategory(selectedCategory.id, data.name, () => {
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
    });
  });

  const handleDeleteConfirm = () => {
    if (!selectedCategory) return;
    deleteCategory(selectedCategory.id, () => {
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    });
  };

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuTags className="text-primary" size={32} />
            Master Kategori
          </h1>
          <p className="text-muted-foreground font-medium">
            Kelola kategori produk dan jasa percetakan Anda.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-3xl overflow-hidden shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/30 p-6 bg-card">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <TextField
              placeholder="Cari kategori..."
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
              Tambah Kategori
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
                        header.column.id === "actions" ? "text-right" : ""
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
                    Memuat data kategori...
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
                    className="h-24 text-center text-muted-foreground"
                  >
                    Tidak ada kategori ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Table Footer / Pagination */}
        <TablePagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          pageSize={table.getState().pagination.pageSize}
          totalEntries={totalEntries}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      </Card>

      {/* Add Dialog */}
      <Dialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        size="md"
        showCloseButton={false}
      >
        <form onSubmit={handleSaveCategory}>
          <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-start justify-between gap-4">
            <div className="space-y-0.5">
              <CardTitle variant="h4" weight="semibold" className="text-lg tracking-tight">
                Tambah Kategori Baru
              </CardTitle>
              <CardDescription className="text-sm">
                Masukkan detail kategori produk digital printing baru.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted active:scale-90 transition-all -mr-2 -mt-0.5"
              type="button"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isAdding}
            >
              <LuX className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Typography variant="small" weight="medium" className="text-sm">
                Nama Kategori
              </Typography>
              <TextField
                placeholder="Contoh: Large Format, Merchandise, dll"
                className="border-border/50 focus:bg-background transition-all"
                disabled={isAdding}
                {...registerAdd("name")}
              />
              {errorsAdd.name && (
                <HelperText variant="error">{errorsAdd.name.message}</HelperText>
              )}
            </div>
          </CardContent>

          <CardFooter className="px-6 py-4 border-t border-border/50 flex justify-end gap-2">
            <Button
              variant="outline"
              className="h-10 px-4 rounded-md font-medium border-border/50 hover:bg-muted/50 active:scale-95 transition-all"
              type="button"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isAdding}
            >
              Batal
            </Button>
            <Button
              className="h-10 px-4 rounded-md font-medium bg-primary hover:bg-primary/90 active:scale-95 transition-all text-white"
              type="submit"
              disabled={isAdding}
            >
              {isAdding ? "Menyimpan..." : "Simpan Kategori"}
            </Button>
          </CardFooter>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        size="md"
        showCloseButton={false}
      >
        <form onSubmit={handleUpdateCategory}>
          <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-start justify-between gap-4">
            <div className="space-y-0.5">
              <CardTitle variant="h4" weight="semibold" className="text-lg tracking-tight">
                Ubah Kategori
              </CardTitle>
              <CardDescription className="text-sm">
                Perbarui data kategori produk digital printing Anda.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted active:scale-90 transition-all -mr-2 -mt-0.5"
              type="button"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              <LuX className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Typography variant="small" weight="medium" className="text-sm">
                Nama Kategori
              </Typography>
              <TextField
                placeholder="Contoh: Large Format, Merchandise, dll"
                className="border-border/50 focus:bg-background transition-all"
                disabled={isUpdating}
                {...registerEdit("name")}
              />
              {errorsEdit.name && (
                <HelperText variant="error">{errorsEdit.name.message}</HelperText>
              )}
            </div>
          </CardContent>

          <CardFooter className="px-6 py-4 border-t border-border/50 flex justify-end gap-2">
            <Button
              variant="outline"
              className="h-10 px-4 rounded-md font-medium border-border/50 hover:bg-muted/50 active:scale-95 transition-all"
              type="button"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Batal
            </Button>
            <Button
              className="h-10 px-4 rounded-md font-medium bg-primary hover:bg-primary/90 active:scale-95 transition-all text-white"
              type="submit"
              disabled={isUpdating}
            >
              {isUpdating ? "Memperbarui..." : "Perbarui Kategori"}
            </Button>
          </CardFooter>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        size="md"
        showCloseButton={false}
      >
        <CardContent className="pt-6 px-6 pb-4 flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
            <LuTrash2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <Typography variant="h4" weight="semibold" className="text-lg text-foreground">
              Hapus Kategori
            </Typography>
            <Typography className="text-muted-foreground text-sm max-w-xs">
              Apakah Anda yakin ingin menghapus kategori{" "}
              <span className="font-bold text-foreground">
                "{selectedCategory?.name}"
              </span>
              ? Tindakan ini bersifat permanen.
            </Typography>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-4 bg-muted/30 border-t border-border/50 flex justify-end gap-2">
          <Button
            variant="outline"
            className="h-10 px-4 rounded-md font-medium border-border/50 hover:bg-muted/50 active:scale-95 transition-all"
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            className="h-10 px-4 rounded-md font-medium bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-white flex items-center gap-2"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            <LuTrash2 className="h-4 w-4" />
            {isDeleting ? "Menghapus..." : "Hapus Kategori"}
          </Button>
        </CardFooter>
      </Dialog>
    </div>
  );
};

export default CategoryPage;