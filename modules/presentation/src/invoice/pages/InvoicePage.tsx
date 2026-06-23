import React, { useState, useMemo } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Card, CardContent } from "@erp-digital-printing/ui/Card";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { TablePagination } from "@erp-digital-printing/ui/Table";
import { Checkbox } from "@erp-digital-printing/ui/Checkbox";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@erp-digital-printing/ui/Dropdown";
import {
  DateRangePicker,
  type DateRange,
} from "@erp-digital-printing/ui/DateRangePicker";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@erp-digital-printing/ui/Toast";
import {
  LuSearch,
  LuUser,
  LuShoppingBag,
  LuCreditCard,
  LuReceipt,
  LuCheck,
  LuPrinter,
  LuClock,
  LuInfo,
  LuCoins,
  LuTrendingUp,
  LuDollarSign,
  LuEllipsisVertical,
  LuScissors,
  LuQrCode,
  LuFilter,
  LuRotateCcw,
  LuCircleCheck,
  LuCircleX,
} from "@erp-digital-printing/ui/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useOrderDI } from "@presentation/order/hooks/useOrderDI";
import { orderKeys } from "@infrastructure/order/keys";
import { useDebounce } from "../../shared/hooks/useDebounce";
import type { AppError } from "@core/shared/errors/domain.error";
import type {
  OrderModel,
  OrderSpkModel,
  OrderPaymentModel,
} from "@core/order/domains/models/order.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { RepayPaymentInput } from "@core/order/domains/repositories/order.repository";

// Interfaces for mapped presentation UI
interface InvoiceItem {
  id: string;
  productName: string;
  qty: number;
  pricePerUnit: number;
  subtotal: number;
  notes?: string;
}

interface Invoice {
  id: string;
  invoiceNo: string;
  jobNumber: string;
  customerName: string;
  customerPhone: string;
  isReseller: boolean;
  createdAt: string;
  items: InvoiceItem[];
  paymentMethods: string[];
  totalAmount: number;
  amountPaid: number;
  status: "PAID" | "PARTIAL" | "UNPAID";
  orderStatus: string;
}

const InvoicePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 750);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return {
      from: today,
      to: today,
    };
  });

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

  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "UNPAID">(
    "ALL",
  );
  const [customerTypeFilter, setCustomerTypeFilter] = useState<
    "ALL" | "RESELLER" | "RETAIL"
  >("ALL");
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    "ALL" | "SUCCESS" | "CANCELLED"
  >("SUCCESS");
  const [paymentMethodsFilter, setPaymentMethodsFilter] = useState<string[]>(
    [],
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "ALL") count++;
    if (customerTypeFilter !== "ALL") count++;
    if (orderStatusFilter !== "SUCCESS") count++;
    if (paymentMethodsFilter.length > 0) count++;
    return count;
  }, [
    statusFilter,
    customerTypeFilter,
    orderStatusFilter,
    paymentMethodsFilter,
  ]);

  const mappedOrderStatus = useMemo(() => {
    if (orderStatusFilter === "SUCCESS") {
      return "IN_PRODUCTION,READY_FOR_PICKUP,COMPLETED";
    }
    if (orderStatusFilter === "CANCELLED") {
      return "CANCELLED";
    }
    return "IN_PRODUCTION,READY_FOR_PICKUP,COMPLETED,CANCELLED";
  }, [orderStatusFilter]);

  const mappedPaymentStatus = useMemo(() => {
    if (statusFilter === "PAID") return "PAID";
    if (statusFilter === "UNPAID") return "PARTIAL_PAID,UNPAID";
    return undefined; // ALL
  }, [statusFilter]);

  const mappedPaymentMethods = useMemo(() => {
    if (paymentMethodsFilter.length === 0) return undefined;
    return paymentMethodsFilter.join(",").toLowerCase();
  }, [paymentMethodsFilter]);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection states for Dialogs
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isSpkOpen, setIsSpkOpen] = useState(false);
  const [selectedSpkCategory, setSelectedSpkCategory] = useState<string | null>(
    null,
  );
  const [isSpkPreviewOpen, setIsSpkPreviewOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Quick Payment form states
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>("CASH");
  const [isSplitPayment, setIsSplitPayment] = useState<boolean>(false);
  const [splitAmounts, setSplitAmounts] = useState<{
    cash: number;
    transfer: number;
    qris: number;
  }>({ cash: 0, transfer: 0, qris: 0 });

  const outstandingAmount = useMemo(() => {
    if (!selectedInvoice) return 0;
    return selectedInvoice.totalAmount - selectedInvoice.amountPaid;
  }, [selectedInvoice]);

  const totalSplitInput = useMemo(() => {
    return splitAmounts.cash + splitAmounts.transfer + splitAmounts.qris;
  }, [splitAmounts]);

  const remainingOutstanding = useMemo(() => {
    return Math.max(
      0,
      outstandingAmount - (isSplitPayment ? totalSplitInput : payAmount),
    );
  }, [outstandingAmount, isSplitPayment, totalSplitInput, payAmount]);

  const {
    getOrdersUseCase,
    repayOrderUseCase,
    getOrderPaymentsUseCase,
    getOrderSpkUseCase,
  } = useOrderDI();

  // Fetch SPK from backend when the modal is open
  const { data: spkResponse, isLoading: isLoadingSpk } = useQuery<
    OrderSpkModel,
    AppError
  >({
    queryKey: orderKeys.spk(selectedInvoice?.id ?? ""),
    queryFn: () => getOrderSpkUseCase.execute(selectedInvoice!.id),
    enabled: isSpkOpen && !!selectedInvoice?.id,
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  // Fetch Payment History from backend when the detail modal is open
  const { data: payments, isLoading: isLoadingPayments } = useQuery<
    OrderPaymentModel[],
    AppError
  >({
    queryKey: orderKeys.payments(selectedInvoice?.id ?? ""),
    queryFn: () => getOrderPaymentsUseCase.execute(selectedInvoice!.id),
    enabled: isDetailOpen && !!selectedInvoice?.id,
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  const groupedPayments = useMemo(() => {
    if (!payments) return [];

    // Group by payment_number
    const map = new Map<number, typeof payments>();
    payments.forEach((p) => {
      const num = p.payment_number || 1; // Fallback to 1 if missing
      if (!map.has(num)) {
        map.set(num, []);
      }
      map.get(num)!.push(p);
    });

    // Convert map to array and sort by payment_number
    return Array.from(map.entries())
      .map(([payment_number, pays]) => {
        const totalAmount = pays.reduce((sum, p) => sum + p.amount, 0);
        const created_at = pays[0]?.created_at;
        const cashier_name = pays[0]?.cashier_name;
        const methods = pays.map((p) => p.payment_method).join(", ");
        const payment_type = pays[0]?.payment_type;

        return {
          id: pays[0]?.id ?? "",
          payment_number,
          payment_type,
          methods,
          totalAmount,
          created_at,
          cashier_name,
          details: pays,
        };
      })
      .sort((a, b) => a.payment_number - b.payment_number);
  }, [payments]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

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

  // Fetch real order data from backend API with dynamic pagination
  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery<PaginatedResponse<OrderModel>, AppError>({
    queryKey: orderKeys.list({
      page,
      limit: pageSize,
      status: mappedOrderStatus,
      payment_status: mappedPaymentStatus,
      search: debouncedSearch || undefined,
      start_date: startDateStr,
      end_date: endDateStr,
      customer_type:
        customerTypeFilter !== "ALL"
          ? customerTypeFilter.toLowerCase()
          : undefined,
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
          customerTypeFilter !== "ALL"
            ? customerTypeFilter.toLowerCase()
            : undefined,
        payment_methods: mappedPaymentMethods,
      }),
    staleTime: 5000,
    gcTime: 15_000,
    refetchOnWindowFocus: false,
  });

  // Purely computed invoices state from API response
  const invoices = useMemo((): Invoice[] => {
    return (response?.data ?? []).map((order): Invoice => {
      // Format backend date to localized Indonesian date
      const formattedDate = formatDateTime(order.created_at);

      return {
        id: order.id,
        invoiceNo: order.invoice_number || order.job_number,
        jobNumber: order.job_number,
        customerName: order.customer_name || "Customer Walk In",
        customerPhone: order.customer_phone || "-",
        isReseller: !!order.reseller_id,
        createdAt: formattedDate,
        items: (order.order_items ?? []).map((item) => ({
          id: item.id,
          productName: item.variant_name
            ? `${item.product_name} (${item.variant_name})`
            : item.product_name,
          qty: item.quantity,
          pricePerUnit: item.price_per_unit || 0,
          subtotal: item.subtotal || 0,
          notes: item.production_notes || "-",
        })),
        totalAmount: order.grand_total || 0,
        amountPaid: order.amount_paid || 0,
        paymentMethods: Array.from(
          new Set(
            (order.order_payments ?? [])
              .map((pay) => pay.payment_method.toUpperCase())
              .filter(Boolean),
          ),
        ),
        status:
          order.payment_status === "PAID"
            ? "PAID"
            : order.payment_status === "PARTIAL_PAID"
              ? "PARTIAL"
              : "UNPAID",
        orderStatus: order.status,
      };
    });
  }, [response]);

  // Get active items for the selected SPK category from backend data
  const activeSpkCategoryItems = useMemo(() => {
    if (!spkResponse || !selectedSpkCategory) return [];
    const cat = spkResponse.spk_by_category.find(
      (c) => c.category_name === selectedSpkCategory,
    );
    return cat ? cat.items : [];
  }, [spkResponse, selectedSpkCategory]);

  // Invoices are already filtered on the backend side
  const filteredInvoices = invoices;

  // Statistics Computations
  const stats = useMemo(() => {
    const totalCount = filteredInvoices.length;
    const paidCount = filteredInvoices.filter(
      (i) => i.status === "PAID",
    ).length;
    const unpaidCount = filteredInvoices.filter(
      (i) => i.status !== "PAID",
    ).length;
    const totalReceivable = filteredInvoices.reduce(
      (sum, i) => sum + (i.totalAmount - i.amountPaid),
      0,
    );
    const totalCollected = filteredInvoices.reduce(
      (sum, i) => sum + i.amountPaid,
      0,
    );

    // Total Penjualan: Lunas + Piutang (Grand Total of all invoices)
    const totalSales = filteredInvoices.reduce(
      (sum, i) => sum + i.totalAmount,
      0,
    );

    // Total Pendapatan: Hanya transaksi yang lunas saja
    const totalRevenue = filteredInvoices
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + i.totalAmount, 0);

    return {
      totalCount,
      paidCount,
      unpaidCount,
      totalReceivable,
      totalCollected,
      totalSales,
      totalRevenue,
    };
  }, [filteredInvoices]);

  const handleOpenPay = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPayAmount(invoice.totalAmount - invoice.amountPaid);
    setPayMethod("CASH");
    setIsSplitPayment(false);
    setSplitAmounts({ cash: 0, transfer: 0, qris: 0 });
    setIsPayOpen(true);
  };

  // Mutation to process quick payment (pelunasan) in backend
  const processPaymentMutation = useMutation<
    void,
    AppError,
    { id: string; payload: RepayPaymentInput }
  >({
    mutationFn: ({ id, payload }) => repayOrderUseCase.execute(id, payload),
    onSuccess: () => {
      refetch();
      setIsPayOpen(false);
      toast.success(
        "Pelunasan Berhasil",
        `Pembayaran pelunasan untuk nota ${selectedInvoice?.invoiceNo} berhasil disimpan.`,
      );
    },
    onError: (error) => {
      toast.error(
        "Pelunasan Gagal",
        error.message ||
          "Terjadi kesalahan saat memproses pelunasan di server.",
      );
    },
  });

  const handleProcessPayment = () => {
    if (!selectedInvoice) return;

    const payments = isSplitPayment
      ? [
          { payment_method: "cash", amount_paid: splitAmounts.cash },
          { payment_method: "transfer", amount_paid: splitAmounts.transfer },
          { payment_method: "qris", amount_paid: splitAmounts.qris },
        ].filter((p) => p.amount_paid > 0)
      : [
          {
            payment_method: payMethod.toLowerCase(),
            amount_paid: payAmount,
          },
        ];

    if (payments.length === 0) {
      toast.error(
        "Nominal pelunasan tidak valid",
        "Silakan masukkan nominal pembayaran.",
      );
      return;
    }

    const totalToPay = payments.reduce((sum, p) => sum + p.amount_paid, 0);
    if (totalToPay > outstandingAmount) {
      toast.error(
        "Nominal berlebih",
        `Jumlah pembayaran melebihi sisa tagihan (${formatCurrency(outstandingAmount)}).`,
      );
      return;
    }

    const payload: RepayPaymentInput = {
      payments,
    };

    processPaymentMutation.mutate({
      id: selectedInvoice.id,
      payload,
    });
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsReceiptOpen(true);
  };

  const handlePrintSpk = (category: string) => {
    setSelectedSpkCategory(category);
    setIsSpkPreviewOpen(true);
  };

  const handlePrintAllSpk = () => {
    toast.success(
      "Rilis Semua SPK",
      `Berhasil merilis ${spkResponse?.spk_by_category.length || 0} SPK terpisah untuk masing-masing divisi produksi.`,
    );
    setIsSpkOpen(false);
  };

  return (
    <div className="p-6 space-y-6 font-sans bg-background min-h-screen animate-in fade-in duration-500">
      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/30 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuReceipt className="text-primary animate-pulse" size={32} />
            Kelola Invoice
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Pantau pembayaran nota lunas/tempo, kelola pelunasan cicilan, dan
            cetak ulang nota kasir.
          </p>
        </div>

        {/* Action button */}
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            className="rounded-xl font-bold text-xs flex items-center gap-2 border-border/60"
            onClick={() =>
              toast.success(
                "Ekspor Data",
                "Mengekspor laporan invoice ke Excel.",
              )
            }
          >
            Ekspor Laporan
          </Button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat Total Sales (Lunas + Piutang) */}
        <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
              <LuShoppingBag size={22} />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                Total Penjualan (Periode)
              </span>
              <span className="text-xl font-black text-foreground">
                {formatCurrency(stats.totalSales)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Stat Receivables */}
        <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl">
              <LuCoins size={22} />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                Total Piutang (Periode)
              </span>
              <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                {formatCurrency(stats.totalReceivable)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Stat Unpaid Total */}
        <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl">
              <LuClock size={22} />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                Invoice Belum Lunas
              </span>
              <span className="text-xl font-black text-red-600">
                {stats.unpaidCount} Transaksi
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border/40 p-4 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Quick Search */}
          <div className="w-full lg:w-96">
            <TextField
              placeholder="Cari No. Invoice, Job, atau Pelanggan..."
              prefixIcon={LuSearch}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full"
            />
          </div>

          {/* Date Range Picker & Filter Popover */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <DateRangePicker
              value={dateRange}
              onChange={(range) => {
                setDateRange(range);
                setPage(1);
              }}
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
                      {/* Status Pembayaran */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                          Status Pembayaran
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => {
                            setStatusFilter(
                              e.target.value as "ALL" | "PAID" | "UNPAID",
                            );
                            setPage(1);
                          }}
                          className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="ALL">Semua Status</option>
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
                            setCustomerTypeFilter(
                              e.target.value as "ALL" | "RESELLER" | "RETAIL",
                            );
                            setPage(1);
                          }}
                          className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="ALL">Semua Tipe</option>
                          <option value="RETAIL">Retail</option>
                          <option value="RESELLER">Biro / Reseller</option>
                        </select>
                      </div>

                      {/* Status Pesanan */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                          Status Pesanan
                        </label>
                        <select
                          value={orderStatusFilter}
                          onChange={(e) => {
                            setOrderStatusFilter(
                              e.target.value as "ALL" | "SUCCESS" | "CANCELLED",
                            );
                            setPage(1);
                          }}
                          className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="ALL">Semua Pesanan</option>
                          <option value="SUCCESS">Selesai</option>
                          <option value="CANCELLED">Dibatalkan</option>
                        </select>
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
                            const isChecked = paymentMethodsFilter.includes(
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
                                    setPaymentMethodsFilter((prev) =>
                                      checked
                                        ? [...prev, method.id]
                                        : prev.filter((p) => p !== method.id),
                                    );
                                    setPage(1);
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
                            setStatusFilter("ALL");
                            setCustomerTypeFilter("ALL");
                            setOrderStatusFilter("SUCCESS");
                            setPaymentMethodsFilter([]);
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
      </div>

      {/* Main Table / Grid */}
      <Card className="border border-border/40 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="py-4 px-5 min-w-[120px] text-center">Tanggal</th>
                <th className="py-4 px-5 min-w-[160px]">No. Nota</th>
                <th className="py-4 px-5 min-w-[180px]">Pelanggan</th>
                <th className="py-4 px-5 text-right">Total Tagihan</th>
                <th className="py-4 px-5 text-right">Telah Dibayar</th>
                <th className="py-4 px-5 text-right">Sisa Piutang</th>
                <th className="py-4 px-5 text-center">Metode</th>
                <th className="py-4 px-5 text-center min-w-[160px]">
                  Status Pembayaran
                </th>
                <th className="py-4 px-5 text-center min-w-[140px]">
                  Status Pesanan
                </th>
                <th className="py-4 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs font-semibold text-foreground">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center space-y-3">
                    <div className="relative w-8 h-8 mx-auto">
                      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground block">
                      Memuat Data Invoice...
                    </span>
                  </td>
                </tr>
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const outstanding = inv.totalAmount - inv.amountPaid;

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-muted/20 transition-colors duration-150"
                    >
                      {/* Date */}
                      <td className="py-4 px-5 text-center">
                        <div className="text-muted-foreground">
                          {inv.createdAt}
                        </div>
                      </td>

                      {/* Invoice & Job No */}
                      <td className="py-4 px-5 space-y-1">
                        <div className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded-lg border border-border/50 inline-block">
                          {inv.invoiceNo}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-semibold block">
                          No. Tiket : {inv.jobNumber}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-5 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <LuUser size={13} className="text-primary/70" />
                          {inv.customerName}
                        </div>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border leading-none ${
                            inv.isReseller
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50"
                              : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/50"
                          }`}
                        >
                          {inv.isReseller ? "Biro / Reseller" : "Retail"}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-5 text-right font-black text-foreground">
                        {formatCurrency(inv.totalAmount)}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-4 px-5 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(inv.amountPaid)}
                      </td>

                      {/* Sisa Piutang */}
                      <td className="py-4 px-5 text-right font-black">
                        {outstanding > 0 ? (
                          <span className="text-rose-500">
                            {formatCurrency(outstanding)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            -
                          </span>
                        )}
                      </td>

                      {/* Metode Pembayaran */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {inv.paymentMethods.length > 0 ? (
                            inv.paymentMethods.map((method) => {
                              let badgeColor =
                                "bg-muted text-muted-foreground border-border/50";
                              const normalized = method.toLowerCase();
                              if (normalized === "qris") {
                                badgeColor =
                                  "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/50";
                              } else if (
                                normalized === "cash" ||
                                normalized === "tunai"
                              ) {
                                badgeColor =
                                  "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50";
                              } else if (
                                normalized === "transfer" ||
                                normalized === "bank"
                              ) {
                                badgeColor =
                                  "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50";
                              }
                              return (
                                <span
                                  key={method}
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border leading-none ${badgeColor}`}
                                >
                                  {method}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-muted-foreground text-[10px]">
                              -
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-4 px-5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none ${
                            inv.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                          }`}
                        >
                          {inv.status === "PAID" ? "Lunas" : "Belum Lunas"}
                        </span>
                      </td>

                      {/* Order Status Badge */}
                      <td className="py-4 px-5 text-center">
                        {inv.orderStatus === "CANCELLED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50">
                            <LuCircleX className="h-3 w-3" />
                            Dibatalkan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
                            <LuCircleCheck className="h-3 w-3" />
                            Selesai
                          </span>
                        )}
                      </td>

                      {/* Dropdown Popover Actions */}
                      <td className="py-4 px-5 text-center">
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
                                  setSelectedInvoice(inv);
                                  setIsDetailOpen(true);
                                }}
                              >
                                <LuReceipt className="h-3.5 w-3.5 text-primary" />
                                <span>Detail Rincian</span>
                              </DropdownItem>
                              <DropdownItem
                                onClick={() => handlePrintInvoice(inv)}
                              >
                                <LuPrinter className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Cetak Ulang Struk</span>
                              </DropdownItem>
                              <DropdownItem
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setIsSpkOpen(true);
                                }}
                              >
                                <LuScissors className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                <span>Cetak SPK (Kerja)</span>
                              </DropdownItem>
                              {inv.status !== "PAID" && (
                                <DropdownItem
                                  onClick={() => handleOpenPay(inv)}
                                >
                                  <LuCoins className="h-3.5 w-3.5 text-emerald-600" />
                                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                    Bayar Pelunasan
                                  </span>
                                </DropdownItem>
                              )}
                              {inv.amountPaid > 0 && (
                                <DropdownItem
                                  onClick={() => {
                                    setSelectedInvoice(inv);
                                    setIsRefundOpen(true);
                                  }}
                                >
                                  <LuRotateCcw className="h-3.5 w-3.5 text-rose-600" />
                                  <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                    Ajukan Refund
                                  </span>
                                </DropdownItem>
                              )}
                            </DropdownContent>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 px-5 text-center space-y-3">
                    <LuInfo
                      size={36}
                      className="text-muted-foreground/60 mx-auto"
                    />
                    <h3 className="font-bold text-foreground text-sm">
                      Tidak Ada Data Invoice
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Tidak ada invoice yang cocok dengan kriteria filter
                      pencarian atau status saat ini.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Server Pagination UI */}
        <TablePagination
          currentPage={page}
          totalPages={Math.ceil((response?.total ?? 0) / pageSize)}
          pageSize={pageSize}
          totalEntries={response?.total ?? 0}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setPage(1);
          }}
        />
      </Card>

      <Dialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        {selectedInvoice && (
          <div className="space-y-5 flex flex-col overflow-hidden h-[75vh] max-h-[75vh]">
            {/* Dialog Header */}
            <div className="flex flex-col gap-1 border-b border-border/30 pb-4 shrink-0">
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <LuReceipt size={20} className="text-primary" />
                Detail Rincian Belanja Nota
              </h2>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-5 scrollbar-thin">
              {/* Header info */}
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3.5 rounded-xl border border-border/40">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Nomor Invoice
                  </span>
                  <span className="font-mono font-black text-foreground text-xs block">
                    {selectedInvoice.invoiceNo}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Pelanggan
                  </span>
                  <span className="font-bold text-foreground text-xs block">
                    {selectedInvoice.customerName}
                  </span>
                </div>
              </div>

              {/* Item list */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  Daftar Item Cetak
                </span>
                <div className="border border-border/40 rounded-xl overflow-hidden divide-y divide-border/20">
                  {selectedInvoice.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 bg-card flex justify-between gap-4 text-xs font-semibold"
                    >
                      <div>
                        <span className="text-foreground block">
                          {idx + 1}. {item.productName}
                        </span>
                        {item.notes && (
                          <span className="text-[10px] text-muted-foreground block font-medium mt-0.5">
                            Finishing: {item.notes}
                          </span>
                        )}
                        <span className="text-[10px] text-primary font-bold block mt-1">
                          {formatCurrency(item.pricePerUnit)} x {item.qty} Qty
                        </span>
                      </div>
                      <span className="font-black text-foreground shrink-0 self-center">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Riwayat Pembayaran (Dynamic Timeline UI) */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  Riwayat Pembayaran
                </span>
                <div className="bg-muted/15 border border-border/40 rounded-2xl p-4 max-h-[180px] overflow-y-auto scrollbar-thin">
                  {isLoadingPayments ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                      <div className="relative w-6 h-6">
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground">
                        Memuat Riwayat Pembayaran...
                      </span>
                    </div>
                  ) : payments && payments.length > 0 ? (
                    <div className="relative border-l border-border pl-4 space-y-4">
                      {groupedPayments.map((pay, idx) => (
                        <div
                          key={pay.id}
                          className="relative flex flex-col gap-2"
                        >
                          {/* Circle Indicator */}
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/40" />
                          <div className="flex justify-between items-start gap-4 text-xs font-semibold">
                            <div>
                              <span className="text-foreground font-black block">
                                {pay.payment_type === "DOWN_PAYMENT"
                                  ? "Pembayaran Awal (DP)"
                                  : pay.payment_type === "FULL_PAYMENT"
                                    ? "Lunas / Pembayaran Langsung"
                                    : `Pelunasan #${pay.payment_number > 1 ? pay.payment_number - 1 : idx}`}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
                                {pay.created_at} • Kasir: {pay.cashier_name}
                              </span>
                            </div>
                            <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                              {formatCurrency(pay.totalAmount)}
                            </span>
                          </div>

                          {/* Detail Rincian Metode Pembayaran */}
                          <div className="ml-0 mt-1 pl-3 border-l-2 border-border/40 space-y-1.5">
                            {pay.details.map((detail) => (
                              <div
                                key={detail.id}
                                className="flex justify-between items-center text-[10px] font-semibold"
                              >
                                <span className="text-muted-foreground uppercase tracking-wider">
                                  {detail.payment_method}
                                </span>
                                <span className="text-foreground">
                                  {formatCurrency(detail.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* If outstanding balance exists, show warning dot/installment step */}
                      {selectedInvoice.totalAmount -
                        selectedInvoice.amountPaid >
                        0 && (
                        <div className="relative">
                          {/* Orange Indicator for unpaid remaining */}
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950/40 animate-pulse" />
                          <div className="flex justify-between items-start gap-4 text-xs font-semibold">
                            <div>
                              <span className="text-amber-600 dark:text-amber-400 font-black block">
                                Sisa Tagihan Belum Lunas (Piutang)
                              </span>
                              <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
                                Menunggu pelunasan
                              </span>
                            </div>
                            <span className="font-black text-rose-500 shrink-0">
                              {formatCurrency(
                                selectedInvoice.totalAmount -
                                  selectedInvoice.amountPaid,
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-1">
                      <span className="text-xs font-bold text-muted-foreground block">
                        Belum ada riwayat pembayaran
                      </span>
                      <span className="text-[10px] text-muted-foreground block font-medium">
                        Transaksi ini berstatus piutang tanpa pembayaran awal.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtotals & Payment summary */}
              <div className="border-t border-border/20 pt-4 space-y-2 text-xs font-semibold">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Total Belanja</span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(selectedInvoice.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                  <span>Jumlah Telah Terbayar</span>
                  <span className="font-black">
                    {formatCurrency(selectedInvoice.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-dashed border-border/30 pt-2 font-black">
                  <span className="text-primary uppercase tracking-wider text-[10px]">
                    Sisa Tagihan
                  </span>
                  <span className="text-sm text-rose-500">
                    {formatCurrency(
                      selectedInvoice.totalAmount - selectedInvoice.amountPaid,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2.5 border-t border-border/20 pt-4 shrink-0">
              <Button
                variant="outline"
                className="rounded-xl text-xs font-bold px-4 border-border/50"
                onClick={() => setIsDetailOpen(false)}
              >
                Tutup
              </Button>
              <Button
                className="rounded-xl text-xs font-black px-4 bg-primary text-primary-foreground flex items-center gap-1.5"
                onClick={() => {
                  setIsDetailOpen(false);
                  handlePrintInvoice(selectedInvoice);
                }}
              >
                <LuPrinter size={13} />
                Cetak Struk
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* DIALOG 2: Quick Collect Payment Dialog */}
      <Dialog
        isOpen={isPayOpen}
        onClose={() => setIsPayOpen(false)}
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        {selectedInvoice && (
          <div className="space-y-5 flex flex-col overflow-hidden">
            {/* Dialog Header */}
            <div className="flex flex-col gap-1 border-b border-border/30 pb-4">
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <LuCoins size={20} className="text-primary" />
                Input Pelunasan Tagihan / Piutang
              </h2>
            </div>

            {/* Short info */}
            <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/15 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-muted-foreground">
                  Nomor Nota
                </span>
                <span className="font-mono font-black text-xs text-foreground">
                  {selectedInvoice.invoiceNo}
                </span>
              </div>
              <div className="flex justify-between items-center font-bold text-xs">
                <span className="text-muted-foreground">Pelanggan:</span>
                <span className="text-foreground">
                  {selectedInvoice.customerName}
                </span>
              </div>
              <div className="flex justify-between items-center font-black text-xs pt-1.5 border-t border-primary/10">
                <span className="text-rose-600 dark:text-rose-400">
                  Sisa Tagihan (Piutang):
                </span>
                <span className="text-rose-600 dark:text-rose-400">
                  {formatCurrency(
                    selectedInvoice.totalAmount - selectedInvoice.amountPaid,
                  )}
                </span>
              </div>
            </div>

            {/* Toggle Split Payment */}
            <div className="flex items-center justify-between bg-muted/20 border border-border/50 p-3.5 rounded-2xl shadow-sm animate-in fade-in duration-200">
              <div className="flex flex-col">
                <span className="text-xs font-black text-foreground">
                  Split Pembayaran
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  Bayar menggunakan beberapa metode sekaligus
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSplitPayment(!isSplitPayment);
                  setPayAmount(
                    selectedInvoice.totalAmount - selectedInvoice.amountPaid,
                  );
                  setSplitAmounts({ cash: 0, transfer: 0, qris: 0 });
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isSplitPayment ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isSplitPayment ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {!isSplitPayment ? (
              <>
                {/* Input field */}
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                    Jumlah Pembayaran (Pelunasan)
                  </span>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="1"
                      max={
                        selectedInvoice.totalAmount - selectedInvoice.amountPaid
                      }
                      value={payAmount || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        const outstanding =
                          selectedInvoice.totalAmount -
                          selectedInvoice.amountPaid;
                        setPayAmount(Math.min(val, outstanding));
                      }}
                      placeholder="Masukkan nominal bayar..."
                      className="w-full h-11 pl-9 pr-3 text-sm font-mono font-bold bg-muted/30 border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    />
                  </div>
                  <div className="flex justify-end gap-1 px-1">
                    <button
                      type="button"
                      onClick={() =>
                        setPayAmount(
                          selectedInvoice.totalAmount -
                            selectedInvoice.amountPaid,
                        )
                      }
                      className="text-[10px] font-black text-primary hover:underline"
                    >
                      Bayar Lunas Semua
                    </button>
                  </div>
                </div>

                {/* Payment Method chips */}
                <div className="space-y-2 animate-in fade-in duration-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                    Metode Pembayaran
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {["CASH", "TRANSFER", "QRIS"].map((method) => {
                      const isSelected = payMethod === method;
                      return (
                        <Button
                          key={method}
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => setPayMethod(method)}
                          className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "hover:bg-muted text-muted-foreground border-border/60"
                          }`}
                        >
                          {method === "CASH" ? (
                            <LuDollarSign size={13} />
                          ) : method === "TRANSFER" ? (
                            <LuCreditCard size={13} />
                          ) : (
                            <LuQrCode size={13} />
                          )}
                          {method}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Split Payment Mode inputs */}
                <div className="space-y-3.5 max-h-[35vh] overflow-y-auto pr-1 scrollbar-thin animate-in fade-in duration-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                    Nominal Pembayaran Terbagi
                  </span>

                  {/* Cash Input */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <LuDollarSign size={13} className="text-primary/70" />
                        Tunai (Cash)
                      </span>
                      {outstandingAmount -
                        (splitAmounts.transfer + splitAmounts.qris) >
                        0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const sisa = Math.max(
                              0,
                              outstandingAmount -
                                (splitAmounts.transfer + splitAmounts.qris),
                            );
                            setSplitAmounts((prev) => ({
                              ...prev,
                              cash: sisa,
                            }));
                          }}
                          className="text-[9px] font-black text-primary hover:underline"
                        >
                          Gunakan Sisa (
                          {formatCurrency(
                            Math.max(
                              0,
                              outstandingAmount -
                                (splitAmounts.transfer + splitAmounts.qris),
                            ),
                          )}
                          )
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                        Rp
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={splitAmounts.cash || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSplitAmounts((prev) => ({ ...prev, cash: val }));
                        }}
                        placeholder="0"
                        className="w-full h-11 pl-9 pr-3 text-sm font-mono font-bold bg-muted/30 border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                      />
                    </div>
                  </div>

                  {/* Transfer Input */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <LuCreditCard size={13} className="text-primary/70" />
                        Transfer Bank
                      </span>
                      {outstandingAmount -
                        (splitAmounts.cash + splitAmounts.qris) >
                        0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const sisa = Math.max(
                              0,
                              outstandingAmount -
                                (splitAmounts.cash + splitAmounts.qris),
                            );
                            setSplitAmounts((prev) => ({
                              ...prev,
                              transfer: sisa,
                            }));
                          }}
                          className="text-[9px] font-black text-primary hover:underline"
                        >
                          Gunakan Sisa (
                          {formatCurrency(
                            Math.max(
                              0,
                              outstandingAmount -
                                (splitAmounts.cash + splitAmounts.qris),
                            ),
                          )}
                          )
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                        Rp
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={splitAmounts.transfer || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSplitAmounts((prev) => ({
                            ...prev,
                            transfer: val,
                          }));
                        }}
                        placeholder="0"
                        className="w-full h-11 pl-9 pr-3 text-sm font-mono font-bold bg-muted/30 border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                      />
                    </div>
                  </div>

                  {/* QRIS Input */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <LuQrCode size={13} className="text-primary/70" />
                        QRIS
                      </span>
                      {outstandingAmount -
                        (splitAmounts.cash + splitAmounts.transfer) >
                        0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const sisa = Math.max(
                              0,
                              outstandingAmount -
                                (splitAmounts.cash + splitAmounts.transfer),
                            );
                            setSplitAmounts((prev) => ({
                              ...prev,
                              qris: sisa,
                            }));
                          }}
                          className="text-[9px] font-black text-primary hover:underline"
                        >
                          Gunakan Sisa (
                          {formatCurrency(
                            Math.max(
                              0,
                              outstandingAmount -
                                (splitAmounts.cash + splitAmounts.transfer),
                            ),
                          )}
                          )
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                        Rp
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={splitAmounts.qris || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSplitAmounts((prev) => ({ ...prev, qris: val }));
                        }}
                        placeholder="0"
                        className="w-full h-11 pl-9 pr-3 text-sm font-mono font-bold bg-muted/30 border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                      />
                    </div>
                  </div>

                  {/* Split Summary */}
                  <div className="bg-primary/[0.02] border border-border/40 p-3.5 rounded-2xl text-[11px] font-semibold space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Sisa Piutang:
                      </span>
                      <span className="text-foreground font-bold">
                        {formatCurrency(outstandingAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Diinput:
                      </span>
                      <span className="text-foreground font-bold">
                        {formatCurrency(totalSplitInput)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Sisa Belum Terbayar:
                      </span>
                      <span
                        className={`font-black ${
                          remainingOutstanding > 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {remainingOutstanding > 0
                          ? formatCurrency(remainingOutstanding)
                          : "PAS / LUNAS"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Actions button */}
            <div className="flex justify-end gap-2.5 border-t border-border/20 pt-4">
              <Button
                variant="outline"
                className="rounded-xl text-xs font-bold px-4 border-border/50"
                onClick={() => setIsPayOpen(false)}
                disabled={processPaymentMutation.isPending}
              >
                Batal
              </Button>
              <Button
                className="rounded-xl text-xs font-black px-5 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md disabled:opacity-50"
                onClick={handleProcessPayment}
                disabled={
                  processPaymentMutation.isPending ||
                  (isSplitPayment
                    ? totalSplitInput <= 0 ||
                      totalSplitInput > outstandingAmount
                    : payAmount <= 0 || payAmount > outstandingAmount)
                }
              >
                {processPaymentMutation.isPending ? (
                  <>
                    <div className="h-3 w-3 rounded-full border border-white border-t-transparent animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LuCheck size={14} />
                    Bayar Pelunasan
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* DIALOG 3: Category-Grouped SPK (Surat Perintah Kerja) Release Dialog */}
      <Dialog
        isOpen={isSpkOpen}
        onClose={() => setIsSpkOpen(false)}
        size="lg"
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        {selectedInvoice && (
          <div className="space-y-5 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-col gap-1 border-b border-border/30 pb-4 pr-10">
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <LuScissors className="text-primary animate-pulse" size={22} />
                Rilis Surat Perintah Kerja (SPK)
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Sistem mengelompokkan item cetakan secara otomatis berdasarkan
                divisi mesin untuk didistribusikan ke workshop.
              </p>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-3.5 rounded-2xl border border-border/20 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">
                  No. Nota
                </span>
                <span className="font-mono font-black text-foreground">
                  {selectedInvoice.invoiceNo}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">
                  Pelanggan
                </span>
                <span className="font-black text-foreground">
                  {selectedInvoice.customerName}
                </span>
              </div>
            </div>

            {/* Category Groups Container */}
            <div className="overflow-y-auto space-y-3 pr-1.5 flex-1 max-h-[45vh] scrollbar-thin">
              {isLoadingSpk ? (
                <div className="py-12 text-center space-y-3">
                  <div className="relative w-8 h-8 mx-auto">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground block">
                    Mengambil data divisi SPK...
                  </span>
                </div>
              ) : spkResponse && spkResponse.spk_by_category.length > 0 ? (
                spkResponse.spk_by_category.map((category) => (
                  <div
                    key={category.category_id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-card hover:bg-muted/30 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <LuScissors size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-foreground block">
                          {category.category_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold block mt-0.5">
                          {category.items.length || 0} item cetakan terdeteksi
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handlePrintSpk(category.category_name)}
                      className="h-9 px-4 rounded-xl text-xs font-black bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-0 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <LuPrinter size={13} />
                      Cetak SPK
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                  <LuInfo size={28} className="text-muted-foreground/60" />
                  <span className="text-xs font-bold text-muted-foreground">
                    Tidak ada item cetakan terdeteksi.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* DIALOG 4: SPK Print Preview Dialog */}
      <Dialog
        isOpen={isSpkPreviewOpen}
        onClose={() => setIsSpkPreviewOpen(false)}
        size="md"
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        {selectedInvoice && selectedSpkCategory && (
          <div className="space-y-5 flex flex-col overflow-hidden">
            {/* Header info */}
            <div className="flex flex-col gap-1 border-b border-border/30 pb-4 pr-10">
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <LuPrinter size={20} className="text-primary animate-pulse" />
                Preview SPK Kerja ({selectedSpkCategory})
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Simulasi hasil cetakan Surat Perintah Kerja (SPK) divisi
                workshop produksi.
              </p>
            </div>

            {/* Simulated Printed Paper Container */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 overflow-y-auto max-h-[50vh] shadow-inner">
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
                <span className="font-black text-sm block tracking-widest">
                  SURAT PERINTAH KERJA (SPK)
                </span>
                <span className="font-bold text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full inline-block mt-1">
                  DIVISI: {selectedSpkCategory.toUpperCase()}
                </span>
              </div>

              {/* Meta information */}
              <div className="py-3 space-y-1 border-b border-dashed border-slate-300 dark:border-slate-700">
                <div className="flex justify-between">
                  <span>No. Nota:</span>
                  <span className="font-bold">{selectedInvoice.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>No. Tiket / Job:</span>
                  <span>{selectedInvoice.jobNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="font-bold uppercase">
                    {selectedInvoice.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{selectedInvoice.createdAt}</span>
                </div>
              </div>

              {/* Items in this category */}
              <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                <span className="font-bold block text-[10px] text-muted-foreground uppercase tracking-wider">
                  Daftar Item Produksi:
                </span>
                {activeSpkCategoryItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="space-y-1 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900"
                  >
                    <div className="flex justify-between font-bold text-foreground">
                      <span>
                        {idx + 1}.{" "}
                        {item.variant_name
                          ? `${item.product_name} (${item.variant_name})`
                          : item.product_name}
                      </span>
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px]">
                        {item.quantity} Qty
                      </span>
                    </div>
                    {(item.uom === "m2" || item.uom === "m_lari") &&
                      item.length_cm &&
                      item.width_cm && (
                        <div className="text-[10px] text-primary font-black mt-0.5">
                          Ukuran: {item.length_cm} x {item.width_cm} cm (
                          {item.uom})
                        </div>
                      )}
                    {item.production_notes &&
                      item.production_notes !== "-" &&
                      item.production_notes !== "" && (
                        <div className="text-[10px] text-rose-500 font-bold border-l-2 border-rose-500 pl-2 mt-1">
                          Catatan: {item.production_notes}
                        </div>
                      )}
                  </div>
                ))}
              </div>

              <div className="text-center pt-5 text-[10px] text-muted-foreground space-y-0.5 font-bold">
                <span className="block">
                  --- HARAP DIKERJAKAN SESUAI SPESIFIKASI ---
                </span>
                <span className="block text-[9px] font-medium">
                  Sistem ERP Digital Printing
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4 mt-2">
              <Button
                variant="outline"
                onClick={() => setIsSpkPreviewOpen(false)}
                className="h-10 px-5 rounded-xl font-bold border-border/60 hover:bg-muted/50"
              >
                Tutup
              </Button>
              <Button
                onClick={() => {
                  toast.success(
                    "Mencetak SPK...",
                    `SPK Divisi ${selectedSpkCategory} berhasil dikirim ke printer workshop produksi.`,
                  );
                  setIsSpkPreviewOpen(false);
                }}
                className="h-10 px-6 rounded-xl font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 flex items-center gap-2 transition-all active:scale-95"
              >
                <LuPrinter size={16} />
                Cetak SPK
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* DIALOG 5: Simulated Thermal Receipt Dialog */}
      <Dialog
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        size="md"
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        {selectedInvoice && (
          <div className="space-y-5 flex flex-col overflow-hidden">
            {/* Header info */}
            <div className="flex flex-col gap-1 border-b border-border/30 pb-4 pr-10">
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <LuPrinter size={20} className="text-primary" />
                Preview Struk Kasir
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Simulasi hasil cetakan thermal struk digital printing 58mm.
              </p>
            </div>

            {/* Simulated Receipt Paper container */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 overflow-y-auto max-h-[50vh] shadow-inner">
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
                <span className="font-bold text-sm block">
                  DIGITAL PRINTING ERP
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  Jl. Percetakan Keren No. 88, Jakarta
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  Telp: 021-555-9081
                </span>
              </div>

              {/* Receipt metadata */}
              <div className="py-3 space-y-1 border-b border-dashed border-slate-300 dark:border-slate-700">
                <div className="flex justify-between">
                  <span>No. Nota:</span>
                  <span className="font-bold">{selectedInvoice.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>No. Tiket / Job:</span>
                  <span className="font-bold">{selectedInvoice.jobNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{selectedInvoice.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold uppercase">
                    {selectedInvoice.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>Sistem Kasir Utama</span>
                </div>
              </div>

              {/* Items listing */}
              <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-2.5">
                {selectedInvoice.items.map((item) => (
                  <div key={item.id} className="space-y-0.5">
                    <span className="font-bold block text-foreground">
                      {item.productName}
                    </span>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>
                        {item.qty} x {formatCurrency(item.pricePerUnit)}
                        {item.notes && item.notes !== "-" && ` (${item.notes})`}
                      </span>
                      <span className="font-bold text-foreground">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grand summary */}
              <div className="py-3 space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    {formatCurrency(
                      selectedInvoice.items.reduce((s, i) => s + i.subtotal, 0),
                    )}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-xs border-t border-dotted border-slate-300 dark:border-slate-700 pt-2 text-foreground">
                  <span>TOTAL BELANJA:</span>
                  <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Jumlah Bayar:</span>
                  <span>{formatCurrency(selectedInvoice.amountPaid)}</span>
                </div>

                {selectedInvoice.totalAmount - selectedInvoice.amountPaid >
                  0 && (
                  <div className="flex justify-between font-bold text-rose-600 dark:text-rose-400">
                    <span>SISA TAGIHAN (UTANG):</span>
                    <span>
                      {formatCurrency(
                        selectedInvoice.totalAmount -
                          selectedInvoice.amountPaid,
                      )}
                    </span>
                  </div>
                )}

                {selectedInvoice.totalAmount - selectedInvoice.amountPaid ===
                  0 && (
                  <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Status:</span>
                    <span>LUNAS</span>
                  </div>
                )}
              </div>

              <div className="text-center pt-5 border-t border-dashed border-slate-300 dark:border-slate-700 text-[10px] text-muted-foreground space-y-0.5">
                <span className="block font-bold">--- TERIMA KASIH ---</span>
                <span className="block">
                  Barang yang sudah dibeli tidak dapat ditukar
                </span>
                <span className="block">atau dikembalikan. Sukses Selalu!</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4 mt-2">
              <Button
                variant="outline"
                onClick={() => setIsReceiptOpen(false)}
                className="h-10 px-5 rounded-xl font-bold border-border/60 hover:bg-muted/50"
              >
                Tutup Preview
              </Button>
              <Button
                onClick={() => {
                  toast.success(
                    "Mencetak Struk...",
                    "Dokumen struk dikirim ke mesin thermal printer.",
                  );
                  setIsReceiptOpen(false);
                }}
                className="h-10 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 flex items-center gap-2 transition-all active:scale-95"
              >
                <LuPrinter size={16} />
                Cetak ke Thermal Printer
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        isOpen={isRefundOpen}
        onClose={() => setIsRefundOpen(false)}
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground max-w-md w-full"
        showCloseButton={true}
      >
        <div className="space-y-4">
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <LuRotateCcw className="text-rose-500" size={20} />
            Konfirmasi Refund
          </h2>
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin mengajukan refund untuk nota{" "}
            <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
              {selectedInvoice?.invoiceNo}
            </span>{" "}
            sebesar{" "}
            <span className="font-bold text-rose-500">
              {selectedInvoice
                ? formatCurrency(selectedInvoice.amountPaid)
                : ""}
            </span>
            ?
          </p>
          <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-xl border border-destructive/20 font-medium">
            <strong>Peringatan:</strong> Proses refund ini akan mempengaruhi
            cash flow dan dicatat sebagai pengeluaran.
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
            <Button
              variant="outline"
              onClick={() => setIsRefundOpen(false)}
              className="rounded-xl font-bold"
            >
              Batal
            </Button>
            <Button
              onClick={() => {
                toast.success(
                  "Refund Diajukan",
                  `Permintaan refund untuk nota ${selectedInvoice?.invoiceNo} telah diajukan.`,
                );
                setIsRefundOpen(false);
              }}
              className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Ya, Refund
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default InvoicePage;
