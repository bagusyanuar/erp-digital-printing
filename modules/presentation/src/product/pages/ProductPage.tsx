import React, { useState, useMemo } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@erp-digital-printing/ui/Card";
import {
  LuPlus,
  LuSearch,
  LuDatabase,
  LuEllipsisVertical,
  LuPencil,
  LuTrash2,
  LuInfo,
  LuArrowUp,
  LuArrowDown,
  LuHash,
  LuX,
} from "@erp-digital-printing/ui/icons";
import { Typography } from "@erp-digital-printing/ui/Typography";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@erp-digital-printing/ui/Dropdown";
import {
  flexRender,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TablePagination,
} from "@erp-digital-printing/ui/Table";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import FormProduct from "../components/FormProduct";
import DetailProduct from "../components/DetailProduct";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@erp-digital-printing/ui/Toast";
import { useProductDI } from "../hooks/useProductDI";
import { productKeys } from "@infrastructure/product/keys";
import { useCategoryDI } from "@presentation/category/hooks/useCategoryDI";
import { categoryKeys } from "@infrastructure/category/keys";
import { useDebounce } from "../../shared/hooks/useDebounce";
import type { AppError } from "@core/shared/errors/domain.error";

interface Product {
  id: string;
  name: string;
  category: string;
  uom: string;
  sequence?: number;
}

const columnHelper = createColumnHelper<Product>();

