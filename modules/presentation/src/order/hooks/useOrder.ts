import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useOrderDI } from "./useOrderDI";
import { orderKeys } from "@infrastructure/order/keys";
import { toast } from "@erp-digital-printing/ui/Toast";
import type { AppError } from "@core/shared/errors/domain.error";
import type { OrderModel } from "@core/order/domains/models/order.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { ProcessPaymentInput } from "@core/order/domains/repositories/order.repository";

// Interface Definitions
export interface OrderItem {
  id: string;
  productName: string;
  dimension: string;
  qty: number;
  finishing: string;
  pricePerUnit: number;
  lengthCm?: number;
  widthCm?: number;
  uom?: string;
  subtotal: number;
}

export interface OrderTransaction {
  id: string;
  ticketNo: string;
  customerName: string;
  customerPhone?: string;
  resellerId?: string | null;
  status: "NEED_PAYMENT" | "LUNAS" | "BATAL" | "PARTIAL_PAID";
  createdAt: string;
  items: OrderItem[];
  paymentMethod?: string;
  discountAmount?: number;
  taxAmount?: number;
  totalPaid?: number;
  changeAmount?: number;
  grandTotal?: number;
  remainingAmount?: number;
}

export const useOrder = () => {
  const [localOverrides, setLocalOverrides] = useState<
    Record<string, Partial<OrderTransaction>>
  >({});
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDraftConfirmOpen, setIsDraftConfirmOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const { getOrdersUseCase, payOrderUseCase, updateOrderStatusUseCase } =
    useOrderDI();

  // Cashier POS only handles PENDING_PAYMENT status orders.
  const mappedStatus = "PENDING_PAYMENT";

  // Fetch real order data from backend API
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<PaginatedResponse<OrderModel>, AppError>({
    queryKey: orderKeys.list({
      page: 1,
      limit: 100, // Fetch a larger batch for the cashier queue
      status: mappedStatus,
    }),
    queryFn: () =>
      getOrdersUseCase.execute({
        page: 1,
        limit: 100,
        status: mappedStatus,
      }),
    staleTime: 5000,
    gcTime: 15_000,
    refetchOnWindowFocus: false,
  });

  // Purely computed transactions state combining remote data & local overrides (No useEffect!)
  const transactions = useMemo((): OrderTransaction[] => {
    return (response?.data ?? []).map((order): OrderTransaction => {
      const override = localOverrides[order.id];

      // Base mapped order from server
      const baseOrder: OrderTransaction = {
        id: order.id,
        ticketNo: order.job_number,
        customerName: order.customer_name || "Customer Walk In",
        customerPhone: order.customer_phone || "-",
        resellerId: order.reseller_id,
        status:
          order.status === "PENDING_PAYMENT"
            ? "NEED_PAYMENT"
            : order.status === "CANCELLED"
              ? "BATAL"
              : "LUNAS",
        createdAt: order.created_at,
        items: (order.order_items ?? []).map((item) => {
          let dimensionText = "Pcs";
          if (item.uom === "m2" || item.uom === "m_lari") {
            dimensionText = `${item.length_cm || 0} x ${item.width_cm || 0} cm (${item.uom})`;
          } else if (item.uom === "box") {
            dimensionText = "Box";
          } else if (item.uom === "lembar") {
            dimensionText = "Lembar A3+";
          }

          // Check if there is an item price override
          const itemOverride = override?.items?.find((it) => it.id === item.id);
          const pricePerUnit = itemOverride
            ? itemOverride.pricePerUnit
            : item.price_per_unit || 0;

          // Calculate subtotal: use BE value if no override, otherwise compute based on UOM
          let itemSubtotal = item.subtotal || 0;
          if (itemOverride) {
            if (item.uom === "m2") {
              const area =
                ((item.length_cm || 0) * (item.width_cm || 0)) / 10000;
              itemSubtotal = pricePerUnit * item.quantity * area;
            } else if (item.uom === "m_lari") {
              const length = (item.length_cm || 0) / 100;
              itemSubtotal = pricePerUnit * item.quantity * length;
            } else {
              itemSubtotal = pricePerUnit * item.quantity;
            }
          }

          return {
            id: item.id,
            productName: item.variant_name
              ? `${item.product_name} (${item.variant_name})`
              : item.product_name,
            dimension: dimensionText,
            qty: item.quantity,
            finishing: item.production_notes || "-",
            pricePerUnit,
            lengthCm: item.length_cm,
            widthCm: item.width_cm,
            uom: item.uom,
            subtotal: itemSubtotal,
          };
        }),
        grandTotal: order.grand_total,
        discountAmount: 0,
        taxAmount: 0,
        totalPaid: order.amount_paid,
        changeAmount: 0,
      };

      // Apply top-level status or transaction overrides if they exist locally
      if (override) {
        return {
          ...baseOrder,
          ...override,
          items: baseOrder.items, // already applied individual item overrides above
        };
      }

      return baseOrder;
    });
  }, [response, localOverrides]);

  // Payment UI states
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [isSplitPayment, setIsSplitPayment] = useState<boolean>(false);
  const [splitAmounts, setSplitAmounts] = useState<{
    cash: number;
    transfer: number;
    qris: number;
  }>({ cash: 0, transfer: 0, qris: 0 });
  const [singleAmount, setSingleAmount] = useState<number | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isTemporaryReceipt, setIsTemporaryReceipt] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] =
    useState<OrderTransaction | null>(null);

  // Active Selected Order
  const activeOrder = useMemo(() => {
    return transactions.find((t) => t.id === selectedOrderId) || null;
  }, [transactions, selectedOrderId]);

  // Calculations for checkout panel
  const subtotal = useMemo(() => {
    if (!activeOrder) return 0;
    return activeOrder.items.reduce((sum, item) => sum + item.subtotal, 0);
  }, [activeOrder]);

  const grandTotal = useMemo(() => {
    return subtotal;
  }, [subtotal]);

  const totalPaid = useMemo(() => {
    if (isSplitPayment) {
      return splitAmounts.cash + splitAmounts.transfer + splitAmounts.qris;
    }
    return singleAmount === null ? grandTotal : singleAmount;
  }, [isSplitPayment, splitAmounts, singleAmount, grandTotal]);

  const remainingAmount = useMemo(() => {
    return Math.max(0, grandTotal - totalPaid);
  }, [grandTotal, totalPaid]);

  const changeAmount = useMemo(() => {
    if (!isSplitPayment && paymentMethod === "CASH" && totalPaid > grandTotal) {
      return totalPaid - grandTotal;
    }
    return 0;
  }, [isSplitPayment, paymentMethod, totalPaid, grandTotal]);

  const isPaymentValid = useMemo(() => {
    if (grandTotal <= 0) return false;
    if (isSplitPayment) {
      const totalSplit =
        splitAmounts.cash + splitAmounts.transfer + splitAmounts.qris;
      return totalSplit > 0 && totalSplit <= grandTotal;
    }
    const currentSingleAmount = singleAmount === null ? grandTotal : singleAmount;
    if (currentSingleAmount < 0) return false;
    if (paymentMethod === "CASH" || paymentMethod === "PIUTANG") return true;
    return currentSingleAmount <= grandTotal;
  }, [grandTotal, isSplitPayment, splitAmounts, singleAmount, paymentMethod]);

  // Filtered queue items
  const filteredQueue = useMemo(() => {
    return transactions.filter((order) => {
      const matchesSearch =
        order.ticketNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [transactions, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const pending = transactions.filter(
      (t) => t.status === "NEED_PAYMENT",
    ).length;
    const lunas = transactions.filter((t) => t.status === "LUNAS");
    const totalRevenue = lunas.reduce((sum, t) => sum + (t.grandTotal || 0), 0);
    return { pending, lunasCount: lunas.length, totalRevenue };
  }, [transactions]);

  // Mutation to update order status (e.g. Send Back to Draft or Cancel Order)
  const updateStatusMutation = useMutation<
    void,
    AppError,
    { id: string; status: string }
  >({
    mutationFn: ({ id, status }) =>
      updateOrderStatusUseCase.execute(id, status),
    onSuccess: (_, variables) => {
      // Refresh the orders queue from API
      refetch();
      setSelectedOrderId(null);
      toast.success(
        "Status Diperbarui",
        `Order berhasil ${variables.status === "DRAFT" ? "dikembalikan ke Draft" : "dibatalkan"}.`,
      );
    },
    onError: (error) => {
      toast.error(
        "Gagal Memperbarui Status",
        error.message || "Terjadi kesalahan saat menghubungi server.",
      );
    },
  });

  // Mutation to process active payment in backend
  const processPaymentMutation = useMutation<
    void,
    AppError,
    { id: string; payload: ProcessPaymentInput }
  >({
    mutationFn: ({ id, payload }) => payOrderUseCase.execute(id, payload),
    onSuccess: (_, variables) => {
      // Refresh real orders queue from API
      refetch();

      const isFullyPaid = remainingAmount === 0;
      const completedOverride: Partial<OrderTransaction> = {
        status: isFullyPaid ? "LUNAS" : "PARTIAL_PAID",
        paymentMethod,
        grandTotal,
        totalPaid: totalPaid,
        remainingAmount: remainingAmount,
        changeAmount: 0,
      };

      setLocalOverrides((prev) => ({
        ...prev,
        [variables.id]: {
          ...prev[variables.id],
          ...completedOverride,
        },
      }));

      const completedOrder: OrderTransaction = {
        ...activeOrder!,
        ...completedOverride,
      };

      setLastCompletedOrder(completedOrder);
      setIsTemporaryReceipt(false);
      setIsReceiptOpen(true);
      toast.success(
        "Transaksi Berhasil",
        `Pembayaran tiket ${activeOrder?.ticketNo} berhasil diproses & disimpan ke server.`,
      );
    },
    onError: (error) => {
      toast.error(
        "Transaksi Gagal",
        error.message ||
          "Terjadi kesalahan saat memproses pembayaran di server.",
      );
    },
  });

  // Handlers
  const handleSendBackToDraft = () => {
    if (!activeOrder) return;
    updateStatusMutation.mutate({ id: activeOrder.id, status: "DRAFT" });
    setIsDraftConfirmOpen(false);
  };

  const handleCancelOrder = () => {
    if (!activeOrder) return;
    updateStatusMutation.mutate({ id: activeOrder.id, status: "CANCELLED" });
    setIsCancelConfirmOpen(false);
  };

  const handleSelectOrder = (orderId: string) => {
    // Clear override of previous order if not yet paid/DP-ed
    if (selectedOrderId && selectedOrderId !== orderId) {
      const prevOrder = transactions.find((t) => t.id === selectedOrderId);
      if (
        prevOrder &&
        prevOrder.status !== "LUNAS" &&
        prevOrder.status !== "PARTIAL_PAID"
      ) {
        setLocalOverrides((prev) => {
          const updated = { ...prev };
          delete updated[selectedOrderId];
          return updated;
        });
      }
    }

    setSelectedOrderId(orderId);
    setPaymentMethod("CASH");
    setIsSplitPayment(false);
    setSplitAmounts({ cash: 0, transfer: 0, qris: 0 });
    setSingleAmount(null);
  };

  const handleUpdateItemPrice = (
    orderId: string,
    itemId: string,
    price: number,
  ) => {
    setLocalOverrides((prev) => {
      const orderOverride = prev[orderId] || {};
      const currentItems =
        transactions.find((t) => t.id === orderId)?.items || [];
      const updatedItems = currentItems.map((item) =>
        item.id === itemId ? { ...item, pricePerUnit: price } : item,
      );
      return {
        ...prev,
        [orderId]: {
          ...orderOverride,
          items: updatedItems,
        },
      };
    });
  };

  const handleProcessPayment = () => {
    if (!activeOrder) return;

    const payments = isSplitPayment
      ? [
          { payment_method: "cash", amount_paid: splitAmounts.cash },
          { payment_method: "transfer", amount_paid: splitAmounts.transfer },
          { payment_method: "qris", amount_paid: splitAmounts.qris },
        ].filter((p) => p.amount_paid > 0)
      : [
          {
            payment_method: paymentMethod.toLowerCase(),
            amount_paid: singleAmount === null ? grandTotal : singleAmount,
          },
        ];

    const payload = {
      reseller_id: activeOrder.resellerId || null,
      customer_name: activeOrder.customerName,
      customer_phone: activeOrder.customerPhone || "",
      payments,
    };

    processPaymentMutation.mutate({
      id: activeOrder.id,
      payload,
    });
  };

  return {
    localOverrides,
    setLocalOverrides,
    selectedOrderId,
    setSelectedOrderId,
    searchQuery,
    setSearchQuery,
    isDraftConfirmOpen,
    setIsDraftConfirmOpen,
    isCancelConfirmOpen,
    setIsCancelConfirmOpen,
    paymentMethod,
    setPaymentMethod,
    isSplitPayment,
    setIsSplitPayment,
    splitAmounts,
    setSplitAmounts,
    singleAmount,
    setSingleAmount,
    isReceiptOpen,
    setIsReceiptOpen,
    isTemporaryReceipt,
    setIsTemporaryReceipt,
    lastCompletedOrder,
    setLastCompletedOrder,
    transactions,
    activeOrder,
    subtotal,
    grandTotal,
    totalPaid,
    remainingAmount,
    changeAmount,
    isPaymentValid,
    filteredQueue,
    stats,
    isLoading,
    isFetching,
    refetch,
    updateStatusMutation,
    processPaymentMutation,
    handleSendBackToDraft,
    handleCancelOrder,
    handleSelectOrder,
    handleUpdateItemPrice,
    handleProcessPayment,
  };
};
