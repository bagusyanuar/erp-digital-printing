import React, { useMemo } from "react";
import { Card, CardContent } from "@erp-digital-printing/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TablePagination,
} from "@erp-digital-printing/ui/Table";
import { TextField } from "@erp-digital-printing/ui/TextField";
import {
  DateRangePicker,
  type DateRange,
} from "@erp-digital-printing/ui/DateRangePicker";
import {
  LuTags,
  LuTag,
  LuDollarSign,
  LuSearch,
  LuShoppingBag,
  LuBoxes,
  LuTrendingUp,
  LuInfo,
} from "@erp-digital-printing/ui/icons";

export interface CategoryProductSale {
  id: string;
  categoryId: string;
  categoryName: string;
  productName: string;
  variantName: string;
  uom: string;
  totalQty: number;
  avgPrice: number;
  totalRevenue: number;
  orderCount: number;
}

export interface CategoryChipItem {
  id: string;
  name: string;
}

const DEFAULT_CATEGORY_CHIPS: CategoryChipItem[] = [
  { id: "all", name: "Semua Kategori" },
];

interface CategoryReportSellingProps {
  formatCurrency: (value: number) => string;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  availableCategories?: CategoryChipItem[];
  dateRange?: DateRange;
  setDateRange?: (range: DateRange | undefined) => void;
  stats?: {
    totalRevenue: number;
    totalProductsSold: number;
    transactionCount: number;
    totalItemSKU?: number;
  };
  isLoadingStats?: boolean;
  isLoading?: boolean;
  categoryProducts?: CategoryProductSale[];
  page: number;
  pageSize: number;
  totalEntries: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export const CategoryReportSelling: React.FC<CategoryReportSellingProps> = ({
  formatCurrency,
  selectedCategory,
  onSelectCategory,
  availableCategories = DEFAULT_CATEGORY_CHIPS,
  dateRange,
  setDateRange,
  stats,
  isLoadingStats,
  isLoading,
  categoryProducts = [],
  page,
  pageSize,
  totalEntries,
  onPageChange,
  onPageSizeChange,
  search,
  onSearchChange,
}) => {
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;

  // Aggregate KPIs based on selected category (calculated by backend)
  const categoryStats = useMemo(() => {
    return {
      totalRevenue: stats?.totalRevenue ?? 0,
      totalQty: stats?.totalProductsSold ?? 0,
      totalTransactions: stats?.transactionCount ?? 0,
      productCount: stats?.totalItemSKU ?? totalEntries,
    };
  }, [stats, totalEntries]);

  const activeCategoryLabel = useMemo(() => {
    const found = availableCategories.find((c) => c.id === selectedCategory);
    return found ? found.name : "Kategori Produk";
  }, [selectedCategory, availableCategories]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Category Filter Chips & Date Range Card */}
      <div className="bg-card border border-border/50 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <LuTags size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Filter Kategori Produk
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Pilih kategori dan rentang tanggal untuk melihat performa penjualan spesifik produk
              </p>
            </div>
          </div>

          {setDateRange && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-full sm:w-[260px] h-10"
              />
            </div>
          )}
        </div>

        {/* Flex Wrap Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {availableCategories.map((chip) => {
            const isActive = selectedCategory === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => onSelectCategory(chip.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                    : "bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border/40"
                }`}
              >
                <LuTag
                  size={13}
                  className={
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  }
                />
                <span>{chip.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omset Kategori */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Omset ({activeCategoryLabel})
              </span>
              <div
                className={`text-lg font-black tracking-tight text-foreground transition-opacity ${
                  isLoadingStats ? "opacity-40 animate-pulse" : ""
                }`}
              >
                {formatCurrency(categoryStats.totalRevenue)}
              </div>
            </div>
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <LuDollarSign size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Total Volume Qty */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Total Volume Produk
              </span>
              <div
                className={`text-lg font-black tracking-tight text-foreground transition-opacity ${
                  isLoadingStats ? "opacity-40 animate-pulse" : ""
                }`}
              >
                {categoryStats.totalQty.toLocaleString("id-ID")}{" "}
                <span className="text-xs font-bold text-muted-foreground">Qty</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <LuShoppingBag size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Total Transaksi */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Frekuensi Pesanan
              </span>
              <div
                className={`text-lg font-black tracking-tight text-foreground transition-opacity ${
                  isLoadingStats ? "opacity-40 animate-pulse" : ""
                }`}
              >
                {categoryStats.totalTransactions}{" "}
                <span className="text-xs font-bold text-muted-foreground">Transaksi</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <LuBoxes size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Varian / Produk Aktif */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Produk / Varian Terdata
              </span>
              <div
                className={`text-lg font-black tracking-tight text-foreground transition-opacity ${
                  isLoadingStats ? "opacity-40 animate-pulse" : ""
                }`}
              >
                {categoryStats.productCount}{" "}
                <span className="text-xs font-bold text-muted-foreground">Item SKU</span>
              </div>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400">
              <LuTrendingUp size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Products Table */}
      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden bg-card">
        {/* Table Search Header */}
        <div className="p-5 border-b border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-foreground">
              Rincian Penjualan Produk & Varian
            </h3>
            <p className="text-xs text-muted-foreground">
              Daftar performa penjualan item berdasarkan kategori{" "}
              <strong className="text-foreground">{activeCategoryLabel}</strong>
            </p>
          </div>
          <div className="w-full sm:w-[280px]">
            <TextField
              placeholder="Cari nama produk / varian..."
              prefixIcon={LuSearch}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 border-b border-border/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <TableHead className="py-4 px-5 text-center w-12">No</TableHead>
                <TableHead className="py-4 px-5 min-w-[220px]">Produk & Spesifikasi</TableHead>
                <TableHead className="py-4 px-5 min-w-[150px]">Kategori</TableHead>
                <TableHead className="py-4 px-5 text-center">Satuan</TableHead>
                <TableHead className="py-4 px-5 text-right min-w-[110px]">Volume Terjual</TableHead>
                <TableHead className="py-4 px-5 text-right min-w-[130px]">Harga Satuan (Avg)</TableHead>
                <TableHead className="py-4 px-5 text-right min-w-[140px]">Total Omset</TableHead>
                <TableHead className="py-4 px-5 text-center min-w-[110px]">Frekuensi Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/20 text-xs font-semibold text-foreground">
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-muted-foreground font-semibold">
                        Memuat data produk...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : categoryProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <LuInfo size={28} className="text-muted-foreground/60" />
                      <p className="text-sm font-semibold">
                        Tidak ada data produk ditemukan pada kategori ini
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Coba pilih rentang tanggal lain atau kategori lainnya.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categoryProducts.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="py-4 px-5 text-center font-mono font-bold text-muted-foreground">
                      {(page - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="py-4 px-5">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground text-xs block">
                          {item.productName}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium block">
                          Varian: {item.variantName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {item.categoryName}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-5 text-center">
                      <span className="font-mono text-xs font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/50">
                        {item.uom}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-5 text-right font-black text-foreground">
                      {item.totalQty.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="py-4 px-5 text-right font-mono font-bold text-muted-foreground">
                      {formatCurrency(item.avgPrice)}
                    </TableCell>
                    <TableCell className="py-4 px-5 text-right font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(item.totalRevenue)}
                    </TableCell>
                    <TableCell className="py-4 px-5 text-center">
                      <span className="font-bold text-xs text-foreground bg-muted/40 px-2 py-1 rounded-md">
                        {item.orderCount} Nota
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dynamic Pagination UI (Identical to Invoice Feature) */}
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalEntries={totalEntries}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </Card>
    </div>
  );
};

