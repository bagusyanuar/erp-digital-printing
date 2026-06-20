import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardContent } from "@erp-digital-printing/ui/Card";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import {
  DateRangePicker,
  type DateRange,
} from "@erp-digital-printing/ui/DateRangePicker";
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
  LuTrendingDown,
  LuSearch,
  LuFileSpreadsheet,
  LuReceipt,
  LuDollarSign,
  LuPercent,
  LuShoppingBag,
  LuCalendar,
  LuEllipsisVertical,
  LuFilter,
  LuCoins,
  FiAlertTriangle,
  LuClock,
} from "@erp-digital-printing/ui/icons";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  Legend,
  PieChart,
  Pie,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useExpenseDI } from "@presentation/expense/hooks/useExpenseDI";
import { expenseKeys } from "@infrastructure/expense/keys";
import { useDebounce } from "../../shared/hooks/useDebounce";

interface ExpenseItem {
  id: string;
  categoryName: string;
  description: string;
  amount: number;
}

interface ExpenseTransaction {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  categoryName: string;
  description: string;
  totalAmount: number;
  paidAmount: number;
  remainingDebt: number;
  paymentStatus: "PAID" | "PARTIAL_PAID" | "UNPAID" | "VOID";
  createdAt: string;
  paymentMethod: string;
  items: ExpenseItem[];
}

const MOCK_EXPENSES: ExpenseTransaction[] = [
  {
    id: "1",
    invoiceNumber: "EXP/2026/06/001",
    vendorName: "PT. Surya Kertas Indonesia",
    categoryName: "Bahan Baku",
    description: "Pembelian Kertas Art Paper 260gr (10 Rim)",
    totalAmount: 1800000,
    paidAmount: 1800000,
    remainingDebt: 0,
    paymentStatus: "PAID",
    createdAt: "12/06/2026, 09.30",
    paymentMethod: "Transfer Bank",
    items: [
      {
        id: "1-1",
        categoryName: "Bahan Baku",
        description: "Art Paper 260gr",
        amount: 1800000,
      },
    ],
  },
  {
    id: "2",
    invoiceNumber: "EXP/2026/06/002",
    vendorName: "CV. Tinta Perkasa",
    categoryName: "Tinta",
    description: "Tinta Mimaki Eco Solvent Cyan & Magenta",
    totalAmount: 3200000,
    paidAmount: 1500000,
    remainingDebt: 1700000,
    paymentStatus: "PARTIAL_PAID",
    createdAt: "13/06/2026, 14.15",
    paymentMethod: "Transfer Bank",
    items: [
      {
        id: "2-1",
        categoryName: "Tinta",
        description: "Tinta Eco Solvent Cyan",
        amount: 1600000,
      },
      {
        id: "2-2",
        categoryName: "Tinta",
        description: "Tinta Eco Solvent Magenta",
        amount: 1600000,
      },
    ],
  },
  {
    id: "3",
    invoiceNumber: "EXP/2026/06/003",
    vendorName: "PLN (Persero)",
    categoryName: "Listrik & Internet",
    description: "Tagihan Listrik Workshop Juni 2026",
    totalAmount: 4500000,
    paidAmount: 4500000,
    remainingDebt: 0,
    paymentStatus: "PAID",
    createdAt: "15/06/2026, 10.00",
    paymentMethod: "Kas Kecil (Cash)",
    items: [
      {
        id: "3-1",
        categoryName: "Listrik & Internet",
        description: "Listrik Bulanan",
        amount: 4500000,
      },
    ],
  },
  {
    id: "4",
    invoiceNumber: "EXP/2026/06/004",
    vendorName: "Supplier Spanduk Jaya",
    categoryName: "Bahan Baku",
    description: "Bahan Flexi China 280gr (3 Roll)",
    totalAmount: 2400000,
    paidAmount: 0,
    remainingDebt: 2400000,
    paymentStatus: "UNPAID",
    createdAt: "16/06/2026, 11.45",
    paymentMethod: "Giro/Term",
    items: [
      {
        id: "4-1",
        categoryName: "Bahan Baku",
        description: "Flexi China 280gr 3.2m",
        amount: 2400000,
      },
    ],
  },
  {
    id: "5",
    invoiceNumber: "EXP/2026/06/005",
    vendorName: "Bengkel Mesin Graha",
    categoryName: "Maintenance Mesin",
    description: "Service Kaki Printhead & Penggantian Damper Mimaki",
    totalAmount: 1200000,
    paidAmount: 1200000,
    remainingDebt: 0,
    paymentStatus: "PAID",
    createdAt: "17/06/2026, 16.20",
    paymentMethod: "Kas Kecil (Cash)",
    items: [
      {
        id: "5-1",
        categoryName: "Maintenance Mesin",
        description: "Jasa Service",
        amount: 500000,
      },
      {
        id: "5-2",
        categoryName: "Maintenance Mesin",
        description: "Damper Mimaki DX7",
        amount: 700000,
      },
    ],
  },
  {
    id: "6",
    invoiceNumber: "EXP/2026/06/006",
    vendorName: "Gaji Karyawan",
    categoryName: "Gaji & Uang Makan",
    description: "Uang Lembur Mingguan Operator Cetak",
    totalAmount: 1500000,
    paidAmount: 1500000,
    remainingDebt: 0,
    paymentStatus: "PAID",
    createdAt: "18/06/2026, 17.00",
    paymentMethod: "Kas Kecil (Cash)",
    items: [
      {
        id: "6-1",
        categoryName: "Gaji & Uang Makan",
        description: "Uang Lembur",
        amount: 1500000,
      },
    ],
  },
  {
    id: "7",
    invoiceNumber: "EXP/2026/06/007",
    vendorName: "Indihome Telkom",
    categoryName: "Listrik & Internet",
    description: "Internet Fiber Wifi Workshop",
    totalAmount: 450000,
    paidAmount: 450000,
    remainingDebt: 0,
    paymentStatus: "PAID",
    createdAt: "19/06/2026, 08.30",
    paymentMethod: "Kas Kecil (Cash)",
    items: [
      {
        id: "7-1",
        categoryName: "Listrik & Internet",
        description: "Internet Bulanan",
        amount: 450000,
      },
    ],
  },
];

