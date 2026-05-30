import React, { useState, useMemo } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import {
  Card,
  CardHeader,
  CardContent,
} from "@erp-digital-printing/ui/Card";
import {
  LuPlus,
  LuSearch,
  LuDatabase,
  LuEllipsisVertical,
  LuPencil,
  LuTrash2,
  LuInfo,
} from "@erp-digital-printing/ui/icons";
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
import { useQuery } from "@tanstack/react-query";
import { useProductDI } from "../hooks/useProductDI";
import { productKeys } from "@infrastructure/product/keys";
import { useCategoryDI } from "@presentation/category/hooks/useCategoryDI";
import { categoryKeys } from "@infrastructure/category/keys";
import { useDebounce } from "../../shared/hooks/useDebounce";

interface Product {
  id: string;
  name: string;
  category: string;
  uom: string;
}

const columnHelper = createColumnHelper<Product>();

const ProductPage = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDetailProductId, setSelectedDetailProductId] = useState<string | null>(null);
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
  const { getProductsUseCase } = useProductDI();

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
              <DropdownContent align="end" className="w-36">
                <DropdownItem onClick={() => setSelectedDetailProductId(info.row.original.id)}>
                  <LuInfo className="h-3.5 w-3.5 text-primary" />
                  <span>Detail</span>
                </DropdownItem>
                <DropdownItem>
                  <LuPencil className="h-3.5 w-3.5 text-blue-600" />
                  <span>Ubah</span>
                </DropdownItem>
                <DropdownItem variant="danger">
                  <LuTrash2 className="h-3.5 w-3.5 text-rose-600" />
                  <span>Hapus</span>
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>
        ),
      }),
    ],
    []
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
    </div>
  );
};

export default ProductPage;
