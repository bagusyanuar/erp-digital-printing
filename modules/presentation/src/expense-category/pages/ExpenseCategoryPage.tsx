import React, { useState, useMemo } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Typography } from "@erp-digital-printing/ui/Typography";
import { Label } from "@erp-digital-printing/ui/Label";
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
  LuReceipt,
  LuX,
  LuTrash2,
  LuPencil,
  LuCheck,
} from "@erp-digital-printing/ui/icons";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@erp-digital-printing/ui/Table";
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
} from "@erp-digital-printing/ui/Combobox";

// Define Interfaces
interface ProductCategory {
  id: string;
  name: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  group: "OPERATIONAL" | "PRODUCTION";
  productCategoryId: string | null;
  productCategoryName?: string;
}

// Mock Data
const MOCK_PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: "pc-1", name: "A3+ Printing" },
  { id: "pc-2", name: "Banner (MMT & Kain)" },
  { id: "pc-3", name: "Indoor Media" },
  { id: "pc-4", name: "Merchandise & Gift" },
  { id: "pc-5", name: "Sticker & Label" },
];

const INITIAL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: "ec-1", name: "Sewa Ruko Utama", group: "OPERATIONAL", productCategoryId: null },
  { id: "ec-2", name: "Tagihan Listrik & Internet", group: "OPERATIONAL", productCategoryId: null },
  { id: "ec-3", name: "Kertas Art Paper & Carton", group: "PRODUCTION", productCategoryId: "pc-1" },
  { id: "ec-4", name: "Bahan Flexi 280g & 340g", group: "PRODUCTION", productCategoryId: "pc-2" },
  { id: "ec-5", name: "Gaji & Lembur Karyawan", group: "OPERATIONAL", productCategoryId: null },
  { id: "ec-6", name: "Tinta Cetak Eco-Solvent", group: "PRODUCTION", productCategoryId: "pc-3" },
];

