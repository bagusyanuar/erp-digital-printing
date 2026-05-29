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
  LuSlidersHorizontal,
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
import { attributeInputSchema } from "@infrastructure/attribute/validators";
import type { CreateAttributeInput } from "@core/attribute/applications/inputs";
import { useAttributeTable, type Attribute } from "../hooks/useAttributeTable";

const AttributePage = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(
    null,
  );

  // States for dynamic options list
  const [addOptions, setAddOptions] = useState<string[]>([]);
  const [newAddOption, setNewAddOption] = useState("");

  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [newEditOption, setNewEditOption] = useState("");

  const addForm = useForm<CreateAttributeInput>({
    resolver: zodResolver(attributeInputSchema),
    defaultValues: { name: "", value_type: "text", options: [] },
  });

  const editForm = useForm<CreateAttributeInput>({
    resolver: zodResolver(attributeInputSchema),
    defaultValues: { name: "", value_type: "text", options: [] },
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
    addAttribute,
    updateAttribute,
    deleteAttribute,
    totalEntries,
  } = useAttributeTable({
    onEdit: (attribute) => {
      setSelectedAttribute(attribute);
      editForm.reset({
        name: attribute.name,
        value_type: attribute.value_type || "text",
        options: attribute.options || [],
      });
      setEditOptions(attribute.options || []);
      setIsEditDialogOpen(true);
    },
    onDelete: (attribute) => {
      setSelectedAttribute(attribute);
      setIsDeleteDialogOpen(true);
    },
  });

  const {
    register: registerAdd,
    watch: watchAdd,
    setValue: setValueAdd,
    formState: { errors: errorsAdd },
  } = addForm;

  const {
    register: registerEdit,
    watch: watchEdit,
    setValue: setValueEdit,
    formState: { errors: errorsEdit },
  } = editForm;



  const handleAddOption = () => {
    if (newAddOption.trim() && !addOptions.includes(newAddOption.trim())) {
      const updated = [...addOptions, newAddOption.trim()];
      setAddOptions(updated);
      setValueAdd("options", updated);
      setNewAddOption("");
    }
  };

  const handleRemoveAddOption = (opt: string) => {
    const updated = addOptions.filter((o) => o !== opt);
    setAddOptions(updated);
    setValueAdd("options", updated);
  };

  const handleEditOption = () => {
    if (newEditOption.trim() && !editOptions.includes(newEditOption.trim())) {
      const updated = [...editOptions, newEditOption.trim()];
      setEditOptions(updated);
      setValueEdit("options", updated);
      setNewEditOption("");
    }
  };

  const handleRemoveEditOption = (opt: string) => {
    const updated = editOptions.filter((o) => o !== opt);
    setEditOptions(updated);
    setValueEdit("options", updated);
  };

  const handleSaveAttribute = addForm.handleSubmit((data) => {
    addAttribute(
      data.name,
      addOptions.length > 0 ? "options" : "text",
      addOptions
    );
    addForm.reset();
    setAddOptions([]);
  });

  const handleUpdateAttribute = editForm.handleSubmit((data) => {
    if (!selectedAttribute) return;
    updateAttribute(
      selectedAttribute.id,
      data.name,
      editOptions.length > 0 ? "options" : "text",
      editOptions,
      () => {
        setIsEditDialogOpen(false);
        setSelectedAttribute(null);
        setEditOptions([]);
      }
    );
  });

  const handleDeleteConfirm = () => {
    if (!selectedAttribute) return;
    deleteAttribute(selectedAttribute.id, () => {
      setIsDeleteDialogOpen(false);
      setSelectedAttribute(null);
    });
  };

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuSlidersHorizontal className="text-primary" size={32} />
            Master Atribut
          </h1>
          <p className="text-muted-foreground font-medium">
            Kelola spesifikasi atribut dinamis (EAV) beserta opsi nilainya untuk produk Anda.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-3xl overflow-hidden shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/30 p-6 bg-card">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <TextField
              placeholder="Cari atribut..."
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
              onClick={() => {
                addForm.reset();
                setAddOptions([]);
                setIsAddDialogOpen(true);
              }}
            >
              <LuPlus size={18} />
              Tambah Atribut
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
                    Memuat data atribut...
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
                    Tidak ada atribut ditemukan.
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
        <form onSubmit={handleSaveAttribute}>
          <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-start justify-between gap-4">
            <div className="space-y-0.5">
              <CardTitle variant="h4" weight="semibold" className="text-lg tracking-tight">
                Tambah Atribut Baru
              </CardTitle>
              <CardDescription className="text-sm">
                Definisikan nama atribut spesifikasi baru beserta opsi nilainya.
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
            
            {/* Nama Atribut */}
            <div className="space-y-2">
              <Typography variant="small" weight="medium" className="text-sm">
                Nama Atribut <span className="text-rose-500">*</span>
              </Typography>
              <TextField
                placeholder="Contoh: Sisi, Gramasi, Ukuran, dll"
                className="border-border/50 focus:bg-background transition-all"
                disabled={isAdding}
                {...registerAdd("name")}
              />
              {errorsAdd.name && (
                <HelperText variant="error">{errorsAdd.name.message}</HelperText>
              )}
            </div>

            {/* Options List Builder */}
            <div className="space-y-3 pt-2 border-t border-border/30">
              <div className="space-y-1">
                <Typography variant="small" weight="bold" className="text-sm">
                  Daftar Pilihan Nilai (Opsional)
                </Typography>
                <Typography className="text-[13px] text-muted-foreground">
                  Biarkan kosong jika atribut ini berupa input teks bebas.
                </Typography>
              </div>
              
              <div className="flex gap-2">
                <TextField
                  placeholder="Contoh: 1 Sisi, 2 Sisi, 150g"
                  value={newAddOption}
                  onChange={(e) => setNewAddOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  disabled={isAdding}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddOption}
                  disabled={isAdding || !newAddOption.trim()}
                  className="h-10 px-4 rounded-xl font-bold bg-primary text-white"
                >
                  Tambah
                </Button>
              </div>

              {/* Options Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {addOptions.length > 0 ? (
                  addOptions.map((opt) => (
                    <span
                      key={opt}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20"
                    >
                      {opt}
                      <button
                        type="button"
                        onClick={() => handleRemoveAddOption(opt)}
                        className="hover:text-rose-500 transition-colors"
                        disabled={isAdding}
                      >
                        <LuX size={12} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic font-semibold">
                    Belum ada opsi ditambahkan. Masukkan opsi nilai di atas.
                  </span>
                )}
              </div>
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
              {isAdding ? "Menyimpan..." : "Simpan Atribut"}
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
        <form onSubmit={handleUpdateAttribute}>
          <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-start justify-between gap-4">
            <div className="space-y-0.5">
              <CardTitle variant="h4" weight="semibold" className="text-lg tracking-tight">
                Ubah Atribut
              </CardTitle>
              <CardDescription className="text-sm">
                Perbarui data nama atribut spesifikasi produk beserta opsinya.
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
            
            {/* Nama Atribut */}
            <div className="space-y-2">
              <Typography variant="small" weight="medium" className="text-sm">
                Nama Atribut <span className="text-rose-500">*</span>
              </Typography>
              <TextField
                placeholder="Contoh: Sisi, Gramasi, Ukuran, dll"
                className="border-border/50 focus:bg-background transition-all"
                disabled={isUpdating}
                {...registerEdit("name")}
              />
              {errorsEdit.name && (
                <HelperText variant="error">{errorsEdit.name.message}</HelperText>
              )}
            </div>

            {/* Options List Builder */}
            <div className="space-y-3 pt-2 border-t border-border/30">
              <div className="space-y-1">
                <Typography variant="small" weight="bold" className="text-sm">
                  Daftar Pilihan Nilai (Opsional)
                </Typography>
                <Typography className="text-[13px] text-muted-foreground">
                  Biarkan kosong jika atribut ini berupa input teks bebas.
                </Typography>
              </div>
              
              <div className="flex gap-2">
                <TextField
                  placeholder="Contoh: 1 Sisi, 2 Sisi, 150g"
                  value={newEditOption}
                  onChange={(e) => setNewEditOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleEditOption();
                    }
                  }}
                  disabled={isUpdating}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleEditOption}
                  disabled={isUpdating || !newEditOption.trim()}
                  className="h-10 px-4 rounded-xl font-bold bg-primary text-white"
                >
                  Tambah
                </Button>
              </div>

              {/* Options Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {editOptions.length > 0 ? (
                  editOptions.map((opt) => (
                    <span
                      key={opt}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20"
                    >
                      {opt}
                      <button
                        type="button"
                        onClick={() => handleRemoveEditOption(opt)}
                        className="hover:text-rose-500 transition-colors"
                        disabled={isUpdating}
                      >
                        <LuX size={12} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic font-semibold">
                    Belum ada opsi ditambahkan. Masukkan opsi nilai di atas.
                  </span>
                )}
              </div>
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
              {isUpdating ? "Memperbarui..." : "Perbarui Atribut"}
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
              Hapus Atribut
            </Typography>
            <Typography className="text-muted-foreground text-sm max-w-xs">
              Apakah Anda yakin ingin menghapus atribut{" "}
              <span className="font-bold text-foreground">
                "{selectedAttribute?.name}"
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
            {isDeleting ? "Menghapus..." : "Hapus Atribut"}
          </Button>
        </CardFooter>
      </Dialog>
    </div>
  );
};

export default AttributePage;
