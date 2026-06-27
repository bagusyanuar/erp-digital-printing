import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@erp-digital-printing/ui/Card";
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
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@erp-digital-printing/ui/Dropdown";
import { Checkbox } from "@erp-digital-printing/ui/Checkbox";
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@erp-digital-printing/ui/Combobox";
import {
  LuTrendingUp,
  LuSearch,
  LuFileSpreadsheet,
  LuReceipt,
  LuDollarSign,
  LuPercent,
  LuShoppingBag,
  LuUser,
  LuEllipsisVertical,
  LuPrinter,
  LuFilter,
  LuCircleCheck,
  LuCircleX,
  LuRotateCcw,
} from "@erp-digital-printing/ui/icons";
import DetailReportSelling from "../components/DetailReportSelling";
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
import { useOrderDI } from "@presentation/order/hooks/useOrderDI";
import { orderKeys } from "@infrastructure/order/keys";
import { useUserDI } from "../../user/hooks/useUserDI";
import { userKeys } from "@infrastructure/user/keys/user.key";
import { useDebounce } from "../../shared/hooks/useDebounce";
import type { AppError } from "@core/shared/errors/domain.error";
import type { OrderModel } from "@core/order/domains/models/order.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";

interface SalesTransaction {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerType: "retail" | "reseller" | "corporate";
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  status: "PAID" | "DOWN_PAYMENT" | "UNPAID";
  orderStatus: string;
  productCategory: string;
  createdAt: string;
  operatorName: string;
  quantity: number;
}

// Mock data for trends
const MOCK_REVENUE_TRENDS_WEEKLY = [
  { name: "Minggu 1", omset: 5000000, cashflow: 4000000 },
  { name: "Minggu 2", omset: 12000000, cashflow: 9500000 },
  { name: "Minggu 3", omset: 8000000, cashflow: 7500000 },
  { name: "Minggu 4", omset: 15000000, cashflow: 13000000 },
];

const MOCK_REVENUE_TRENDS_MONTHLY = [
  { name: "Jan", omset: 45000000, cashflow: 40000000 },
  { name: "Feb", omset: 52000000, cashflow: 48000000 },
  { name: "Mar", omset: 49000000, cashflow: 46000000 },
  { name: "Apr", omset: 63000000, cashflow: 58000000 },
  { name: "Mei", omset: 58000000, cashflow: 55000000 },
  { name: "Jun", omset: 72000000, cashflow: 68000000 },
];

const MOCK_REVENUE_TRENDS_YEARLY = [
  { name: "2024", omset: 520000000, cashflow: 490000000 },
  { name: "2025", omset: 680000000, cashflow: 640000000 },
  { name: "2026", omset: 850000000, cashflow: 810000000 },
];