const ProductPage = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDetailProductId, setSelectedDetailProductId] = useState<string | null>(null);
  const [selectedEditProductId, setSelectedEditProductId] = useState<string | null>(null);
  const [selectedChangeSequenceProductId, setSelectedChangeSequenceProductId] = useState<string | null>(null);
  const [sequenceValue, setSequenceValue] = useState<number | "">("");
  const [selectedDeleteProduct, setSelectedDeleteProduct] = useState<Product | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("Semua");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const debouncedSearch = useDebounce(globalFilter, 750);

  // Sync pagination index back to first page when search or category changes
  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch, selectedCategoryFilter]);

  const { getCategoriesUseCase } = useCategoryDI();
  const { getProductsUseCase, reorderProductUseCase, deleteProductUseCase } = useProductDI();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProductUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success(
        "Produk Berhasil Dihapus",
        "Data produk telah berhasil dihapus dari sistem.",
      );
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Menghapus Produk",
        error.message || "Terjadi kesalahan.",
      );
    },
  });

  const handleDeleteConfirm = () => {
    if (!selectedDeleteProduct) return;
    deleteMutation.mutate(selectedDeleteProduct.id, {
      onSuccess: () => {
        setSelectedDeleteProduct(null);
      },
    });
  };

  const reorderMutation = useMutation({
    mutationFn: (input: { items: { id: string; sequence: number }[] }) =>
      reorderProductUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success(
        "Urutan Berhasil Diperbarui",
        "Urutan produk telah berhasil disimpan.",
      );
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Memperbarui Urutan",
        error.message || "Terjadi kesalahan.",
      );
    },
  });

  const reorderProducts = React.useCallback(
    (items: { id: string; sequence: number }[], onSuccess?: () => void) => {
      reorderMutation.mutate(
        { items },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        },
      );
    },
    [reorderMutation],
  );

  // Fetch categories dynamically for filter tabs
  const { data: categoryResponse } = useQuery({
    queryKey: categoryKeys.list({ limit: 100, page: 1 }),
    queryFn: () => getCategoriesUseCase.execute({ limit: 100, page: 1 }),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const categories = categoryResponse?.data ?? [];
  
  const categoriesList = useMemo(() => {
    return ["Semua", ...categories.map((c) => c.name)];
  }, [categories]);

  // Map selected category name to its ID
  const selectedCategoryId = useMemo(() => {
    if (selectedCategoryFilter === "Semua") return undefined;
    return categories.find((c) => c.name === selectedCategoryFilter)?.id;
  }, [selectedCategoryFilter, categories]);

  // Fetch products dynamically from backend DI
  const {
    data: productResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: productKeys.list({
      limit: pagination.pageSize,
      page: pagination.pageIndex + 1,
      search: debouncedSearch || undefined,
      category_id: selectedCategoryId,
    }),
    queryFn: () =>
      getProductsUseCase.execute({
        limit: pagination.pageSize,
        page: pagination.pageIndex + 1,
        search: debouncedSearch || undefined,
        category_id: selectedCategoryId,
      }),
    staleTime: 10_000,
    gcTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Map API response to Component Product model
  const products = useMemo(() => {
    const rawList = productResponse?.data ?? [];
    return rawList.map((model): Product => {
      const catObj = categories.find((c) => c.id === model.category_id);
      return {
        id: model.id || "",
        name: model.name,
        category: catObj?.name || "Kategori Lain",
        sequence: model.sequence ?? 0,
        uom: model.uom === "pcs"
          ? "PCS (pcs)"
          : model.uom === "m2"
          ? "Meter Persegi (m²)"
          : model.uom === "m_lari"
          ? "Meter Lari (m_lari)"
          : model.uom === "box"
          ? "Box (box)"
          : model.uom,
      };
    });
  }, [productResponse, categories]);

  const handleMoveUp = React.useCallback(
    (index: number) => {
      if (index <= 0) return;
      const current = products[index];
      const above = products[index - 1];

      if (!current || !above) return;

      reorderProducts([
        { id: current.id, sequence: above.sequence ?? 0 },
        { id: above.id, sequence: current.sequence ?? 0 },
      ]);
    },
    [products, reorderProducts],
  );

  const handleMoveDown = React.useCallback(
    (index: number) => {
      if (index >= products.length - 1) return;
      const current = products[index];
      const below = products[index + 1];

      if (!current || !below) return;

      reorderProducts([
        { id: current.id, sequence: below.sequence ?? 0 },
        { id: below.id, sequence: current.sequence ?? 0 },
      ]);
    },
    [products, reorderProducts],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Nama Produk / Bahan",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
              {info.getValue().charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-foreground text-sm leading-none">
              {info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("category", {
        header: "Kategori",
        cell: (info) => (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border/50">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("uom", {
        header: "Satuan (UoM)",
        cell: (info) => (
          <span className="font-semibold text-sm text-foreground/80">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("sequence", {
        header: "Urutan",
        cell: (info) => (
          <span className="font-semibold text-sm text-foreground/80">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Aksi",
        cell: (info) => (
          <div className="text-right">
            <Dropdown>
              <DropdownTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-muted/70 active:scale-95 transition-all"
                >
                  <LuEllipsisVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownTrigger>
              <DropdownContent align="end" className="w-48">
                <DropdownItem 
                  onClick={() => handleMoveUp(info.row.index)}
                  disabled={info.row.index === 0}
                >
                  <LuArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Pindah Atas</span>
                </DropdownItem>
                <DropdownItem 
                  onClick={() => handleMoveDown(info.row.index)}
                  disabled={info.row.index === products.length - 1}
                >
                  <LuArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Pindah Bawah</span>
                </DropdownItem>
                <DropdownItem onClick={() => {
                  setSelectedChangeSequenceProductId(info.row.original.id);
                  setSequenceValue(info.row.original.sequence ?? 0);
                }}>
                  <LuHash className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Ubah Urutan...</span>
                </DropdownItem>
                <DropdownItem onClick={() => setSelectedDetailProductId(info.row.original.id)}>
                  <LuInfo className="h-3.5 w-3.5 text-primary" />
                  <span>Detail</span>
                </DropdownItem>
                <DropdownItem onClick={() => setSelectedEditProductId(info.row.original.id)}>
                  <LuPencil className="h-3.5 w-3.5 text-blue-600" />
                  <span>Ubah</span>
                </DropdownItem>
                <DropdownItem
                  variant="danger"
                  onClick={() => setSelectedDeleteProduct(info.row.original)}
                >
                  <LuTrash2 className="h-3.5 w-3.5 text-rose-600" />
                  <span>Hapus</span>
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>
        ),
      }),
    ],
    [products, handleMoveUp, handleMoveDown]
  );

  const table = useReactTable({
    data: products,
    columns,
    state: {
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualFiltering: true,
    pageCount: Math.ceil((productResponse?.total ?? 0) / pagination.pageSize),
  });

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuDatabase className="text-primary" size={32} />
            Produk & Jasa
          </h1>
          <p className="text-muted-foreground font-medium">
            Kelola katalog bahan percetakan, produk custom, dan variasi harga cetak Anda.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-3xl overflow-hidden shadow-sm border-border/50">
        <CardHeader className="flex flex-col gap-4 border-b border-border/30 p-6 bg-card">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="flex-1 w-full md:max-w-md">
              <TextField
                placeholder="Cari produk atau satuan..."
                prefixIcon={LuSearch}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <Button
                className="h-10 px-4 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                onClick={() => setIsAdding(true)}
              >
                <LuPlus size={18} />
                Tambah Produk
              </Button>
            </div>
          </div>

          {/* Quick Categories Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categoriesList.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategoryFilter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategoryFilter(cat);
                  table.setPageIndex(0);
                }}
                className={`h-8 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedCategoryFilter === cat
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </CardHeader>

        {/* Table Body */}
        <CardContent className={`p-0 overflow-x-auto ${reorderMutation.isPending ? 'opacity-50 pointer-events-none' : 'transition-opacity duration-300'}`}>
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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
                      <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      Memuat Data Produk...
                    </div>
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
                    className="h-24 text-center text-muted-foreground font-semibold"
                  >
                    Tidak ada produk ditemukan.
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
          totalEntries={productResponse?.total ?? 0}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      </Card>

      {/* Add Product Modal (Stepper Form) */}
      <Dialog
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        size="xl"
        className="h-[90vh] max-h-[90vh] overflow-hidden flex flex-col"
        showCloseButton={false}
      >
        <FormProduct onBack={() => setIsAdding(false)} />
      </Dialog>

      {/* Edit Product Modal (Stepper Form) */}
      <Dialog
        isOpen={!!selectedEditProductId}
        onClose={() => setSelectedEditProductId(null)}
        size="xl"
        className="h-[90vh] max-h-[90vh] overflow-hidden flex flex-col"
        showCloseButton={false}
      >
        {selectedEditProductId && (
          <FormProduct
            productId={selectedEditProductId}
            onBack={() => setSelectedEditProductId(null)}
          />
        )}
      </Dialog>

      {/* Detail Product Modal */}
      <Dialog
        isOpen={!!selectedDetailProductId}
        onClose={() => setSelectedDetailProductId(null)}
        size="xl"
        className="h-[90vh] max-h-[90vh] overflow-hidden flex flex-col"
        showCloseButton={false}
      >
        {selectedDetailProductId && (
          <DetailProduct
            productId={selectedDetailProductId}
            onClose={() => setSelectedDetailProductId(null)}
          />
        )}
      </Dialog>

      {/* Change Sequence Dialog */}
      <Dialog
        isOpen={!!selectedChangeSequenceProductId}
        onClose={() => setSelectedChangeSequenceProductId(null)}
        size="sm"
        showCloseButton={false}
      >
        <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-start justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="font-semibold text-lg tracking-tight">
              Ubah Urutan
            </h4>
            <p className="text-sm text-muted-foreground">
              Tentukan urutan baru untuk produk ini.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted active:scale-90 transition-all -mr-2 -mt-0.5"
            onClick={() => setSelectedChangeSequenceProductId(null)}
          >
            <LuX className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <Typography variant="small" weight="medium" className="text-sm">
              Nomor Urutan
            </Typography>
            <TextField
              type="number"
              placeholder="Contoh: 1, 2, 3..."
              className="border-border/50 focus:bg-background transition-all"
              value={sequenceValue}
              onChange={(e) => setSequenceValue(e.target.value ? Number(e.target.value) : "")}
            />
          </div>
        </CardContent>
        <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-2">
          <Button
            variant="outline"
            className="h-10 px-4 rounded-md font-medium border-border/50 hover:bg-muted/50 active:scale-95 transition-all"
            onClick={() => setSelectedChangeSequenceProductId(null)}
          >
            Batal
          </Button>
          <Button
            className="h-10 px-4 rounded-md font-medium bg-primary hover:bg-primary/90 active:scale-95 transition-all text-white"
            onClick={() => {
              if (selectedChangeSequenceProductId && typeof sequenceValue === "number") {
                reorderProducts(
                  [{ id: selectedChangeSequenceProductId, sequence: sequenceValue }],
                  () => setSelectedChangeSequenceProductId(null)
                );
              }
            }}
            disabled={reorderMutation.isPending}
          >
            {reorderMutation.isPending ? "Menyimpan..." : "Simpan Urutan"}
          </Button>
        </div>
      </Dialog>

      {/* Delete Product Confirmation Dialog */}
      <Dialog
        isOpen={!!selectedDeleteProduct}
        onClose={() => setSelectedDeleteProduct(null)}
        size="md"
        showCloseButton={false}
      >
        <CardContent className="pt-6 px-6 pb-4 flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
            <LuTrash2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <Typography variant="h4" weight="semibold" className="text-lg text-foreground">
              Hapus Produk
            </Typography>
            <Typography className="text-muted-foreground text-sm max-w-xs">
              Apakah Anda yakin ingin menghapus produk{" "}
              <span className="font-bold text-foreground">
                "{selectedDeleteProduct?.name}"
              </span>
              ? Tindakan ini bersifat permanen.
            </Typography>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-4 bg-muted/30 border-t border-border/50 flex justify-end gap-2">
          <Button
            variant="outline"
            className="h-10 px-4 rounded-md font-medium border-border/50 hover:bg-muted/50 active:scale-95 transition-all"
            onClick={() => setSelectedDeleteProduct(null)}
            disabled={deleteMutation.isPending}
          >
            Batal
          </Button>
          <Button
            className="h-10 px-4 rounded-md font-medium bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-white flex items-center gap-2"
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isPending}
          >
            <LuTrash2 className="h-4 w-4" />
            {deleteMutation.isPending ? "Menghapus..." : "Hapus Produk"}
          </Button>
        </CardFooter>
      </Dialog>
    </div>
  );
};

export default ProductPage;
