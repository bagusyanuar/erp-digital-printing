import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCashFlowDI } from "../hooks/useCashFlowDI";
import { useUserDI } from "../../user/hooks/useUserDI";
import { cashFlowKeys } from "@infrastructure/cash-flow/keys/cash-flow.key";
import { userKeys } from "@infrastructure/user/keys/user.key";
import type { AppError } from "@core/shared/errors/domain.error";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Card, CardHeader, CardContent } from "@erp-digital-printing/ui/Card";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { toast } from "@erp-digital-printing/ui/Toast";
import { DateRangePicker, type DateRange } from "@erp-digital-printing/ui/DateRangePicker";
import { useDebounce } from "../../shared/hooks/useDebounce";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TablePagination,
} from "@erp-digital-printing/ui/Table";
import {
  LuDollarSign,
  LuTrendingUp,
  LuTrendingDown,
  LuCalendar,
  LuSearch,
  LuPlus,
  LuFileSpreadsheet,
  LuFileText,
  LuWallet,
  LuRefreshCw,
  LuInfo,
  LuArrowUpRight,
  LuArrowDownRight,
  LuFilter,
} from "@erp-digital-printing/ui/icons";

// Backend category mappings
const CATEGORY_LABELS: Record<string, string> = {
  ORDER_PAYMENT: "Pembayaran Pesanan",
  CAPITAL_INJECTION: "Setoran Modal",
  EXPENSE: "Pengeluaran / Biaya",
  REFUND: "Pengembalian Dana (Refund)",
  ADJUSTMENT: "Penyesuaian Kas",
  CAPITAL_WITHDRAWAL: "Penarikan Owner (Prive)",
  CAPITAL: "Modal",
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const CashFlowPage = () => {
  const queryClient = useQueryClient();
  const {
    getCashFlowReportUseCase,
    getCashFlowSummaryUseCase,
    createCashFlowAdjustmentUseCase,
    getCashAccountsUseCase,
  } = useCashFlowDI();
  const { getUsersUseCase } = useUserDI();

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const [typeFilter, setTypeFilter] = useState<"semua" | "DEBIT" | "CREDIT">("semua");
  const [categoryFilter, setCategoryFilter] = useState<string>("semua");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("semua");
  const [cashierFilter, setCashierFilter] = useState<string>("semua");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return {
      from: today,
      to: today,
    };
  });

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== "semua") count++;
    if (categoryFilter !== "semua") count++;
    if (paymentMethodFilter !== "semua") count++;
    if (cashierFilter !== "semua") count++;
    return count;
  }, [typeFilter, categoryFilter, paymentMethodFilter, cashierFilter]);

  // Pagination States
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add Transaction Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formType, setFormType] = useState<"DEBIT" | "CREDIT">("DEBIT");
  const [formCategory, setFormCategory] = useState("ADJUSTMENT");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formMethod, setFormMethod] = useState("");
  const [formReference, setFormReference] = useState("");

  // Categories list based on type (Backend specific)
  const incomeCategories = ["ADJUSTMENT", "ORDER_PAYMENT", "CAPITAL"];
  const expenseCategories = ["ADJUSTMENT", "EXPENSE", "REFUND"];

  // Memoized format parameters
  const dateRangeParams = useMemo(() => {
    const from = selectedDateRange?.from ? formatDate(selectedDateRange.from) : formatDate(new Date());
    const to = selectedDateRange?.to ? formatDate(selectedDateRange.to) : from;
    return { from, to };
  }, [selectedDateRange]);

  const activeFilters = useMemo(() => {
    return {
      startDate: dateRangeParams.from,
      endDate: dateRangeParams.to,
      type: typeFilter !== "semua" ? typeFilter : undefined,
      referenceType: categoryFilter !== "semua" ? categoryFilter : undefined,
      paymentMethod: paymentMethodFilter !== "semua" ? paymentMethodFilter : undefined,
      cashierId: cashierFilter !== "semua" ? cashierFilter : undefined,
      search: debouncedSearch || undefined,
    };
  }, [dateRangeParams, typeFilter, categoryFilter, paymentMethodFilter, cashierFilter, debouncedSearch]);

  // Queries
  const { data: reportData, isLoading: isReportLoading } = useQuery({
    queryKey: cashFlowKeys.reports({ ...activeFilters, page, limit: pageSize }),
    queryFn: () =>
      getCashFlowReportUseCase.execute({
        ...activeFilters,
        page,
        limit: pageSize,
      }),
    refetchOnWindowFocus: false,
  });

  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: cashFlowKeys.summaries(activeFilters),
    queryFn: () => getCashFlowSummaryUseCase.execute(activeFilters),
    refetchOnWindowFocus: false,
  });

  const { data: accountsData, isLoading: isAccountsLoading } = useQuery({
    queryKey: cashFlowKeys.accounts(),
    queryFn: () => getCashAccountsUseCase.execute(),
    refetchOnWindowFocus: false,
  });

  const { data: usersData } = useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => getUsersUseCase.execute(),
    refetchOnWindowFocus: false,
  });

  const activeMethod = formMethod || accountsData?.[0]?.name || "";

  // Mutation
  const createAdjustmentMutation = useMutation({
    mutationFn: (payload: { amount: number; type: "DEBIT" | "CREDIT"; paymentMethod: string; description: string }) =>
      createCashFlowAdjustmentUseCase.execute(payload),
    onSuccess: (data) => {
      toast.success(
        "Transaksi Berhasil Dicatat",
        `Penyesuaian kas senilai Rp ${data.amount.toLocaleString("id-ID")} berhasil disimpan.`
      );
      setIsAddModalOpen(false);
      // Reset form
      setFormDescription("");
      setFormAmount("");
      setFormReference("");
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: cashFlowKeys.all });
    },
    onError: (err: AppError) => {
      toast.error("Gagal Menyimpan Transaksi", err.message || "Terjadi kesalahan internal.");
    },
  });

  // Calculate actual actual cash balance from all accounts
  const totalActualBalance = useMemo(() => {
    return accountsData?.reduce((sum, acc) => sum + acc.balance, 0) ?? 0;
  }, [accountsData]);

  const debitDetails = useMemo(() => {
    const details = summaryData?.detailsByMethod ?? {};
    return ["cash", "qris", "transfer"].map((method) => {
      const val = details[method] || { debit: 0, credit: 0, balance: 0 };
      return [method, val] as const;
    });
  }, [summaryData?.detailsByMethod]);

  const creditDetails = useMemo(() => {
    const details = summaryData?.detailsByMethod ?? {};
    return ["cash", "qris", "transfer"].map((method) => {
      const val = details[method] || { debit: 0, credit: 0, balance: 0 };
      return [method, val] as const;
    });
  }, [summaryData?.detailsByMethod]);

  const periodDetails = useMemo(() => {
    const details = summaryData?.detailsByMethod ?? {};
    return ["cash", "qris", "transfer"].map((method) => {
      const val = details[method] || { debit: 0, credit: 0, balance: 0 };
      return [method, val] as const;
    });
  }, [summaryData?.detailsByMethod]);

  // Handle manual transaction submit
  const handleAddTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMethod || !formDescription || !formAmount) {
      toast.error("Form Belum Lengkap", "Silakan isi metode, deskripsi, dan nominal.");
      return;
    }

    const amountNum = parseFloat(formAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Nominal Tidak Valid", "Nominal transaksi harus lebih besar dari 0.");
      return;
    }

    // Combine category label prefix and notes for better readability
    const categoryLabel = CATEGORY_LABELS[formCategory] || formCategory;
    const refSuffix = formReference ? ` [Ref: ${formReference}]` : "";
    const fullDescription = `[${categoryLabel}] ${formDescription}${refSuffix}`;

    createAdjustmentMutation.mutate({
      amount: amountNum,
      type: formType,
      paymentMethod: activeMethod,
      description: fullDescription,
    });
  };

  // Simulate Export Trigger
  const handleExport = (format: "pdf" | "excel") => {
    toast.success(
      "Mengekspor Laporan...",
      `Sedang menyiapkan laporan Cash Flow dalam format ${format.toUpperCase()}.`
    );
  };

  const isLoading = isReportLoading || isSummaryLoading || isAccountsLoading;

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border/10 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuWallet className="text-primary" size={32} />
            Laporan Arus Kas (Cash Flow)
          </h1>
          <p className="text-muted-foreground font-medium">
            Pemantauan langsung kas masuk, kas keluar, dan profitabilitas operasional toko digital printing.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-row items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("pdf")}
            className="h-9 px-3 rounded-xl font-bold border-border hover:bg-muted/70 flex items-center gap-1.5 text-xs"
          >
            <LuFileText size={14} className="text-rose-500" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("excel")}
            className="h-9 px-3 rounded-xl font-bold border-border hover:bg-muted/70 flex items-center gap-1.5 text-xs"
          >
            <LuFileSpreadsheet size={14} className="text-emerald-600" />
            Export Excel
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 px-4 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 text-xs"
          >
            <LuPlus size={16} />
            Penyesuaian Kas
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Net Cash */}
        <Card className="rounded-3xl border border-border/50 bg-gradient-to-br from-card to-muted/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total Saldo Kas Aktual
              </span>
              <div className="p-2 bg-primary/10 rounded-xl">
                <LuDollarSign size={20} className="text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black tracking-tight text-foreground">
                Rp {totalActualBalance.toLocaleString("id-ID")}
              </h3>
              <p className="text-[10px] text-muted-foreground font-semibold">
                Akumulasi seluruh mutasi kas berjalan
              </p>
            </div>
            {accountsData && accountsData.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-t border-border/30 pt-3 mt-3">
                {accountsData.map((acc) => (
                  <div key={acc.id} className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground">
                    <span className="uppercase">{acc.name}</span>:
                    <span className="text-foreground">Rp {acc.balance.toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card Period Balance */}
        <Card className="rounded-3xl border border-border/50 bg-gradient-to-br from-card to-blue-50/5 dark:to-blue-950/5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Saldo Kas Periode
              </span>
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <LuRefreshCw size={20} className="text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className={`text-2xl font-black tracking-tight ${(summaryData?.summary.netBalance ?? 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                Rp {(summaryData?.summary.netBalance ?? 0).toLocaleString("id-ID")}
              </h3>
              <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                <span className={`font-bold ${(summaryData?.summary.netBalance ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {(summaryData?.summary.netBalance ?? 0) >= 0 ? "Surplus" : "Defisit"}
                </span>
                selisih arus kas periode ini
              </p>
            </div>
            {periodDetails.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-t border-border/30 pt-3 mt-3">
                {periodDetails.map(([method, val]) => (
                  <div key={method} className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground">
                    <span className="uppercase">{method}</span>:
                    <span className={`font-extrabold ${val.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      Rp {val.balance.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card Inflow */}
        <Card className="rounded-3xl border border-border/50 bg-gradient-to-br from-card to-emerald-50/5 dark:to-emerald-950/5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Kas Masuk (Inflow)
              </span>
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <LuTrendingUp size={20} className="text-emerald-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black tracking-tight text-foreground">
                Rp {(summaryData?.summary.totalDebit ?? 0).toLocaleString("id-ID")}
              </h3>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <LuArrowUpRight size={14} />
                Dari retail & invoice biro
              </p>
            </div>
            {debitDetails.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-t border-border/30 pt-3 mt-3">
                {debitDetails.map(([method, val]) => (
                  <div key={method} className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground">
                    <span className="uppercase">{method}</span>:
                    <span className="text-foreground">Rp {val.debit.toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card Outflow */}
        <Card className="rounded-3xl border border-border/50 bg-gradient-to-br from-card to-rose-50/5 dark:to-rose-950/5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Kas Keluar (Outflow)
              </span>
              <div className="p-2 bg-rose-500/10 rounded-xl">
                <LuTrendingDown size={20} className="text-rose-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black tracking-tight text-foreground">
                Rp {(summaryData?.summary.totalCredit ?? 0).toLocaleString("id-ID")}
              </h3>
              <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                <LuArrowDownRight size={14} />
                Bahan baku, gaji, & operasional
              </p>
            </div>
            {creditDetails.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-t border-border/30 pt-3 mt-3">
                {creditDetails.map(([method, val]) => (
                  <div key={method} className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground">
                    <span className="uppercase">{method}</span>:
                    <span className="text-foreground">Rp {val.credit.toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Data & Filters */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Table & Filtering */}
        <div className="space-y-6">
          <Card className="rounded-3xl border border-border/50 shadow-sm overflow-visible bg-card">
            
            {/* Filter Controls Header */}
            <CardHeader className="p-6 border-b border-border/30 bg-card space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Search */}
                <div className="w-full md:max-w-xs">
                  <TextField
                    placeholder="Cari deskripsi, no. referensi..."
                    prefixIcon={LuSearch}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full"
                  />
                </div>

                {/* Filter Controls & Dates */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <div className="w-full md:w-64">
                    <DateRangePicker
                      value={selectedDateRange}
                      onChange={(range) => {
                        setSelectedDateRange(range);
                        setPage(1);
                      }}
                      isClearable
                      placeholder="Filter tanggal..."
                    />
                  </div>

                  {/* Popover Filter Dropdown */}
                  <div className="relative">
                    <Button
                      variant={activeFiltersCount > 0 ? "default" : "outline"}
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-2"
                    >
                      <LuFilter size={14} />
                      Filter
                      {activeFiltersCount > 0 && (
                        <span className="ml-1 bg-primary-foreground text-primary text-[10px] px-1.5 py-0.5 rounded-full font-black leading-none">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>

                    <AnimatePresence>
                      {isFilterOpen && (
                        <>
                          {/* Overlay to close popover when clicked outside */}
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsFilterOpen(false)} 
                          />
                          
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 mt-2 w-72 bg-card border border-border/80 shadow-2xl rounded-2xl p-4 space-y-4 z-50 animate-in fade-in duration-200"
                          >
                            {/* Tipe Arus Kas */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                                Arus Kas
                              </label>
                              <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-xl">
                                {(
                                  [
                                    { id: "semua", label: "Semua" },
                                    { id: "DEBIT", label: "Masuk" },
                                    { id: "CREDIT", label: "Keluar" },
                                  ] as const
                                ).map((t) => (
                                  <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => {
                                      setTypeFilter(t.id);
                                      setPage(1);
                                    }}
                                    className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${
                                      typeFilter === t.id
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    {t.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Kategori */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                                Kategori
                              </label>
                              <select
                                value={categoryFilter}
                                onChange={(e) => {
                                  setCategoryFilter(e.target.value);
                                  setPage(1);
                                }}
                                className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="semua">Semua Kategori</option>
                                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                  <option key={key} value={key}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Akun Kas */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                                Akun Kas
                              </label>
                              <select
                                value={paymentMethodFilter}
                                onChange={(e) => {
                                  setPaymentMethodFilter(e.target.value);
                                  setPage(1);
                                }}
                                className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary uppercase"
                              >
                                <option value="semua">Semua Akun Kas</option>
                                {accountsData?.map((acc) => (
                                  <option key={acc.id} value={acc.name}>
                                    {acc.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Kasir / Karyawan */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                                Kasir
                              </label>
                              <select
                                value={cashierFilter}
                                onChange={(e) => {
                                  setCashierFilter(e.target.value);
                                  setPage(1);
                                }}
                                className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="semua">Semua Kasir</option>
                                {usersData?.map((user) => (
                                  <option key={user.id} value={user.id}>
                                    {user.username}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-3 border-t border-border/40">
                              <button
                                type="button"
                                onClick={() => {
                                  setTypeFilter("semua");
                                  setCategoryFilter("semua");
                                  setPaymentMethodFilter("semua");
                                  setCashierFilter("semua");
                                  setPage(1);
                                }}
                                className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Reset Filter
                              </button>
                              <Button
                                size="sm"
                                onClick={() => setIsFilterOpen(false)}
                                className="h-8 px-4 rounded-xl text-[10px] font-bold"
                              >
                                Terapkan
                              </Button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Table Content */}
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu / Tanggal</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Deskripsi & Ref</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead>Kasir</TableHead>
                    <TableHead className="text-right">Jumlah (Rp)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={6} className="h-12 animate-pulse bg-muted/20" />
                      </TableRow>
                    ))
                  ) : reportData && reportData.data.length > 0 ? (
                    reportData.data.map((tx) => {
                      const isMasuk = tx.type === "DEBIT";
                      return (
                        <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <LuCalendar size={13} className="text-primary/70" />
                              {new Date(tx.transactionDate).toLocaleString("id-ID", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className="text-sm font-bold text-foreground">
                              {CATEGORY_LABELS[tx.referenceType] || tx.referenceType}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5 max-w-xs">
                              <span className="text-xs text-foreground font-semibold line-clamp-1">
                                {tx.description || "-"}
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {tx.invoiceNumber && (
                                  <span className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded w-max border border-blue-500/20 font-bold">
                                    Invoice: {tx.invoiceNumber}
                                  </span>
                                )}
                                {tx.referenceId && (
                                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded w-max border border-border/30">
                                    Ref ID: {tx.referenceId.substring(0, 8)}...
                                  </span>
                                )}
                                {tx.customerName && (
                                  <span className="text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded w-max border border-primary/10 font-bold">
                                    Pelanggan: {tx.customerName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className="text-xs font-semibold px-2 py-0.5 bg-muted rounded-md text-foreground/80 border border-border/50 uppercase">
                              {tx.paymentMethod}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                            {tx.cashierName}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <span
                              className={`text-sm font-extrabold flex items-center justify-end gap-1.5 ${
                                isMasuk ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {isMasuk ? (
                                <LuArrowUpRight size={14} className="stroke-[3]" />
                              ) : (
                                <LuArrowDownRight size={14} className="stroke-[3]" />
                              )}
                              Rp {tx.amount.toLocaleString("id-ID")}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center text-muted-foreground font-semibold">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <LuInfo size={24} className="text-muted-foreground/60" />
                          <span>Tidak ada transaksi arus kas ditemukan.</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>

            {/* Table Pagination */}
            <TablePagination
              currentPage={page}
              totalPages={reportData?.limit ? Math.ceil(reportData.total / reportData.limit) || 1 : 1}
              pageSize={pageSize}
              totalEntries={reportData?.total ?? 0}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setPage(1);
              }}
            />
          </Card>
        </div>
      </div>

      {/* Catat Kas Manual Modal */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        size="md"
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        <form onSubmit={handleAddTransactionSubmit} className="space-y-5 flex flex-col overflow-hidden">
          
          {/* Modal Header */}
          <div className="flex flex-col gap-1 border-b border-border/30 pb-4 pr-10">
            <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
              <LuPlus className="text-primary" size={22} />
              Penyesuaian Kas Manual
            </h2>
            <p className="text-xs text-muted-foreground font-semibold">
              Gunakan form ini untuk mencatat mutasi penyesuaian kas (debit/kredit) secara manual.
            </p>
          </div>

          {/* Form Content */}
          <div className="space-y-4 overflow-y-auto pr-1">
            
            {/* Cash Flow Type Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Tipe Mutasi
              </label>
              <div className="grid grid-cols-2 gap-3 bg-muted p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setFormType("DEBIT");
                    setFormCategory(incomeCategories[0] ?? "");
                  }}
                  className={`py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    formType === "DEBIT"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LuArrowUpRight size={14} />
                  Kas Masuk (Inflow)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormType("CREDIT");
                    setFormCategory(expenseCategories[0] ?? "");
                  }}
                  className={`py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    formType === "CREDIT"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LuArrowDownRight size={14} />
                  Kas Keluar (Outflow)
                </button>
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Kategori
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="">Pilih Kategori...</option>
                {formType === "DEBIT"
                  ? incomeCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat] || cat}
                      </option>
                    ))
                  : expenseCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat] || cat}
                      </option>
                    ))}
              </select>
            </div>

            {/* Description / Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Catatan / Keterangan
              </label>
              <TextField
                placeholder="Misal: Pembayaran listrik bulanan, beli lem..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Nominal / Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Nominal Transaksi (Rp)
              </label>
              <TextField
                type="number"
                placeholder="Masukkan nominal Rp..."
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="w-full font-bold"
                required
              />
            </div>

            {/* Payment Method / Cash Account */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Metode Pembayaran (Akun Kas)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {accountsData?.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setFormMethod(acc.name)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center truncate ${
                      activeMethod === acc.name
                        ? "border-primary bg-primary/5 text-primary font-black"
                        : "border-border/60 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {acc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                No. Referensi / Nota (Opsional)
              </label>
              <TextField
                placeholder="INV-2026-X, PO-X, dll..."
                value={formReference}
                onChange={(e) => setFormReference(e.target.value)}
                className="w-full"
              />
            </div>

          </div>

          {/* Dialog Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="h-10 px-5 rounded-xl font-bold border-border hover:bg-muted/50 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createAdjustmentMutation.isPending}
              className="h-10 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 text-xs transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {createAdjustmentMutation.isPending ? "Menyimpan..." : "Simpan Mutasi"}
            </Button>
          </div>

        </form>
      </Dialog>

    </div>
  );
};

export default CashFlowPage;