const ExpenseCategoryPage = () => {
  // States
  const [categories, setCategories] = useState<ExpenseCategory[]>(INITIAL_EXPENSE_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<"ALL" | "OPERATIONAL" | "PRODUCTION">("ALL");

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);

  // Form States
  const [formName, setFormName] = useState("");
  const [formGroup, setFormGroup] = useState<"OPERATIONAL" | "PRODUCTION">("OPERATIONAL");
  const [formProductCategoryId, setFormProductCategoryId] = useState("");
  const [formError, setFormError] = useState("");

  // Map product categories for easy name lookup
  const productCategoryMap = useMemo(() => {
    const map = new Map<string, string>();
    MOCK_PRODUCT_CATEGORIES.forEach((pc) => map.set(pc.id, pc.name));
    return map;
  }, []);

  // Filter Categories
  const filteredCategories = useMemo(() => {
    return categories
      .map((cat) => ({
        ...cat,
        productCategoryName: cat.productCategoryId ? productCategoryMap.get(cat.productCategoryId) : undefined,
      }))
      .filter((cat) => {
        const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (cat.productCategoryName?.toLowerCase() || "").includes(searchQuery.toLowerCase());
        
        const matchesGroup = selectedGroupFilter === "ALL" || cat.group === selectedGroupFilter;
        
        return matchesSearch && matchesGroup;
      });
  }, [categories, searchQuery, selectedGroupFilter, productCategoryMap]);

  // Open Form Dialog (Create)
  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setFormName("");
    setFormGroup("OPERATIONAL");
    setFormProductCategoryId("");
    setFormError("");
    setIsFormOpen(true);
  };

  // Open Form Dialog (Edit)
  const handleOpenEdit = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setFormName(category.name);
    setFormGroup(category.group);
    setFormProductCategoryId(category.productCategoryId || "");
    setFormError("");
    setIsFormOpen(true);
  };

  // Open Delete Dialog
  const handleOpenDelete = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  // Handle Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validasi dasar
    if (!formName.trim()) {
      setFormError("Nama kategori wajib diisi.");
      return;
    }

    // Validasi kondisional group PRODUCTION
    if (formGroup === "PRODUCTION" && !formProductCategoryId) {
      setFormError("Kategori produk wajib dipilih jika grup adalah PRODUCTION.");
      return;
    }

    const targetProductCategoryId = formGroup === "PRODUCTION" ? formProductCategoryId : null;

    if (selectedCategory) {
      // Edit mode
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === selectedCategory.id
            ? {
                ...cat,
                name: formName,
                group: formGroup,
                productCategoryId: targetProductCategoryId,
              }
            : cat
        )
      );
    } else {
      // Create mode
      const newCategory: ExpenseCategory = {
        id: `ec-${Date.now()}`,
        name: formName,
        group: formGroup,
        productCategoryId: targetProductCategoryId,
      };
      setCategories((prev) => [...prev, newCategory]);
    }

    setIsFormOpen(false);
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = () => {
    if (!selectedCategory) return;
    setCategories((prev) => prev.filter((cat) => cat.id !== selectedCategory.id));
    setIsDeleteOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuReceipt className="text-primary" size={32} />
            Kategori Pengeluaran
          </h1>
          <p className="text-muted-foreground font-medium">
            Kelola kategori pengeluaran operasional dan biaya produksi percetakan.
          </p>
        </div>
      </div>

      {/* Filter and Table Card */}
      <Card className="rounded-3xl overflow-hidden shadow-sm border-border/50">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/30 p-6 bg-card">
          {/* Search & Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto flex-1 max-w-2xl">
            <div className="relative flex-1">
              <TextField
                placeholder="Cari kategori pengeluaran..."
                prefixIcon={LuSearch}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10"
              />
            </div>
            
            {/* Filter Group Tabs */}
            <div className="flex bg-muted p-1 rounded-xl border border-border/50">
              <button
                type="button"
                onClick={() => setSelectedGroupFilter("ALL")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedGroupFilter === "ALL"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setSelectedGroupFilter("OPERATIONAL")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedGroupFilter === "OPERATIONAL"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Operational
              </button>
              <button
                type="button"
                onClick={() => setSelectedGroupFilter("PRODUCTION")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedGroupFilter === "PRODUCTION"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Production
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              className="h-10 px-4 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              onClick={handleOpenCreate}
            >
              <LuPlus size={18} />
              Tambah Kategori
            </Button>
          </div>
        </CardHeader>

        {/* Table Content */}
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-sm">Nama Kategori</TableHead>
                <TableHead className="font-bold text-sm">Grup Pengeluaran</TableHead>
                <TableHead className="font-bold text-sm">Kategori Produk Terkait</TableHead>
                <TableHead className="text-right font-bold text-sm pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-semibold">{row.name}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold tracking-wide ${
                          row.group === "PRODUCTION"
                            ? "bg-sky-500/10 text-sky-600 border border-sky-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        }`}
                      >
                        {row.group}
                      </span>
                    </TableCell>
                    <TableCell>
                      {row.group === "PRODUCTION" && row.productCategoryName ? (
                        <span className="text-foreground font-medium bg-muted/60 px-2.5 py-1 rounded-lg border border-border/40 text-xs">
                          {row.productCategoryName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60 font-light">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 active:scale-90 transition-all"
                          onClick={() => handleOpenEdit(row)}
                        >
                          <LuPencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/5 active:scale-90 transition-all"
                          onClick={() => handleOpenDelete(row)}
                        >
                          <LuTrash2 size={15} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-muted-foreground font-medium"
                  >
                    Tidak ada kategori pengeluaran ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        size="md"
        showCloseButton={false}
      >
        <form onSubmit={handleSubmit}>
          <CardHeader className="px-6 py-5 border-b border-border/50 flex flex-row items-start justify-between gap-4">
            <div className="space-y-0.5">
              <CardTitle variant="h4" weight="semibold" className="text-lg tracking-tight">
                {selectedCategory ? "Ubah Kategori Pengeluaran" : "Tambah Kategori Pengeluaran"}
              </CardTitle>
              <CardDescription className="text-sm">
                Tentukan nama, kelompok biaya operasional/produksi, dan relasi kategori produknya.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted active:scale-90 transition-all -mr-2 -mt-0.5"
              type="button"
              onClick={() => setIsFormOpen(false)}
            >
              <LuX className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="px-6 py-5 space-y-5">
            {formError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs rounded-xl font-semibold">
                {formError}
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="category-name" className="text-sm font-semibold">Nama Kategori</Label>
              <TextField
                id="category-name"
                placeholder="Contoh: Pembelian Kertas Art Paper, Biaya Listrik Bulanan"
                className="border-border/50 focus:bg-background transition-all"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {/* Group Toggle */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Grup Pengeluaran</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormGroup("OPERATIONAL");
                    setFormProductCategoryId("");
                  }}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    formGroup === "OPERATIONAL"
                      ? "border-emerald-500 bg-emerald-500/5 text-emerald-800"
                      : "border-border/50 bg-background text-muted-foreground hover:border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-bold">OPERATIONAL</span>
                    {formGroup === "OPERATIONAL" && (
                      <span className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <LuCheck size={12} className="stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] opacity-80 mt-1 font-medium">Beban operasional umum seperti sewa, listrik, internet, gaji.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormGroup("PRODUCTION")}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    formGroup === "PRODUCTION"
                      ? "border-sky-500 bg-sky-500/5 text-sky-800"
                      : "border-border/50 bg-background text-muted-foreground hover:border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-bold">PRODUCTION</span>
                    {formGroup === "PRODUCTION" && (
                      <span className="h-5 w-5 rounded-full bg-sky-500 flex items-center justify-center text-white">
                        <LuCheck size={12} className="stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] opacity-80 mt-1 font-medium">Biaya langsung untuk produksi cetak yang wajib terikat kategori produk.</span>
                </button>
              </div>
            </div>

            {/* Product Category Selector (Conditional) */}
            {formGroup === "PRODUCTION" && (
              <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                <Label htmlFor="product-category" className="text-sm font-semibold">
                  Kategori Produk Terkait <span className="text-rose-500">*</span>
                </Label>
                <Combobox
                  value={formProductCategoryId}
                  onValueChange={setFormProductCategoryId}
                >
                  <ComboboxTrigger className="font-semibold w-full h-11 border rounded-xl px-3 border-border/50 text-sm bg-background text-left flex items-center justify-between">
                    <span>
                      {MOCK_PRODUCT_CATEGORIES.find((pc) => pc.id === formProductCategoryId)
                        ?.name || "-- Pilih Kategori Produk --"}
                    </span>
                  </ComboboxTrigger>
                  <ComboboxContent
                    align="start"
                    className="w-[var(--radix-popover-trigger-width)] bg-background border border-border/80 shadow-lg rounded-xl overflow-hidden z-[10000]"
                  >
                    <ComboboxInput placeholder="Cari kategori produk..." />
                    <ComboboxEmpty>Kategori produk tidak ditemukan.</ComboboxEmpty>
                    <ComboboxList className="max-h-60 overflow-y-auto p-1">
                      {MOCK_PRODUCT_CATEGORIES.map((pc) => (
                        <ComboboxItem key={pc.id} value={pc.id} className="text-sm rounded-lg">
                          {pc.name}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <p className="text-[10px] text-muted-foreground">
                  Pilih kategori produk cetak yang membutuhkan pengeluaran produksi ini.
                </p>
              </div>
            )}
          </CardContent>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-3 bg-muted/20">
            <Button
              variant="outline"
              className="h-10 px-4 rounded-xl font-medium border-border/50 hover:bg-muted active:scale-95 transition-all"
              type="button"
              onClick={() => setIsFormOpen(false)}
            >
              Batal
            </Button>
            <Button
              className="h-10 px-4 rounded-xl font-bold bg-primary hover:bg-primary/95 text-white active:scale-95 transition-all"
              type="submit"
            >
              {selectedCategory ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        size="md"
        showCloseButton={false}
      >
        <CardContent className="pt-8 px-6 pb-5 flex flex-col items-center text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
            <LuTrash2 className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <Typography variant="h4" weight="semibold" className="text-lg text-foreground tracking-tight">
              Hapus Kategori Pengeluaran
            </Typography>
            <Typography className="text-muted-foreground text-sm max-w-sm">
              Apakah Anda yakin ingin menghapus kategori pengeluaran{" "}
              <span className="font-bold text-foreground">
                "{selectedCategory?.name}"
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </Typography>
          </div>
        </CardContent>
        <div className="px-6 py-4 bg-muted/30 border-t border-border/50 flex justify-end gap-3">
          <Button
            variant="outline"
            className="h-10 px-4 rounded-xl font-medium border-border/50 hover:bg-muted active:scale-95 transition-all"
            onClick={() => setIsDeleteOpen(false)}
          >
            Batal
          </Button>
          <Button
            className="h-10 px-4 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-white flex items-center gap-2"
            onClick={handleDeleteConfirm}
          >
            <LuTrash2 className="h-4 w-4" />
            Hapus Kategori
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

export default ExpenseCategoryPage;
