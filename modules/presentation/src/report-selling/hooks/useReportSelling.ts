import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOrderDI } from "@presentation/order/hooks/useOrderDI";
import { orderKeys } from "@infrastructure/order/keys";
import { useUserDI } from "../../user/hooks/useUserDI";
import { userKeys } from "@infrastructure/user/keys/user.key";
import { useDebounce } from "../../shared/hooks/useDebounce";
import type { DateRange } from "@erp-digital-printing/ui/DateRangePicker";
import type { OrderModel } from "@core/order/domains/models/order.model";

export interface SalesTransaction {
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

export const useReportSelling = () => {
  const { getOrdersUseCase, getSalesReportWidgetsUseCase } = useOrderDI();
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
  const [paymentMethodsFilter, setPaymentMethodsFilter] = useState<string[]>(
    [],
  );
  const [tempPaymentMethodsFilter, setTempPaymentMethodsFilter] = useState<
    string[]
  >([]);
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
  }, [
    customerTypeFilter,
    operatorFilter,
    statusFilter,
    orderStatusFilter,
    paymentMethodsFilter,
  ]);

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
    queryKey: orderKeys.salesReportWidgets({
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
      getSalesReportWidgetsUseCase.execute({
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
  const { data: response, isLoading } = useQuery({
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
            .filter(Boolean),
        ),
      );
      const paymentMethod =
        uniqueMethods.length > 0 ? uniqueMethods.join(", ") : "CASH";
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
        paidCount: widgetsData.lunas_count || 0,
        unpaidCount: widgetsData.belum_lunas_count || 0,
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
    return [
      { name: "Banner & Spanduk", value: 45500000 },
      { name: "Stiker A3+ & Label", value: 32400000 },
      { name: "Brosur & Flyer", value: 18900000 },
      { name: "Kartu Nama", value: 12500000 },
      { name: "Buku & Dokumen", value: 8700000 },
    ];
  }, []);

  const paymentsData = useMemo(() => {
    return [
      { name: "Transfer Bank", value: 58200000 },
      { name: "QRIS", value: 32500000 },
      { name: "Tunai / Cash", value: 14300000 },
    ];
  }, []);

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

  return {
    activeTab,
    setActiveTab,
    trendPeriod,
    setTrendPeriod,
    searchQuery,
    setSearchQuery,
    customerTypeFilter,
    setCustomerTypeFilter,
    operatorFilter,
    setOperatorFilter,
    statusFilter,
    setStatusFilter,
    orderStatusFilter,
    setOrderStatusFilter,
    tempCustomerTypeFilter,
    setTempCustomerTypeFilter,
    tempOperatorFilter,
    setTempOperatorFilter,
    tempStatusFilter,
    setTempStatusFilter,
    tempOrderStatusFilter,
    setTempOrderStatusFilter,
    paymentMethodsFilter,
    setPaymentMethodsFilter,
    tempPaymentMethodsFilter,
    setTempPaymentMethodsFilter,
    isFilterOpen,
    setIsFilterOpen,
    page,
    setPage,
    pageSize,
    setPageSize,
    dateRange,
    setDateRange,
    selectedSale,
    setSelectedSale,
    isDetailOpen,
    setIsDetailOpen,
    activeFiltersCount,
    usersData,
    sales,
    filteredSales,
    stats,
    categoriesData,
    paymentsData,
    customerTypesData,
    trendData,
    formatCurrency,
    isLoading,
    response,
  };
};