const MOCK_TRENDS = [
  { name: "Minggu 1", belanja: 8500000, terbayar: 6200000 },
  { name: "Minggu 2", belanja: 12000000, terbayar: 9500000 },
  { name: "Minggu 3", belanja: 7500000, terbayar: 7500000 },
  { name: "Minggu 4", belanja: 15000000, terbayar: 11000000 },
];

const COLORS = [
  "var(--color-primary, #3b82f6)",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

const ReportExpensePage = () => {
  const { getExpensesUseCase, getExpenseReportWidgetsUseCase } = useExpenseDI();
  const [activeTab, setActiveTab] = useState<"data" | "analytic">("data");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 750);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseTransaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const toLocalDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of month
    to: new Date(),
  });

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all") count++;
    return count;
  }, [statusFilter]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      startDate: dateRange?.from
        ? toLocalDateString(dateRange.from)
        : undefined,
      endDate: dateRange?.to ? toLocalDateString(dateRange.to) : undefined,
      status:
        statusFilter === "all"
          ? undefined
          : ((statusFilter === "UNPAID"
              ? "UNPAID,PARTIAL"
              : "PAID") as unknown as "PAID" | "PARTIAL" | "UNPAID"),
    }),
    [page, pageSize, debouncedSearch, dateRange, statusFilter],
  );

  const { data: response, isLoading } = useQuery({
    queryKey: expenseKeys.list(queryParams),
    queryFn: () => getExpensesUseCase.execute(queryParams),
  });

  const { data: widgetsData, isLoading: isLoadingWidgets } = useQuery({
    queryKey: expenseKeys.reportWidgets(queryParams),
    queryFn: () => getExpenseReportWidgetsUseCase.execute(queryParams),
  });

  const expenses = useMemo((): ExpenseTransaction[] => {
    if (!response?.data) return [];
    return response.data.map((item): ExpenseTransaction => {
      const categoryName = item.items?.[0]?.description || "General";
      const paymentMethod =
        item.payments?.[0]?.paymentMethod === "cash" ? "Cash" : "Transfer";

      return {
        id: item.id,
        invoiceNumber: item.invoiceNumber,
        vendorName: item.vendorName,
        categoryName,
        description: item.description,
        totalAmount: item.totalAmount,
        paidAmount: item.paidAmount,
        remainingDebt: item.totalAmount - item.paidAmount,
        paymentStatus: item.paymentStatus,
        createdAt: (() => {
          if (!item.createdAt) return "-";
          try {
            const dateObj = new Date(item.createdAt);
            const day = String(dateObj.getDate()).padStart(2, "0");
            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
            const year = dateObj.getFullYear();
            const hours = String(dateObj.getHours()).padStart(2, "0");
            const minutes = String(dateObj.getMinutes()).padStart(2, "0");
            const seconds = String(dateObj.getSeconds()).padStart(2, "0");
            return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
          } catch {
            return "-";
          }
        })(),
        paymentMethod,
        items: item.items.map((it) => ({
          id: it.id,
          categoryName: "Item",
          description: it.description,
          amount: it.amount,
        })),
      };
    });
  }, [response]);

  const filteredExpenses = expenses;
  const paginatedExpenses = expenses;

  const stats = useMemo(() => {
    if (widgetsData) {
      return {
        totalExpense: widgetsData.totalExpense,
        totalPaid: widgetsData.totalExpense - widgetsData.remainingDebt,
        totalDebt: widgetsData.remainingDebt,
        transactionCount: widgetsData.transactionVolume,
        paidCount: 0,
        unpaidCount: 0,
      };
    }

    let totalExpense = 0;
    let totalPaid = 0;
    let totalDebt = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    filteredExpenses.forEach((exp) => {
      totalExpense += exp.totalAmount;
      totalPaid += exp.paidAmount;
      totalDebt += exp.remainingDebt;

      if (exp.paymentStatus === "PAID") paidCount++;
      else unpaidCount++;
    });

    return {
      totalExpense,
      totalPaid,
      totalDebt,
      transactionCount: response?.total ?? filteredExpenses.length,
      paidCount,
      unpaidCount,
    };
  }, [filteredExpenses, response, widgetsData]);

  // Aggregate Category Chart Data
  const categoriesData = useMemo(() => {
    const map = new Map<string, number>();
    filteredExpenses.forEach((exp) => {
      map.set(
        exp.categoryName,
        (map.get(exp.categoryName) || 0) + exp.totalAmount,
      );
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // Aggregate Payment Method Chart Data
  const paymentsData = useMemo(() => {
    const map = new Map<string, number>();
    filteredExpenses.forEach((exp) => {
      map.set(
        exp.paymentMethod,
        (map.get(exp.paymentMethod) || 0) + exp.paidAmount,
      );
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Lunas
          </span>
        );
      case "PARTIAL_PAID":
      case "UNPAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            Belum Lunas
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground whitespace-nowrap">
            Batal
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuTrendingDown className="text-destructive" size={32} />
            Laporan Pengeluaran
          </h1>
          <p className="text-muted-foreground font-medium">
            Pantau arus kas keluar, tagihan belanja bahan baku, operasional, dan
            hutang jatuh tempo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl flex items-center gap-2 font-bold h-10 border-border/40 hover:bg-muted"
          >
            <LuFileSpreadsheet size={16} />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-border/40 pb-px">
        <div className="flex gap-2 bg-muted/50 p-1 rounded-xl border border-border/30">
          <button
            onClick={() => setActiveTab("data")}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "data"
                ? "bg-background shadow-md text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Daftar Belanja & Tagihan
          </button>
          <button
            onClick={() => setActiveTab("analytic")}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "analytic"
                ? "bg-background shadow-md text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Analitik & Distribusi Biaya
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "data" ? (
        <div className="space-y-6">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Pengeluaran
                  </span>
                  <div className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                    {formatCurrency(stats.totalExpense)}
                  </div>
                </div>
                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
                  <LuTrendingDown size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Sisa Hutang Aktual
                  </span>
                  <div className="text-lg sm:text-xl font-black tracking-tight text-destructive font-bold">
                    {formatCurrency(stats.totalDebt)}
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                  <FiAlertTriangle size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Volume Nota Transaksi
                  </span>
                  <div className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                    {stats.transactionCount} Transaksi
                  </div>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <LuReceipt size={24} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Bar */}
          <Card className="rounded-3xl border-border/50 shadow-sm">
            <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-[320px]">
                  <TextField
                    placeholder="Cari invoice, supplier, deskripsi..."
                    prefixIcon={LuSearch}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  isClearable
                  className="w-full sm:w-[260px] h-10 rounded-xl"
                />

                {/* Popover Filter */}
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
                          {/* Status Pembayaran */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                              Status Pembayaran
                            </label>
                            <select
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="all">Semua Status</option>
                              <option value="PAID">Lunas</option>
                              <option value="UNPAID">Belum Lunas</option>
                            </select>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-3 border-t border-border/40">
                            <button
                              type="button"
                              onClick={() => {
                                setStatusFilter("all");
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
          </Card>

          {/* Transactions Table Card */}
          <Card className="rounded-3xl overflow-hidden border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 border-b border-border/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <TableHead className="py-4 px-5 w-[180px] min-w-[160px]">
                        Tanggal
                      </TableHead>
                      <TableHead className="py-4 px-5">No. Nota</TableHead>
                      <TableHead className="py-4 px-5">
                        Supplier / Vendor
                      </TableHead>
                      <TableHead className="py-4 px-5 text-right font-black">
                        Total Tagihan
                      </TableHead>
                      <TableHead className="py-4 px-5 text-right">
                        Sudah Dibayar
                      </TableHead>
                      <TableHead className="py-4 px-5 text-right text-destructive">
                        Sisa Hutang
                      </TableHead>
                      <TableHead className="py-4 px-5 text-center w-[130px] min-w-[130px]">
                        Status
                      </TableHead>
                      <TableHead className="py-4 px-5 text-center w-[60px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="py-12 text-center space-y-3"
                        >
                          <div className="relative w-8.5 h-8.5 mx-auto">
                            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                            <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground block animate-pulse">
                            Memuat Data Pengeluaran...
                          </span>
                        </TableCell>
                      </TableRow>
                    ) : filteredExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-10 text-muted-foreground font-semibold"
                        >
                          Tidak ada data transaksi pengeluaran.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedExpenses.map((expense) => (
                        <TableRow
                          key={expense.id}
                          className="hover:bg-muted/30 cursor-pointer border-b border-border/20 transition-colors"
                          onClick={() => {
                            setSelectedExpense(expense);
                            setIsDetailOpen(true);
                          }}
                        >
                          <TableCell className="py-4 px-5 font-semibold text-muted-foreground text-xs">
                            {expense.createdAt}
                          </TableCell>
                          <TableCell className="py-4 px-5 font-bold text-foreground text-xs">
                            {expense.invoiceNumber}
                          </TableCell>
                          <TableCell className="py-4 px-5 text-xs font-semibold text-muted-foreground">
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">
                                {expense.vendorName}
                              </span>
                              {expense.description && (
                                <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 font-normal">
                                  {expense.description}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-5 text-right font-bold text-xs text-foreground">
                            {formatCurrency(expense.totalAmount)}
                          </TableCell>
                          <TableCell className="py-4 px-5 text-right font-semibold text-xs text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(expense.paidAmount)}
                          </TableCell>
                          <TableCell className="py-4 px-5 text-right font-bold text-xs text-rose-500">
                            {expense.remainingDebt > 0
                              ? formatCurrency(expense.remainingDebt)
                              : "-"}
                          </TableCell>
                          <TableCell className="py-4 px-5 text-center">
                            {getStatusBadge(expense.paymentStatus)}
                          </TableCell>
                          <TableCell
                            className="py-4 px-5 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button className="p-1 hover:bg-muted rounded-lg text-muted-foreground">
                              <LuEllipsisVertical size={16} />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <TablePagination
                currentPage={page}
                totalPages={Math.ceil((response?.total ?? 0) / pageSize) || 1}
                pageSize={pageSize}
                totalEntries={response?.total ?? 0}
                onPageChange={(p) => setPage(p)}
                onPageSizeChange={(sz) => {
                  setPageSize(sz);
                  setPage(1);
                }}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Tab Analytic */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trend Chart */}
            <Card className="rounded-3xl border-border/50 shadow-sm lg:col-span-2">
              <CardHeader className="p-6 pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-foreground">
                      Tren Pembelian vs Arus Kas Keluar
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium">
                      Bandingkan nilai belanja total dengan nominal riil yang
                      dibayarkan.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={MOCK_TRENDS}
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorBelanja"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--color-primary, #3b82f6)"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-primary, #3b82f6)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorTerbayar"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `Rp ${val / 1000000}M`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15,23,42,0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                        }}
                        labelStyle={{
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                        formatter={(value: unknown) => [
                          formatCurrency(Number(value || 0)),
                          "",
                        ]}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="belanja"
                        name="Nilai Belanja"
                        stroke="var(--color-primary, #3b82f6)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorBelanja)"
                      />
                      <Area
                        type="monotone"
                        dataKey="terbayar"
                        name="Terbayar Rill"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorTerbayar)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart Distribusi Pembayaran */}
            <Card className="rounded-3xl border-border/50 shadow-sm">
              <CardHeader className="p-6 pb-0">
                <h2 className="text-base font-black text-foreground">
                  Metode Pembayaran Terpopuler
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Berdasarkan nominal cash outflow yang dibayarkan.
                </p>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center">
                <div className="h-[200px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {paymentsData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15,23,42,0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                        }}
                        formatter={(value: unknown) => [
                          formatCurrency(Number(value || 0)),
                          "",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-2 mt-4">
                  {paymentsData.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-xs font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-muted-foreground">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-foreground">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart per Category */}
          <Card className="rounded-3xl border-border/50 shadow-sm">
            <CardHeader className="p-6 pb-0">
              <h2 className="text-base font-black text-foreground">
                Distribusi Biaya per Kategori
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Visualisasi alokasi pengeluaran dana berdasarkan pos anggaran.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoriesData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `Rp ${val / 1000000}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15,23,42,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                      }}
                      formatter={(value: unknown) => [
                        formatCurrency(Number(value || 0)),
                        "",
                      ]}
                    />
                    <Bar
                      dataKey="value"
                      name="Total Pengeluaran"
                      radius={[8, 8, 0, 0]}
                    >
                      {categoriesData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Slide-over / Dialog */}
      <AnimatePresence>
        {isDetailOpen && selectedExpense && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-card border-l border-border shadow-2xl p-6 overflow-y-auto z-50 flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border/40">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                      Detail Rincian Pengeluaran
                    </span>
                    <h3 className="text-lg font-black text-foreground">
                      {selectedExpense.invoiceNumber}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setIsDetailOpen(false)}
                    className="rounded-lg h-8 w-8 p-0"
                  >
                    ✕
                  </Button>
                </div>

                {/* Vendor & Status */}
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-2xl border border-border/30">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground block">
                      VENDOR / SUPPLIER
                    </span>
                    <span className="text-xs font-black text-foreground">
                      {selectedExpense.vendorName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground block">
                      STATUS BAYAR
                    </span>
                    <div className="mt-1">
                      {getStatusBadge(selectedExpense.paymentStatus)}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-[10px] font-bold text-muted-foreground block">
                      TANGGAL NOTA
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {selectedExpense.createdAt}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[10px] font-bold text-muted-foreground block">
                      METODE UTAMA
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {selectedExpense.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                    Item Yang Dibeli
                  </h4>
                  <div className="space-y-2">
                    {selectedExpense.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-muted/10 border border-border/20 rounded-xl flex justify-between items-center"
                      >
                        <div>
                          <span className="text-[10px] font-black px-1.5 py-0.5 bg-muted rounded text-muted-foreground uppercase">
                            {item.categoryName}
                          </span>
                          <p className="text-xs font-semibold text-foreground mt-1">
                            {item.description}
                          </p>
                        </div>
                        <span className="text-xs font-black text-foreground">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="pt-4 border-t border-border/40 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                    <span>Total Belanja</span>
                    <span>{formatCurrency(selectedExpense.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Telah Dibayar</span>
                    <span>{formatCurrency(selectedExpense.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black text-foreground pt-2 border-t border-border/20">
                    <span className="text-rose-500">Sisa Hutang</span>
                    <span className="text-rose-500">
                      {formatCurrency(selectedExpense.remainingDebt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-border/40 mt-6 flex gap-3">
                <Button className="flex-1 rounded-xl font-bold h-10 flex items-center justify-center gap-2">
                  <LuCoins size={16} />
                  Bayar Cicilan / Lunas
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl font-bold h-10 px-4"
                >
                  Edit
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportExpensePage;
