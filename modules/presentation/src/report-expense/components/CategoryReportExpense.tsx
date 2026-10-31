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
  LuReceipt,
  LuBoxes,
  LuCoins,
  LuInfo,
} from "@erp-digital-printing/ui/icons";
import type { CategoryExpenseBreakdownModel } from "@core/expense";

export interface CategoryChipItem {
  id: string;
  name: string;
}

const DEFAULT_CATEGORIES: CategoryChipItem[] = [
  { id: "all", name: "Semua Kategori" },
];

interface CategoryReportExpenseProps {
  formatCurrency: (value: number) => string;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  availableCategories?: CategoryChipItem[];
  dateRange?: DateRange;
  setDateRange?: (range: DateRange | undefined) => void;
  stats?: {
    totalExpense: number;
    transactionCount: number;
    posBiayaCount?: number;
  };
  isLoadingStats?: boolean;
  isLoading?: boolean;
  categoryExpenses?: CategoryExpenseBreakdownModel[];
  page: number;
  pageSize: number;
  totalEntries: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export const CategoryReportExpense: React.FC<CategoryReportExpenseProps> = ({
  formatCurrency,
  selectedCategory,
  onSelectCategory,
  availableCategories = DEFAULT_CATEGORIES,
  dateRange,
  setDateRange,
  stats,
  isLoadingStats = false,
  isLoading = false,
  categoryExpenses = [],
  page,
  pageSize,
  totalEntries,
  onPageChange,
  onPageSizeChange,
  search,
  onSearchChange,
}) => {
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;

  // Aggregate KPIs based on visible / passed breakdown items or stats
  const categoryStats = useMemo(() => {
    if (stats) {
      const avg =
        stats.transactionCount > 0
          ? Math.round(stats.totalExpense / stats.transactionCount)
          : 0;
      return {
        totalExpense: stats.totalExpense,
        totalTransactions: stats.transactionCount,
        posBiayaCount: stats.posBiayaCount ?? totalEntries,
        avgPerTransaction: avg,
      };
    }

    let totalExpense = 0;
    let totalTransactions = 0;

    categoryExpenses.forEach((item) => {
      totalExpense += item.totalExpense;
      totalTransactions += item.expenseCount;
    });

    const avg =
      totalTransactions > 0
        ? Math.round(totalExpense / totalTransactions)
        : 0;

    return {
      totalExpense,
      totalTransactions,
      posBiayaCount: totalEntries,
      avgPerTransaction: avg,
    };
  }, [stats, categoryExpenses, totalEntries]);

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
            <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
              <LuTags size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Filter Kategori Produk
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Pilih kategori dan rentang tanggal untuk melihat rincian biaya pos pengeluaran per kategori produk
              </p>
            </div>
          </div>

          {setDateRange && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                isClearable
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

      {/* Category KPI Cards Row (Clean 4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Beban Pengeluaran */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Total Biaya ({activeCategoryLabel})
              </span>
              <div
                className={`text-lg font-black tracking-tight text-foreground transition-opacity ${
                  isLoadingStats ? "opacity-40 animate-pulse" : ""
                }`}
              >
                {formatCurrency(categoryStats.totalExpense)}
              </div>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
              <LuDollarSign size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Frekuensi Pengadaan / Transaksi */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Frekuensi Pengadaan
              </span>
              <div
                className={`text-lg font-black tracking-tight text-foreground transition-opacity ${
                  isLoadingStats ? "opacity-40 animate-pulse" : ""
                }`}
              >
                {categoryStats.totalTransactions}{" "}
                <span className="text-xs font-bold text-muted-foreground">Nota Transaksi</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
              <LuReceipt size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Pos Kategori Pengeluaran */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Pos Pengeluaran Terdata
              </span>
              <div
                className={`text-lg font-black tracking-tight text-foreground transition-opacity ${
                  isLoadingStats ? "opacity-40 animate-pulse" : ""
                }`}
              >
                {categoryStats.posBiayaCount}{" "}
                <span className="text-xs font-bold text-muted-foreground">Pos Biaya</span>
              </div>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
              <LuBoxes size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Rata-rata per Nota */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Rata-rata per Nota
              </span>
              <div
                className={`text-lg font-black tracking-tight text-foreground transition-opacity ${
                  isLoadingStats ? "opacity-40 animate-pulse" : ""
                }`}
              >
                {formatCurrency(categoryStats.avgPerTransaction)}
              </div>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <LuCoins size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Expense Categories Table */}
      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden bg-card">
        {/* Table Search Header */}
        <div className="p-5 border-b border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-foreground">
              Rincian Pos Biaya Pengeluaran per Kategori Produk
            </h3>
            <p className="text-xs text-muted-foreground">
              Daftar akumulasi biaya per pos pengeluaran berdasarkan kategori{" "}
              <strong className="text-foreground">{activeCategoryLabel}</strong>
            </p>
          </div>
          <div className="w-full sm:w-[280px]">
            <TextField
              placeholder="Cari pos biaya, deskripsi..."
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
                <TableHead className="py-4 px-5 min-w-[240px]">Pos Kategori Pengeluaran & Deskripsi</TableHead>
                <TableHead className="py-4 px-5 min-w-[150px]">Kategori Produk</TableHead>
                <TableHead className="py-4 px-5 text-center min-w-[120px]">Frekuensi Nota</TableHead>
                <TableHead className="py-4 px-5 text-right min-w-[150px]">Total Pengeluaran</TableHead>
                <TableHead className="py-4 px-5 text-right min-w-[140px]">Kontribusi Biaya</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/20 text-xs font-semibold text-foreground">
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-muted-foreground font-semibold">
                        Memuat data pos pengeluaran...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : categoryExpenses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <LuInfo size={28} className="text-muted-foreground/60" />
                      <p className="text-sm font-semibold">
                        Tidak ada data pos pengeluaran ditemukan pada kategori ini
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Coba pilih rentang tanggal lain atau kategori lainnya.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categoryExpenses.map((item, index) => {
                  const contributionPct =
                    categoryStats.totalExpense > 0
                      ? (item.totalExpense / categoryStats.totalExpense) * 100
                      : 0;

                  return (
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
                            {item.expenseCategoryName}
                          </span>
                          {item.description && (
                            <span className="text-[11px] text-muted-foreground font-normal line-clamp-1">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {item.categoryName}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-5 text-center">
                        <span className="font-bold text-xs text-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border/40">
                          {item.expenseCount} Nota
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-5 text-right font-black text-destructive text-xs">
                        {formatCurrency(item.totalExpense)}
                      </TableCell>
                      <TableCell className="py-4 px-5 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {contributionPct.toFixed(1)}%
                          </span>
                          <div className="w-20 bg-muted/80 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-destructive h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(contributionPct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dynamic Pagination UI */}
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