const COLORS = [
  "var(--color-primary, #3b82f6)",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const formatDateTime = (createdAt?: string, fallbackDate?: string) => {
  const targetStr = createdAt || fallbackDate;
  if (!targetStr) return "-";
  try {
    const dateObj = new Date(targetStr);
    if (isNaN(dateObj.getTime())) return targetStr;

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    if (createdAt) {
      const hours = String(dateObj.getHours()).padStart(2, "0");
      const minutes = String(dateObj.getMinutes()).padStart(2, "0");
      const seconds = String(dateObj.getSeconds()).padStart(2, "0");
      return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
    }
    return `${day}/${month}/${year}`;
  } catch {
    return targetStr;
  }
};

const ReportSellingPage = () => {
  const { getOrdersUseCase, getOrderReportWidgetsUseCase } = useOrderDI();
  const { getUsersUseCase } = useUserDI();
  const [activeTab, setActiveTab] = useState<"data" | "analytic">("data");
  const [trendPeriod, setTrendPeriod] = useState<
    "weekly" | "monthly" | "yearly"
  >("monthly");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 750);
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>("all");
  const [operatorFilter, setOperatorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "PAID" | "UNPAID">(
    "all",
  );
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    "all" | "SUCCESS" | "REFUND"
  >("all");
  const [tempCustomerTypeFilter, setTempCustomerTypeFilter] =
    useState<string>("all");
  const [tempOperatorFilter, setTempOperatorFilter] = useState<string>("all");
  const [tempStatusFilter, setTempStatusFilter] = useState<
    "all" | "PAID" | "UNPAID"
  >("all");
  const [tempOrderStatusFilter, setTempOrderStatusFilter] = useState<
    "all" | "SUCCESS" | "REFUND"
  >("all");
  const [paymentMethodsFilter, setPaymentMethodsFilter] = useState<string[]>([]);
  const [tempPaymentMethodsFilter, setTempPaymentMethodsFilter] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const mappedPaymentMethods = useMemo(() => {
    if (paymentMethodsFilter.length === 0) return undefined;
    return paymentMethodsFilter.join(",").toLowerCase();
  }, [paymentMethodsFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return {
      from: today,
      to: today,
    };
  });

  const [selectedSale, setSelectedSale] = useState<OrderModel | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (customerTypeFilter !== "all") count++;
    if (operatorFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    if (orderStatusFilter !== "all") count++;
    if (paymentMethodsFilter.length > 0) count++;
    return count;
  }, [customerTypeFilter, operatorFilter, statusFilter, orderStatusFilter, paymentMethodsFilter]);

  // Map presentation statusFilter to API payment_status query parameter
  const mappedPaymentStatus = useMemo(() => {
    if (statusFilter === "PAID") return "PAID";
    if (statusFilter === "UNPAID") return "PARTIAL_PAID,UNPAID";
    return undefined; // ALL
  }, [statusFilter]);

  const mappedOrderStatus = useMemo(() => {
    if (orderStatusFilter === "SUCCESS") {
      return "IN_PRODUCTION,READY_FOR_PICKUP,COMPLETED";
    }
    if (orderStatusFilter === "REFUND") {
      return "REFUND";
    }
    return "IN_PRODUCTION,READY_FOR_PICKUP,COMPLETED,REFUND";
  }, [orderStatusFilter]);

  const startDateStr = useMemo(() => {
    if (!dateRange?.from) return undefined;
    try {
      const d = dateRange.from;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } catch {
      return undefined;
    }
  }, [dateRange]);

  const endDateStr = useMemo(() => {
    if (!dateRange?.to) return undefined;
    try {
      const d = dateRange.to;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } catch {
      return undefined;
    }
  }, [dateRange]);

  // Fetch report widgets data from backend API
  const { data: widgetsData } = useQuery({
    queryKey: orderKeys.reportWidgets({
      status: mappedOrderStatus,
      payment_status: mappedPaymentStatus,
      search: debouncedSearch || undefined,
      start_date: startDateStr,
      end_date: endDateStr,
      customer_type:
        customerTypeFilter !== "all"
          ? customerTypeFilter === "retail"
            ? "end_user"
            : "reseller"
          : undefined,
      cashier_id: operatorFilter !== "all" ? operatorFilter : undefined,
      payment_method: mappedPaymentMethods,
    }),
    queryFn: () =>
      getOrderReportWidgetsUseCase.execute({
        status: mappedOrderStatus,
        payment_status: mappedPaymentStatus,
        search: debouncedSearch || undefined,
        start_date: startDateStr,
        end_date: endDateStr,
        customer_type:
          customerTypeFilter !== "all"
            ? customerTypeFilter === "retail"
              ? "end_user"
              : "reseller"
            : undefined,
        cashier_id: operatorFilter !== "all" ? operatorFilter : undefined,
        payment_method: mappedPaymentMethods,
      }),
    staleTime: 5000,
    gcTime: 15_000,
    refetchOnWindowFocus: false,
  });

  // Fetch real order data from backend API with dynamic pagination
  const { data: response, isLoading } = useQuery<
    PaginatedResponse<OrderModel>,
    AppError
  >({
    queryKey: orderKeys.list({
      page,
      limit: pageSize,
      status: mappedOrderStatus,
      payment_status: mappedPaymentStatus,
      search: debouncedSearch || undefined,
      start_date: startDateStr,
      end_date: endDateStr,
      customer_type:
        customerTypeFilter !== "all"
          ? customerTypeFilter === "retail"
            ? "end_user"
            : "reseller"
          : undefined,
      cashier_id: operatorFilter !== "all" ? operatorFilter : undefined,
      payment_methods: mappedPaymentMethods,
    }),
    queryFn: () =>
      getOrdersUseCase.execute({
        page,
        limit: pageSize,
        status: mappedOrderStatus,
        payment_status: mappedPaymentStatus,
        search: debouncedSearch || undefined,
        start_date: startDateStr,
        end_date: endDateStr,
        customer_type:
          customerTypeFilter !== "all"
            ? customerTypeFilter === "retail"
              ? "end_user"
              : "reseller"
            : undefined,
        cashier_id: operatorFilter !== "all" ? operatorFilter : undefined,
        payment_methods: mappedPaymentMethods,
      }),
    staleTime: 5000,
    gcTime: 15_000,
    refetchOnWindowFocus: false,
  });

  const { data: usersData } = useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => getUsersUseCase.execute(),
    refetchOnWindowFocus: false,
  });

  // Map response order list to SalesTransaction
  const sales = useMemo((): SalesTransaction[] => {
    return (response?.data ?? []).map((order): SalesTransaction => {
      const quantity = (order.order_items ?? []).reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const productCategory =
        order.order_items?.[0]?.product_name || "Lain-lain";
      const uniqueMethods = Array.from(
        new Set(
          (order.order_payments ?? [])
            .map((p) => p.payment_method)
            .filter(Boolean)
        )
      );
      const paymentMethod = uniqueMethods.length > 0 ? uniqueMethods.join(", ") : "CASH";
      const operatorName =
        order.order_payments?.[0]?.cashier_name ||
        order.designer_name ||
        "Sistem";

      let status: "PAID" | "DOWN_PAYMENT" | "UNPAID" = "UNPAID";
      if (order.payment_status === "PAID") {
        status = "PAID";
      }

      let customerType: "retail" | "reseller" | "corporate" = "retail";
      if (order.reseller_id) {
        customerType = "reseller";
      }

      const formattedDate = formatDateTime(order.created_at);

      return {
        id: order.id,
        invoiceNumber: order.invoice_number || order.job_number,
        customerName: order.customer_name || "Customer Walk In",
        customerType,
        totalAmount: order.grand_total,
        paidAmount: order.amount_paid,
        paymentMethod,
        status,
        orderStatus: order.status,
        productCategory,
        createdAt: formattedDate,
        operatorName,
        quantity,
      };
    });
  }, [response]);

  // Client-side filtering fallback for filters not handled by server-side query
  const filteredSales = useMemo(() => {
    return sales;
  }, [sales]);

  // Statistics calculation based on backend reports API (with client fallback)
  const stats = useMemo(() => {
    if (widgetsData) {
      return {
        totalRevenue: widgetsData.omset_penjualan || 0,
        totalProductsSold: widgetsData.total_produk_terjual || 0,
        paidCount: widgetsData.status_nota?.lunas || 0,
        unpaidCount:
          widgetsData.status_nota?.belum_lunas ??
          widgetsData.belum_lunas_count ??
          0,
        transactionCount: widgetsData.volume_transaksi || 0,
      };
    }

    // Client-side fallback calculation when widgetsData is loading
    let totalRevenue = 0;
    let totalProductsSold = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    filteredSales.forEach((sale) => {
      totalRevenue += sale.totalAmount;
      totalProductsSold += sale.quantity || 0;
      if (sale.status === "PAID") {
        paidCount++;
      } else {
        unpaidCount++;
      }
    });

    return {
      totalRevenue,
      totalProductsSold,
      paidCount,
      unpaidCount,
      transactionCount: filteredSales.length,
    };
  }, [widgetsData, filteredSales]);

  // Dynamic calculations for charts based on filtered sales
  const categoriesData = useMemo(() => {
    const map = new Map<
      string,
      { name: string; value: number; count: number }
    >();
    filteredSales.forEach((sale) => {
      const cat = sale.productCategory;
      const current = map.get(cat) || { name: cat, value: 0, count: 0 };
      current.value += sale.totalAmount;
      current.count += 1;
      map.set(cat, current);
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [filteredSales]);

  const paymentsData = useMemo(() => {
    const map = new Map<string, { name: string; value: number }>();
    filteredSales.forEach((sale) => {
      const method = sale.paymentMethod;
      const current = map.get(method) || { name: method, value: 0 };
      current.value += sale.paidAmount;
      map.set(method, current);
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [filteredSales]);

  const customerTypesData = useMemo(() => {
    const map = new Map<string, { name: string; value: number }>();
    filteredSales.forEach((sale) => {
      const type =
        sale.customerType === "reseller"
          ? "Biro / Reseller"
          : sale.customerType === "corporate"
            ? "Corporate"
            : "Retail / Walk-in";
      const current = map.get(type) || { name: type, value: 0 };
      current.value += sale.totalAmount;
      map.set(type, current);
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [filteredSales]);

  // Active trend data based on selected period
  const trendData = useMemo(() => {
    if (trendPeriod === "weekly") return MOCK_REVENUE_TRENDS_WEEKLY;
    if (trendPeriod === "yearly") return MOCK_REVENUE_TRENDS_YEARLY;
    return MOCK_REVENUE_TRENDS_MONTHLY;
  }, [trendPeriod]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuTrendingUp className="text-primary" size={32} />
            Laporan Penjualan
          </h1>
          <p className="text-muted-foreground font-medium">
            Pantau performa penjualan cetakan, statistik omset, dan analisis
            produk terlaris secara real-time.
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

      {/* Main Tabs Segmented Control */}
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
            Daftar Transaksi
          </button>
          <button
            onClick={() => setActiveTab("analytic")}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "analytic"
                ? "bg-background shadow-md text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Analisis & Grafik
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "data" ? (
        <div className="space-y-6">
          {/* KPI Statistics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Omset Penjualan
                  </span>
                  <div className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <LuDollarSign size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Volume Transaksi
                  </span>
                  <div className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                    {stats.transactionCount} Nota
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-500">
                  <LuReceipt size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Produk Terjual
                  </span>
                  <div className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                    {stats.totalProductsSold.toLocaleString("id-ID")} Items
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-500">
                  <LuShoppingBag size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status Nota
                  </span>
                  <div className="text-[11px] font-bold text-foreground mt-1 flex flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {stats.paidCount} Lunas
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      {stats.unpaidCount} Belum Lunas
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <LuPercent size={24} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Global Filter Bar (Now inside Data Tab) */}
          <Card className="rounded-3xl border-border/50 shadow-sm">
            <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-[320px]">
                  <TextField
                    placeholder="Cari invoice, pelanggan..."
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

                {/* Popover Filter Dropdown */}
                <div className="relative">
                  <Button
                    variant={activeFiltersCount > 0 ? "default" : "outline"}
                    onClick={() => {
                      if (!isFilterOpen) {
                        setTempOperatorFilter(operatorFilter);
                        setTempStatusFilter(statusFilter);
                        setTempCustomerTypeFilter(customerTypeFilter);
                        setTempOrderStatusFilter(orderStatusFilter);
                        setTempPaymentMethodsFilter(paymentMethodsFilter);
                      }
                      setIsFilterOpen(!isFilterOpen);
                    }}
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
                          {/* Admin */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                              Admin
                            </label>
                             <Combobox
                               value={tempOperatorFilter}
                               onValueChange={(val) => {
                                 setTempOperatorFilter(val);
                               }}
                             >
                               <ComboboxTrigger className="w-full text-left font-semibold">
                                 <span>
                                   {tempOperatorFilter === "all"
                                     ? "Semua Admin"
                                     : (usersData ?? []).find((u) => u.id === tempOperatorFilter)?.username || "Pilih Admin"}
                                 </span>
                               </ComboboxTrigger>
                               <ComboboxContent
                                 align="start"
                                 className="w-[var(--radix-popover-trigger-width)]"
                               >
                                 <ComboboxInput placeholder="Cari admin..." />
                                 <ComboboxEmpty>
                                   Admin tidak ditemukan.
                                 </ComboboxEmpty>
                                 <ComboboxList>
                                   <ComboboxItem value="all">
                                     Semua Admin
                                   </ComboboxItem>
                                   {(usersData ?? []).map((u) => (
                                     <ComboboxItem key={u.id} value={u.id}>
                                       {u.username}
                                     </ComboboxItem>
                                   ))}
                                 </ComboboxList>
                               </ComboboxContent>
                             </Combobox>
                          </div>

                          {/* Status Penjualan */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                              Status Pembayaran
                            </label>
                            <Combobox
                              value={tempStatusFilter}
                              onValueChange={(val) => {
                                setTempStatusFilter(
                                  val as "all" | "PAID" | "UNPAID",
                                );
                              }}
                            >
                              <ComboboxTrigger className="w-full text-left font-semibold">
                                <span>
                                  {tempStatusFilter === "all"
                                    ? "Semua Status"
                                    : tempStatusFilter === "PAID"
                                      ? "Lunas"
                                      : "Belum Lunas"}
                                </span>
                              </ComboboxTrigger>
                              <ComboboxContent
                                align="start"
                                className="w-[var(--radix-popover-trigger-width)]"
                              >
                                <ComboboxInput placeholder="Cari status..." />
                                <ComboboxEmpty>
                                  Status tidak ditemukan.
                                </ComboboxEmpty>
                                <ComboboxList>
                                  <ComboboxItem value="all">
                                    Semua Status
                                  </ComboboxItem>
                                  <ComboboxItem value="PAID">
                                    Lunas
                                  </ComboboxItem>
                                  <ComboboxItem value="UNPAID">
                                    Belum Lunas
                                  </ComboboxItem>
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                          </div>

                          {/* Status Pesanan */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                              Status Pesanan
                            </label>
                            <Combobox
                              value={tempOrderStatusFilter}
                              onValueChange={(val) => {
                                setTempOrderStatusFilter(
                                  val as "all" | "SUCCESS" | "REFUND",
                                );
                              }}
                            >
                              <ComboboxTrigger className="w-full text-left font-semibold">
                                <span>
                                  {tempOrderStatusFilter === "all"
                                    ? "Semua Pesanan"
                                    : tempOrderStatusFilter === "SUCCESS"
                                      ? "Selesai"
                                      : "Refund"}
                                </span>
                              </ComboboxTrigger>
                              <ComboboxContent
                                align="start"
                                className="w-[var(--radix-popover-trigger-width)]"
                              >
                                <ComboboxInput placeholder="Cari status pesanan..." />
                                <ComboboxEmpty>
                                  Status tidak ditemukan.
                                </ComboboxEmpty>
                                <ComboboxList>
                                  <ComboboxItem value="all">
                                    Semua Pesanan
                                  </ComboboxItem>
                                  <ComboboxItem value="SUCCESS">
                                    Selesai
                                  </ComboboxItem>
                                  <ComboboxItem value="REFUND">
                                    Refund
                                  </ComboboxItem>
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                          </div>

                          {/* Tipe Pelanggan */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                              Tipe Pelanggan
                            </label>
                            <Combobox
                              value={tempCustomerTypeFilter}
                              onValueChange={(val) => {
                                setTempCustomerTypeFilter(val);
                              }}
                            >
                              <ComboboxTrigger className="w-full text-left font-semibold">
                                <span>
                                  {tempCustomerTypeFilter === "all"
                                    ? "Semua Tipe"
                                    : tempCustomerTypeFilter === "retail"
                                      ? "Retail"
                                      : "Biro / Reseller"}
                                </span>
                              </ComboboxTrigger>
                              <ComboboxContent
                                align="start"
                                className="w-[var(--radix-popover-trigger-width)]"
                              >
                                <ComboboxInput placeholder="Cari tipe pelanggan..." />
                                <ComboboxEmpty>
                                  Tipe tidak ditemukan.
                                </ComboboxEmpty>
                                <ComboboxList>
                                  <ComboboxItem value="all">
                                    Semua Tipe
                                  </ComboboxItem>
                                  <ComboboxItem value="retail">
                                    Retail
                                  </ComboboxItem>
                                  <ComboboxItem value="reseller">
                                    Biro / Reseller
                                  </ComboboxItem>
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                          </div>

                          {/* Metode Pembayaran */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                              Metode Pembayaran
                            </label>
                            <div className="flex flex-col gap-2">
                              {(
                                [
                                  { id: "CASH", label: "Tunai / Cash" },
                                  { id: "TRANSFER", label: "Transfer Bank" },
                                  { id: "QRIS", label: "QRIS" },
                                ] as const
                              ).map((method) => {
                                const isChecked = tempPaymentMethodsFilter.includes(
                                  method.id,
                                );
                                return (
                                  <label
                                    key={method.id}
                                    className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none"
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        setTempPaymentMethodsFilter((prev) =>
                                          checked
                                            ? [...prev, method.id]
                                            : prev.filter((p) => p !== method.id),
                                        );
                                      }}
                                    />
                                    <span className="text-foreground">
                                      {method.label}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-3 border-t border-border/40">
                            <button
                              type="button"
                              onClick={() => {
                                setTempOperatorFilter("all");
                                setTempStatusFilter("all");
                                setTempCustomerTypeFilter("all");
                                setTempOrderStatusFilter("all");
                                setTempPaymentMethodsFilter([]);

                                setOperatorFilter("all");
                                setStatusFilter("all");
                                setCustomerTypeFilter("all");
                                setOrderStatusFilter("all");
                                setPaymentMethodsFilter([]);
                                setPage(1);
                                setIsFilterOpen(false);
                              }}
                              className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Reset Filter
                            </button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setOperatorFilter(tempOperatorFilter);
                                setStatusFilter(tempStatusFilter);
                                setCustomerTypeFilter(tempCustomerTypeFilter);
                                setOrderStatusFilter(tempOrderStatusFilter);
                                setPaymentMethodsFilter(tempPaymentMethodsFilter);
                                setPage(1);
                                setIsFilterOpen(false);
                              }}
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
                      <TableHead className="py-4 px-5 text-center min-w-[120px]">
                        Tanggal
                      </TableHead>
                      <TableHead className="py-4 px-5">No. Nota</TableHead>
                      <TableHead className="py-4 px-5">Pelanggan</TableHead>
                      <TableHead className="py-4 px-5 text-right">
                        Total Tagihan
                      </TableHead>
                      <TableHead className="py-4 px-5 text-right">
                        Telah Dibayar
                      </TableHead>
                      <TableHead className="py-4 px-5 text-right">
                        Sisa Piutang
                      </TableHead>
                      <TableHead className="py-4 px-5 text-center">
                        Metode Pembayaran
                      </TableHead>
                      <TableHead className="py-4 px-5 text-center min-w-[160px]">
                        Status Pembayaran
                      </TableHead>
                      <TableHead className="py-4 px-5 text-center min-w-[140px]">
                        Status Pesanan
                      </TableHead>
                      <TableHead className="py-4 px-5 w-[150px] min-w-[120px]">
                        Admin
                      </TableHead>
                      <TableHead className="py-4 px-5 text-center">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/20 text-xs font-semibold text-foreground">
                    {isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={11}
                          className="text-center py-12 text-muted-foreground"
                        >
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="relative w-8 h-8">
                              <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            </div>
                            <span>Memuat data laporan...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredSales.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={11}
                          className="text-center py-12 text-muted-foreground"
                        >
                          Tidak ada transaksi penjualan ditemukan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSales.map((sale) => {
                        const outstanding = sale.totalAmount - sale.paidAmount;

                        // Generate a mock job number from the invoice number
                        const mockJobNumber = sale.invoiceNumber.replace(
                          "INV",
                          "JOB",
                        );

                        return (
                          <TableRow
                            key={sale.id}
                            className="hover:bg-muted/20 transition-colors duration-150"
                          >
                            {/* Date */}
                            <TableCell className="py-4 px-5 text-center min-w-[120px]">
                              {sale.createdAt.includes(", ") ? (
                                <div className="text-muted-foreground font-semibold leading-normal">
                                  <div>{sale.createdAt.split(", ")[0]},</div>
                                  <div className="text-[10px]">
                                    {sale.createdAt.split(", ")[1]}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-muted-foreground font-semibold">
                                  {sale.createdAt}
                                </div>
                              )}
                            </TableCell>

                            {/* Invoice Number */}
                            <TableCell className="py-4 px-5 space-y-1">
                              <div className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded-lg border border-border/50 inline-block">
                                {sale.invoiceNumber}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-semibold block">
                                No. Tiket : {mockJobNumber}
                              </div>
                            </TableCell>

                            {/* Customer Info */}
                            <TableCell className="py-4 px-5 space-y-1">
                              <div className="font-bold flex items-center gap-1.5">
                                <LuUser size={13} className="text-primary/70" />
                                {sale.customerName}
                              </div>
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border leading-none ${
                                  sale.customerType === "corporate"
                                    ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50"
                                    : sale.customerType === "reseller"
                                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50"
                                      : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/50"
                                }`}
                              >
                                {sale.customerType === "reseller"
                                  ? "Biro / Reseller"
                                  : sale.customerType === "corporate"
                                    ? "Corporate"
                                    : "Retail"}
                              </span>
                            </TableCell>

                            {/* Total Transaction */}
                            <TableCell className="py-4 px-5 text-right font-black text-foreground">
                              {formatCurrency(sale.totalAmount)}
                            </TableCell>

                            {/* Paid Amount */}
                            <TableCell className="py-4 px-5 text-right font-black text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(sale.paidAmount)}
                            </TableCell>

                            {/* Sisa Piutang */}
                            <TableCell className="py-4 px-5 text-right font-black">
                              {outstanding > 0 ? (
                                <span className="text-rose-500">
                                  {formatCurrency(outstanding)}
                                </span>
                              ) : (
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  -
                                </span>
                              )}
                            </TableCell>

                            {/* Payment Method */}
                            <TableCell className="py-4 px-5 text-center">
                              <div className="flex flex-wrap gap-1 justify-center">
                                {sale.paymentMethod.split(", ").map((method) => {
                                  let methodBadgeColor =
                                    "bg-muted text-muted-foreground border-border/50";
                                  const normalizedMethod = method.toLowerCase();
                                  if (normalizedMethod === "qris") {
                                    methodBadgeColor =
                                      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/50";
                                  } else if (
                                    normalizedMethod === "cash" ||
                                    normalizedMethod === "tunai"
                                  ) {
                                    methodBadgeColor =
                                      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50";
                                  } else if (
                                    normalizedMethod === "transfer" ||
                                    normalizedMethod === "transfer bank"
                                  ) {
                                    methodBadgeColor =
                                      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50";
                                  }

                                  return (
                                    <span
                                      key={method}
                                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border leading-none ${methodBadgeColor}`}
                                    >
                                      {method}
                                    </span>
                                  );
                                })}
                              </div>
                            </TableCell>

                            {/* Status Pembayaran */}
                            <TableCell className="py-4 px-5 text-center min-w-[160px]">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none ${
                                  sale.status === "PAID"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                                }`}
                              >
                                {sale.status === "PAID"
                                  ? "Lunas"
                                  : "Belum Lunas"}
                              </span>
                            </TableCell>

                            {/* Status Pesanan */}
                            <TableCell className="py-4 px-5 text-center min-w-[140px]">
                              {sale.orderStatus === "CANCELLED" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50">
                                  <LuCircleX className="h-3 w-3" />
                                  Dibatalkan
                                </span>
                              ) : sale.orderStatus === "REFUND" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/50">
                                  <LuRotateCcw className="h-3 w-3" />
                                  Refund
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
                                  <LuCircleCheck className="h-3 w-3" />
                                  Selesai
                                </span>
                              )}
                            </TableCell>

                            {/* Admin */}
                            <TableCell className="py-4 px-5">
                              <div className="font-semibold text-foreground">
                                {sale.operatorName}
                              </div>
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="py-4 px-5 text-center">
                              <div className="flex items-center justify-center">
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
                                  <DropdownContent align="end" className="w-44">
                                    <DropdownItem
                                      onClick={() => {
                                        const rawOrder =
                                          (response?.data ?? []).find(
                                            (o) => o.id === sale.id,
                                          ) || null;
                                        setSelectedSale(rawOrder);
                                        setIsDetailOpen(true);
                                      }}
                                    >
                                      <LuReceipt className="h-3.5 w-3.5 text-primary" />
                                      <span>Detail Rincian</span>
                                    </DropdownItem>
                                    <DropdownItem
                                      onClick={() => {
                                        alert(
                                          `Mencetak ulang struk untuk nota ${sale.invoiceNumber}...`,
                                        );
                                      }}
                                    >
                                      <LuPrinter className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span>Cetak Ulang Struk</span>
                                    </DropdownItem>
                                  </DropdownContent>
                                </Dropdown>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
          {/* Revenue and Cash Flow Trend Chart */}
          <Card className="rounded-3xl border-border/50 shadow-sm p-6 bg-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <LuTrendingUp className="text-primary" />
                  Tren Pendapatan & Kas Masuk
                </h3>
                <p className="text-xs text-muted-foreground">
                  Perbandingan total nilai pesanan (omset) dengan uang kas yang
                  diterima.
                </p>
              </div>

              {/* Period Switch Tabs */}
              <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border/30 self-start sm:self-center">
                {(["weekly", "monthly", "yearly"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTrendPeriod(period)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                      trendPeriod === period
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {period === "weekly"
                      ? "Mingguan"
                      : period === "monthly"
                        ? "Bulanan"
                        : "Tahunan"}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
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
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(156,163,175,0.15)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="currentColor"
                    className="text-muted-foreground text-xs"
                    tickLine={false}
                  />
                  <YAxis
                    stroke="currentColor"
                    className="text-muted-foreground text-xs"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card, #fff)",
                      borderColor: "rgba(156,163,175,0.2)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: unknown) => [
                      formatCurrency(Number(value || 0)),
                      "",
                    ]}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area
                    type="monotone"
                    name="Omset Penjualan"
                    dataKey="omset"
                    stroke="var(--color-primary, #3b82f6)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOmset)"
                  />
                  <Area
                    type="monotone"
                    name="Kas Masuk"
                    dataKey="cashflow"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCash)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Grid for product distribution and demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Products Category Performance */}
            <Card className="rounded-3xl border-border/50 shadow-sm p-6 bg-card">
              <div className="space-y-1 mb-6">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <LuShoppingBag className="text-indigo-500" />
                  Kategori Cetakan Terlaris (Rp)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Kontribusi omset penjualan berdasarkan kategori produk cetak.
                </p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoriesData} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="rgba(156,163,175,0.15)"
                    />
                    <XAxis
                      type="number"
                      stroke="currentColor"
                      className="text-muted-foreground text-xs"
                      tickLine={false}
                      tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(1)}M`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="currentColor"
                      className="text-foreground text-xs font-medium"
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card, #fff)",
                        borderColor: "rgba(156,163,175,0.2)",
                        borderRadius: "12px",
                      }}
                      formatter={(value: unknown) => [
                        formatCurrency(Number(value || 0)),
                        "Omset",
                      ]}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
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
            </Card>

            {/* Demographics & Payments Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Payment Methods Chart */}
              <Card className="rounded-3xl border-border/50 shadow-sm p-6 bg-card flex flex-col justify-between">
                <div className="space-y-1 mb-4">
                  <h3 className="text-md font-bold text-foreground">
                    Metode Pembayaran
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Rasio penggunaan channel pembayaran.
                  </p>
                </div>
                <div className="h-[200px] w-full relative flex items-center justify-center">
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
                        formatter={(value: unknown) => [
                          formatCurrency(Number(value || 0)),
                          "Total",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {paymentsData.map((item, idx) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-xs font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[idx % COLORS.length],
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
              </Card>

              {/* Customer Types Chart */}
              <Card className="rounded-3xl border-border/50 shadow-sm p-6 bg-card flex flex-col justify-between">
                <div className="space-y-1 mb-4">
                  <h3 className="text-md font-bold text-foreground">
                    Segmentasi Pelanggan
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Proporsi kontribusi omset dari tiap tipe pelanggan.
                  </p>
                </div>
                <div className="h-[200px] w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerTypesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {customerTypesData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[(index + 3) % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: unknown) => [
                          formatCurrency(Number(value || 0)),
                          "Total",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {customerTypesData.map((item, idx) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-xs font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[(idx + 3) % COLORS.length],
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
              </Card>
            </div>
          </div>
        </div>
      )}
      <DetailReportSelling
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        sale={selectedSale}
      />
    </div>
  );
};

export default ReportSellingPage;
