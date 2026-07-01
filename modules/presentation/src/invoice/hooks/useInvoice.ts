import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useOrderDI } from "../../order/hooks/useOrderDI";
import { orderKeys } from "@infrastructure/order/keys";
import { useDebounce } from "../../shared/hooks/useDebounce";
import { toast } from "@erp-digital-printing/ui/Toast";
import type { DateRange } from "@erp-digital-printing/ui/DateRangePicker";
import type { AppError } from "@core/shared/errors/domain.error";
import type {
  OrderModel,
  OrderSpkModel,
  OrderPaymentModel,
} from "@core/order/domains/models/order.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import type {
  RepayPaymentInput,
  RefundOrderInput,
  OrderReportWidgetsModel,
} from "@core/order/domains/repositories/order.repository";

export interface InvoiceItem {
  id: string;
  productName: string;
  qty: number;
  pricePerUnit: number;
  subtotal: number;
  notes?: string;
  dimension?: string;
}

export interface Invoice {
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
  designerName: string;
}

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

export const useInvoice = () => {
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
    "ALL" | "RESELLER" | "END_USER"
  >("ALL");
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    "ALL" | "SUCCESS" | "REFUND"
  >("SUCCESS");
  const [paymentMethodsFilter, setPaymentMethodsFilter] = useState<string[]>(
    [],
  );

  // Temporary filter states for draft selections before clicking 'Terapkan'
  const [tempStatusFilter, setTempStatusFilter] = useState<
    "ALL" | "PAID" | "UNPAID"
  >("ALL");
  const [tempCustomerTypeFilter, setTempCustomerTypeFilter] = useState<
    "ALL" | "RESELLER" | "END_USER"
  >("ALL");
  const [tempOrderStatusFilter, setTempOrderStatusFilter] = useState<
    "ALL" | "SUCCESS" | "REFUND"
  >("SUCCESS");
  const [tempPaymentMethodsFilter, setTempPaymentMethodsFilter] = useState<
    string[]
  >([]);

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
    if (orderStatusFilter === "REFUND") {
      return "REFUND";
    }
    return "IN_PRODUCTION,READY_FOR_PICKUP,COMPLETED,REFUND";
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
  const [isPrinting, setIsPrinting] = useState(false);

  // Quick Payment form states
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>("CASH");
  const [isSplitPayment, setIsSplitPayment] = useState<boolean>(false);
  const [splitAmounts, setSplitAmounts] = useState<{
    cash: number;
    transfer: number;
    qris: number;
  }>({ cash: 0, transfer: 0, qris: 0 });

  // Refund form states
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundMethod, setRefundMethod] = useState<string>("cash");
  const [refundReason, setRefundReason] = useState<string>("");

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
    refundOrderUseCase,
    getOrderPaymentsUseCase,
    getOrderSpkUseCase,
    getOrderReportWidgetsUseCase,
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

  // Fetch Reports Widgets from backend
  const { data: widgetsData, isLoading: isLoadingWidgets } = useQuery<
    OrderReportWidgetsModel,
    AppError
  >({
    queryKey: orderKeys.reportWidgets({
      status: mappedOrderStatus,
      payment_status: mappedPaymentStatus,
      search: debouncedSearch || undefined,
      start_date: startDateStr,
      end_date: endDateStr,
      customer_type:
        customerTypeFilter !== "ALL"
          ? customerTypeFilter.toLowerCase()
          : undefined,
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
          customerTypeFilter !== "ALL"
            ? customerTypeFilter.toLowerCase()
            : undefined,
        payment_method: mappedPaymentMethods,
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
        items: (order.order_items ?? []).map((item) => {
          let dimensionText = "Pcs";
          if (item.uom === "m2" || item.uom === "m_lari") {
            dimensionText = `${item.length_cm || 0} x ${item.width_cm || 0} cm (${item.uom})`;
          } else if (item.uom === "box") {
            dimensionText = "Box";
          } else if (item.uom === "lembar") {
            dimensionText = "Lembar A3+";
          }

          return {
            id: item.id,
            productName: item.variant_name
              ? `${item.product_name} (${item.variant_name})`
              : item.product_name,
            qty: item.quantity,
            pricePerUnit: item.price_per_unit || 0,
            subtotal: item.subtotal || 0,
            notes: item.production_notes || "-",
            dimension: dimensionText,
          };
        }),
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
        designerName: order.designer_name || "CS",
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
    if (widgetsData) {
      return {
        totalSales: widgetsData.omset_penjualan || 0,
        totalReceivable: widgetsData.total_piutang || 0,
        unpaidCount: widgetsData.belum_lunas_count || 0,
      };
    }

    const unpaidCount = filteredInvoices.filter(
      (i) => i.status !== "PAID",
    ).length;
    const totalReceivable = filteredInvoices.reduce(
      (sum, i) => sum + (i.totalAmount - i.amountPaid),
      0,
    );
    const totalSales = filteredInvoices.reduce(
      (sum, i) => sum + i.totalAmount,
      0,
    );

    return {
      totalSales,
      totalReceivable,
      unpaidCount,
    };
  }, [widgetsData, filteredInvoices]);

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

  // Mutation to process refund in backend
  const processRefundMutation = useMutation<
    void,
    AppError,
    { id: string; payload: RefundOrderInput }
  >({
    mutationFn: ({ id, payload }) => refundOrderUseCase.execute(id, payload),
    onSuccess: () => {
      refetch();
      setIsRefundOpen(false);
      toast.success(
        "Refund Berhasil",
        `Pengajuan refund untuk nota ${selectedInvoice?.invoiceNo} berhasil disimpan.`,
      );
    },
    onError: (error) => {
      toast.error(
        "Refund Gagal",
        error.message || "Terjadi kesalahan saat memproses refund di server.",
      );
    },
  });

  const handleProcessRefund = () => {
    if (!selectedInvoice) return;

    if (refundAmount <= 0) {
      toast.error("Refund Gagal", "Nominal refund harus lebih dari 0.");
      return;
    }

    if (refundAmount > selectedInvoice.amountPaid) {
      toast.error(
        "Refund Gagal",
        `Nominal refund tidak boleh melebihi jumlah yang sudah dibayar (${formatCurrency(selectedInvoice.amountPaid)}).`,
      );
      return;
    }

    if (!refundReason.trim()) {
      toast.error("Refund Gagal", "Alasan refund wajib diisi.");
      return;
    }

    const payload: RefundOrderInput = {
      payment_method: refundMethod.toLowerCase(),
      amount: refundAmount,
      reason: refundReason.trim(),
    };

    processRefundMutation.mutate({
      id: selectedInvoice.id,
      payload,
    });
  };

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

  return {
    // Search & Filters
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    statusFilter,
    setStatusFilter,
    customerTypeFilter,
    setCustomerTypeFilter,
    orderStatusFilter,
    setOrderStatusFilter,
    paymentMethodsFilter,
    setPaymentMethodsFilter,
    tempStatusFilter,
    setTempStatusFilter,
    tempCustomerTypeFilter,
    setTempCustomerTypeFilter,
    tempOrderStatusFilter,
    setTempOrderStatusFilter,
    tempPaymentMethodsFilter,
    setTempPaymentMethodsFilter,
    isFilterOpen,
    setIsFilterOpen,
    activeFiltersCount,

    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,

    // Selection / Dialog flags
    selectedInvoice,
    setSelectedInvoice,
    isDetailOpen,
    setIsDetailOpen,
    isRefundOpen,
    setIsRefundOpen,
    isPayOpen,
    setIsPayOpen,
    isSpkOpen,
    setIsSpkOpen,
    selectedSpkCategory,
    setSelectedSpkCategory,
    isSpkPreviewOpen,
    setIsSpkPreviewOpen,
    isReceiptOpen,
    setIsReceiptOpen,
    isPrinting,
    setIsPrinting,

    // Payment Form state
    payAmount,
    setPayAmount,
    payMethod,
    setPayMethod,
    isSplitPayment,
    setIsSplitPayment,
    splitAmounts,
    setSplitAmounts,

    // Refund Form state
    refundAmount,
    setRefundAmount,
    refundMethod,
    setRefundMethod,
    refundReason,
    setRefundReason,

    // Computed / Query responses
    invoices,
    isLoading,
    refetch,
    spkResponse,
    isLoadingSpk,
    activeSpkCategoryItems,
    payments,
    isLoadingPayments,
    groupedPayments,
    widgetsData,
    isLoadingWidgets,
    stats,
    outstandingAmount,
    totalSplitInput,
    remainingOutstanding,
    response,

    // Actions / Handlers
    handleOpenPay,
    handleProcessPayment,
    handleProcessRefund,
    handlePrintInvoice,
    handlePrintSpk,
    processPaymentMutation,
    processRefundMutation,

    // Helpers
    formatCurrency,
    formatDateTime,
  };
};
