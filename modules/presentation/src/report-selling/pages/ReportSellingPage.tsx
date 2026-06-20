import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardContent } from "@erp-digital-printing/ui/Card";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { DateRangePicker, type DateRange } from "@erp-digital-printing/ui/DateRangePicker";
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
import {
  LuTrendingUp,
  LuSearch,
  LuFileSpreadsheet,
  LuReceipt,
  LuDollarSign,
  LuPercent,
  LuUsers,
  LuShoppingBag,
  LuUser,
  LuCalendar,
  LuEllipsisVertical,
  LuPrinter,
  LuFilter,
  LuClock,
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
  productCategory: string;
  createdAt: string;
  operatorName: string;
  quantity: number;
}

const MOCK_SALES: SalesTransaction[] = [
  {
    id: "1",
    invoiceNumber: "INV/2026/06/001",
    customerName: "Budi Santoso",
    customerType: "retail",
    totalAmount: 150000,
    paidAmount: 150000,
    paymentMethod: "QRIS",
    status: "PAID",
    productCategory: "Banner/Spanduk",
    createdAt: "2026-06-12 10:15:44",
    operatorName: "Andi",
    quantity: 5,
  },
  {
    id: "2",
    invoiceNumber: "INV/2026/06/002",
    customerName: "CV. Makmur Jaya",
    customerType: "corporate",
    totalAmount: 4500000,
    paidAmount: 2000000,
    paymentMethod: "Transfer Bank",
    status: "DOWN_PAYMENT",
    productCategory: "Brochure/Flyer",
    createdAt: "2026-06-13 11:30:10",
    operatorName: "Siti",
    quantity: 1000,
  },
  {
    id: "3",
    invoiceNumber: "INV/2026/06/003",
    customerName: "Rian Printing (Reseller)",
    customerType: "reseller",
    totalAmount: 850000,
    paidAmount: 850000,
    paymentMethod: "Cash",
    status: "PAID",
    productCategory: "Sticker Vinyl",
    createdAt: "2026-06-14 16:45:00",
    operatorName: "Budi",
    quantity: 250,
  },
  {
    id: "4",
    invoiceNumber: "INV/2026/06/004",
    customerName: "Siti Rahma",
    customerType: "retail",
    totalAmount: 75000,
    paidAmount: 75000,
    paymentMethod: "QRIS",
    status: "PAID",
    productCategory: "Dokumen A4",
    createdAt: "2026-06-15 09:20:11",
    operatorName: "Andi",
    quantity: 150,
  },
  {
    id: "5",
    invoiceNumber: "INV/2026/06/005",
    customerName: "Anto Wijaya",
    customerType: "retail",
    totalAmount: 320000,
    paidAmount: 0,
    paymentMethod: "Cash",
    status: "UNPAID",
    productCategory: "Merchandise",
    createdAt: "2026-06-16 11:00:23",
    operatorName: "Rian",
    quantity: 8,
  },
  {
    id: "6",
    invoiceNumber: "INV/2026/06/006",
    customerName: "Indo Media Perkasa",
    customerType: "corporate",
    totalAmount: 12500000,
    paidAmount: 12500000,
    paymentMethod: "Transfer Bank",
    status: "PAID",
    productCategory: "Banner/Spanduk",
    createdAt: "2026-06-16 13:05:52",
    operatorName: "Siti",
    quantity: 40,
  },
  {
    id: "7",
    invoiceNumber: "INV/2026/06/007",
    customerName: "Dewi Lestari",
    customerType: "reseller",
    totalAmount: 1200000,
    paidAmount: 600000,
    paymentMethod: "QRIS",
    status: "DOWN_PAYMENT",
    productCategory: "Sticker Vinyl",
    createdAt: "2026-06-17 14:50:33",
    operatorName: "Budi",
    quantity: 350,
  },
  {
    id: "8",
    invoiceNumber: "INV/2026/06/008",
    customerName: "Rahmat Hidayat",
    customerType: "retail",
    totalAmount: 45000,
    paidAmount: 45000,
    paymentMethod: "Cash",
    status: "PAID",
    productCategory: "Kartu Nama",
    createdAt: "2026-06-18 10:10:00",
    operatorName: "Rian",
    quantity: 2,
  },
];

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

const MOCK_CATEGORIES = [
  { name: "Banner/Spanduk", value: 12650000, count: 2 },
  { name: "Brochure/Flyer", value: 4500000, count: 1 },
  { name: "Sticker Vinyl", value: 2050000, count: 2 },
  { name: "Merchandise", value: 320000, count: 1 },
  { name: "Dokumen A4", value: 75000, count: 1 },
  { name: "Kartu Nama", value: 45000, count: 1 },
];

const MOCK_PAYMENTS = [
  { name: "Transfer Bank", value: 14500000 },
  { name: "QRIS", value: 1425000 },
  { name: "Cash", value: 970000 },
];

const MOCK_CUSTOMER_TYPES = [
  { name: "Corporate", value: 17000000 },
  { name: "Reseller", value: 2050000 },
  { name: "Retail / Walk-in", value: 590000 },
];

const COLORS = ["var(--color-primary, #3b82f6)", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const ReportSellingPage = () => {
  const { getOrdersUseCase } = useOrderDI();
  const [activeTab, setActiveTab] = useState<"data" | "analytic">("data");
  const [trendPeriod, setTrendPeriod] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 750);
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>("all");
  const [operatorFilter, setOperatorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "PAID" | "UNPAID">("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date("2026-06-01"),
    to: new Date("2026-06-30"),
  });

  const [selectedSale, setSelectedSale] = useState<OrderModel | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (customerTypeFilter !== "all") count++;
    if (operatorFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    return count;
  }, [customerTypeFilter, operatorFilter, statusFilter]);

  // Map presentation statusFilter to API payment_status query parameter
  const mappedPaymentStatus = useMemo(() => {
    if (statusFilter === "PAID") return "PAID";
    if (statusFilter === "UNPAID") return "PARTIAL_PAID,UNPAID";
    return undefined; // ALL
  }, [statusFilter]);

  const startDateStr = useMemo(() => {
    if (!dateRange?.from) return undefined;
    try {
      return dateRange.from.toISOString().split("T")[0];
    } catch {
      return undefined;
    }
  }, [dateRange]);

  const endDateStr = useMemo(() => {
    if (!dateRange?.to) return undefined;
    try {
      return dateRange.to.toISOString().split("T")[0];
    } catch {
      return undefined;
    }
  }, [dateRange]);

  // Fetch real order data from backend API with dynamic pagination
  const { data: response, isLoading } = useQuery<PaginatedResponse<OrderModel>, AppError>({
    queryKey: orderKeys.list({
      page,
      limit: pageSize,
      status: "IN_PRODUCTION,READY_FOR_PICKUP,COMPLETED",
      payment_status: mappedPaymentStatus,
      search: debouncedSearch || undefined,
      start_date: startDateStr,
      end_date: endDateStr,
    }),
    queryFn: () =>
      getOrdersUseCase.execute({
        page,
        limit: pageSize,
        status: "IN_PRODUCTION,READY_FOR_PICKUP,COMPLETED",
        payment_status: mappedPaymentStatus,
        search: debouncedSearch || undefined,
        start_date: startDateStr,
        end_date: endDateStr,
      }),
    staleTime: 5000,
    gcTime: 15_000,
    refetchOnWindowFocus: false,
  });

  // Map response order list to SalesTransaction
  const sales = useMemo((): SalesTransaction[] => {
    return (response?.data ?? []).map((order): SalesTransaction => {
      const quantity = (order.order_items ?? []).reduce((sum, item) => sum + item.quantity, 0);
      const productCategory = order.order_items?.[0]?.product_name || "Lain-lain";
      const paymentMethod = order.order_payments?.[0]?.payment_method || "CASH";
      const operatorName = order.order_payments?.[0]?.cashier_name || order.designer_name || "Sistem";

      let status: "PAID" | "DOWN_PAYMENT" | "UNPAID" = "UNPAID";
      if (order.payment_status === "PAID") {
        status = "PAID";
      }

      let customerType: "retail" | "reseller" | "corporate" = "retail";
      if (order.reseller_id) {
        customerType = "reseller";
      }

      let formattedDate = order.created_at;
      try {
        const dateObj = new Date(order.created_at);
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();
        const hours = String(dateObj.getHours()).padStart(2, "0");
        const minutes = String(dateObj.getMinutes()).padStart(2, "0");
        formattedDate = `${day}/${month}/${year}, ${hours}.${minutes}`;
      } catch (e) {
        // Fallback
      }

      return {
        id: order.id,
        invoiceNumber: order.invoice_number || order.job_number,
        customerName: order.customer_name || "Customer Walk In",
        customerType,
        totalAmount: order.grand_total,
        paidAmount: order.amount_paid,
        paymentMethod,
        status,
        productCategory,
        createdAt: formattedDate,
        operatorName,
        quantity,
      };
    });
  }, [response]);

  // Client-side filtering fallback for filters not handled by server-side query
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesType =
        customerTypeFilter === "all" || sale.customerType === customerTypeFilter;

      const matchesOperator =
        operatorFilter === "all" || sale.operatorName === operatorFilter;

      return matchesType && matchesOperator;
    });
  }, [sales, customerTypeFilter, operatorFilter]);

  // Statistics calculation based on filtered data
  const stats = useMemo(() => {
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
  }, [filteredSales]);

  // Dynamic calculations for charts based on filtered sales
  const categoriesData = useMemo(() => {
    const map = new Map<string, { name: string; value: number; count: number }>();
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
      const type = sale.customerType === "reseller" ? "Biro / Reseller" : sale.customerType === "corporate" ? "Corporate" : "Retail / Walk-in";
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
            Pantau performa penjualan cetakan, statistik omset, dan analisis produk terlaris secara real-time.
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
            Analitik & Grafik
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
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Omset Penjualan</span>
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
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Volume Transaksi</span>
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
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Produk Terjual</span>
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
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status Nota</span>
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

                          {/* Admin */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                              Admin
                            </label>
                            <select
                              value={operatorFilter}
                              onChange={(e) => {
                                setOperatorFilter(e.target.value);
                                setPage(1);
                              }}
                              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="all">Semua Admin</option>
                              <option value="Andi">Andi</option>
                              <option value="Siti">Siti</option>
                              <option value="Budi">Budi</option>
                              <option value="Rian">Rian</option>
                            </select>
                          </div>

                          {/* Status Penjualan */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                              Status Penjualan
                            </label>
                            <select
                              value={statusFilter}
                              onChange={(e) => {
                                setStatusFilter(e.target.value as "all" | "PAID" | "UNPAID");
                                setPage(1);
                              }}
                              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="all">Semua Status</option>
                              <option value="PAID">Lunas</option>
                              <option value="UNPAID">Belum Lunas</option>
                            </select>
                          </div>

                          {/* Tipe Pelanggan */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                              Tipe Pelanggan
                            </label>
                            <select
                              value={customerTypeFilter}
                              onChange={(e) => {
                                setCustomerTypeFilter(e.target.value);
                                setPage(1);
                              }}
                              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="all">Semua Tipe</option>
                              <option value="retail">Retail</option>
                              <option value="reseller">Biro / Reseller</option>
                            </select>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-3 border-t border-border/40">
                            <button
                              type="button"
                              onClick={() => {
                                setOperatorFilter("all");
                                setStatusFilter("all");
                                setCustomerTypeFilter("all");
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
          </Card>

          {/* Transactions Table Card */}
          <Card className="rounded-3xl overflow-hidden border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                   <TableHeader>
                    <TableRow className="bg-muted/40 border-b border-border/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <TableHead className="py-4 px-5 w-[180px] min-w-[160px]">Tanggal</TableHead>
                      <TableHead className="py-4 px-5">No. Nota</TableHead>
                      <TableHead className="py-4 px-5">Pelanggan</TableHead>
                      <TableHead className="py-4 px-5 text-right">Total Tagihan</TableHead>
                      <TableHead className="py-4 px-5 text-right">Telah Dibayar</TableHead>
                      <TableHead className="py-4 px-5 text-right">Sisa Piutang</TableHead>
                      <TableHead className="py-4 px-5 text-center">Metode</TableHead>
                      <TableHead className="py-4 px-5 text-center">Status</TableHead>
                      <TableHead className="py-4 px-5 w-[150px] min-w-[120px]">Admin</TableHead>
                      <TableHead className="py-4 px-5 text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/20 text-xs font-semibold text-foreground">
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
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
                        <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                          Tidak ada transaksi penjualan ditemukan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSales.map((sale) => {
                        const outstanding = sale.totalAmount - sale.paidAmount;
                        
                        let badgeColor = "bg-muted text-muted-foreground border-border/50";
                        const normalizedMethod = sale.paymentMethod.toLowerCase();
                        if (normalizedMethod === "qris") {
                          badgeColor = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/50";
                        } else if (normalizedMethod === "cash" || normalizedMethod === "tunai") {
                          badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50";
                        } else if (normalizedMethod === "transfer" || normalizedMethod === "transfer bank") {
                          badgeColor = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50";
                        }

                        // Generate a mock job number from the invoice number
                        const mockJobNumber = sale.invoiceNumber.replace("INV", "JOB");

                        return (
                          <TableRow key={sale.id} className="hover:bg-muted/20 transition-colors duration-150">
                            {/* Date */}
                            <TableCell className="py-4 px-5 w-[180px] min-w-[160px]">
                              <div className="text-foreground flex items-center gap-2 font-bold whitespace-nowrap">
                                <LuCalendar size={14} className="text-muted-foreground/80 shrink-0" />
                                <span>{sale.createdAt}</span>
                              </div>
                            </TableCell>

                            {/* Invoice Number */}
                            <TableCell className="py-4 px-5 space-y-1">
                              <div className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded-lg border border-border/50 inline-block">
                                {sale.invoiceNumber}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-semibold block">
                                No. Tiket / Job: {mockJobNumber}
                              </div>
                            </TableCell>

                            {/* Customer Info */}
                            <TableCell className="py-4 px-5 space-y-1">
                              <div className="font-bold flex items-center gap-1.5">
                                <LuUser size={13} className="text-primary/70" />
                                {sale.customerName}
                              </div>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border leading-none ${
                                sale.customerType === "corporate"
                                  ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50"
                                  : sale.customerType === "reseller"
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50"
                                  : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/50"
                              }`}>
                                {sale.customerType === "reseller" ? "Biro / Reseller" : sale.customerType === "corporate" ? "Corporate" : "Retail"}
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
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border leading-none ${badgeColor}`}>
                                {sale.paymentMethod}
                              </span>
                            </TableCell>

                            {/* Status */}
                            <TableCell className="py-4 px-5 text-center">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none ${
                                sale.status === "PAID"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                              }`}>
                                {sale.status === "PAID" ? "Lunas" : "Belum Lunas"}
                              </span>
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
                                    <DropdownItem onClick={() => {
                                      const rawOrder = (response?.data ?? []).find((o) => o.id === sale.id) || null;
                                      setSelectedSale(rawOrder);
                                      setIsDetailOpen(true);
                                    }}>
                                      <LuReceipt className="h-3.5 w-3.5 text-primary" />
                                      <span>Detail Rincian</span>
                                    </DropdownItem>
                                    <DropdownItem onClick={() => {
                                      alert(`Mencetak ulang struk untuk nota ${sale.invoiceNumber}...`);
                                    }}>
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
                  Perbandingan total nilai pesanan (omset) dengan uang kas yang diterima.
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
                    {period === "weekly" ? "Mingguan" : period === "monthly" ? "Bulanan" : "Tahunan"}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156,163,175,0.15)" />
                  <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} />
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
                    formatter={(value: unknown) => [formatCurrency(Number(value || 0)), ""]}
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
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(156,163,175,0.15)" />
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
                      formatter={(value: unknown) => [formatCurrency(Number(value || 0)), "Omset"]}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {categoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  <h3 className="text-md font-bold text-foreground">Metode Pembayaran</h3>
                  <p className="text-xs text-muted-foreground">Rasio penggunaan channel pembayaran.</p>
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
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: unknown) => [formatCurrency(Number(value || 0)), "Total"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {paymentsData.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-foreground">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Customer Types Chart */}
              <Card className="rounded-3xl border-border/50 shadow-sm p-6 bg-card flex flex-col justify-between">
                <div className="space-y-1 mb-4">
                  <h3 className="text-md font-bold text-foreground">Segmentasi Pelanggan</h3>
                  <p className="text-xs text-muted-foreground">Proporsi kontribusi omset dari tiap tipe pelanggan.</p>
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
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: unknown) => [formatCurrency(Number(value || 0)), "Total"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {customerTypesData.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[(idx + 3) % COLORS.length] }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-foreground">{formatCurrency(item.value)}</span>
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

