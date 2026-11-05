import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useOrderDI } from "./useOrderDI";
import { orderKeys } from "@infrastructure/order/keys";
import { toast } from "@erp-digital-printing/ui/Toast";
import type { AppError } from "@core/shared/errors/domain.error";
import type { OrderModel } from "@core/order/domains/models/order.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { ProcessPaymentInput } from "@core/order/domains/repositories/order.repository";
import type { RetailProductItem } from "../types/retail.type";

// Interface Definitions
export interface OrderItem {
  id: string;
  productVariantId?: string;
  productName: string;
  dimension: string;
  qty: number;
  finishing: string;
  pricePerUnit: number;
  lengthM?: number;
  widthM?: number;
  uom?: string;
  subtotal: number;
  isProduction?: boolean;
  categoryName?: string;
  designFileUrl?: string;
  productionNotes?: string;
  finishingIds?: string[];
}

export interface OrderTransaction {
  id: string;
  ticketNo: string;
  customerName: string;
  customerPhone?: string;
  resellerId?: string | null;
  designerId?: string;
  designerName?: string;
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
  orderType?: "PRODUCTION" | "RETAIL";
}

export const useOrder = () => {
  const [localOverrides, setLocalOverrides] = useState<
    Record<string, Partial<OrderTransaction>>
  >({});
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"PRODUCTION" | "RETAIL">(
    "PRODUCTION",
  );

  const [isDraftConfirmOpen, setIsDraftConfirmOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const {
    getOrdersUseCase,
    payOrderUseCase,
    updateOrderStatusUseCase,
    cancelOrderUseCase,
    updateOrderUseCase,
    mergeOrderUseCase,
    createDirectOrderUseCase,
  } = useOrderDI();

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

  // Purely computed all orders combining remote data & local overrides
  const allRemoteOrders = useMemo((): OrderTransaction[] => {
    return (response?.data ?? []).map((order): OrderTransaction => {
      const override = localOverrides[order.id];

      // An order is classified as RETAIL if it has items and ALL items belong to non-production categories
      const isRetail =
        Boolean(order.order_items && order.order_items.length > 0) &&
        order.order_items.every((it) => it.category_is_production === false);

      // Base mapped order from server
      const baseOrder: OrderTransaction = {
        id: order.id,
        ticketNo: order.job_number,
        customerName: order.customer_name || "Customer Walk In",
        customerPhone: order.customer_phone || "-",
        resellerId: order.reseller_id,
        designerId: order.designer_id,
        designerName: order.designer_name || "-",
        status:
          order.status === "PENDING_PAYMENT"
            ? "NEED_PAYMENT"
            : order.status === "CANCELLED"
              ? "BATAL"
              : "LUNAS",
        createdAt: order.created_at,
        orderType: isRetail ? "RETAIL" : "PRODUCTION",
        items: (order.order_items ?? []).map((item) => {
          let dimensionText = "Pcs";
          if (item.uom === "m2") {
            dimensionText = `${item.length_m || 0} x ${item.width_m || 0} m (m²)`;
          } else if (item.uom === "m_lari") {
            dimensionText = `${item.length_m || 0} m (m_lari)`;
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
              const area = (item.length_m || 0) * (item.width_m || 0);
              itemSubtotal = pricePerUnit * item.quantity * area;
            } else if (item.uom === "m_lari") {
              const length = item.length_m || 0;
              itemSubtotal = pricePerUnit * item.quantity * length;
            } else {
              itemSubtotal = pricePerUnit * item.quantity;
            }
          }

          return {
            id: item.id,
            productVariantId: item.product_variant_id,
            productName:
              item.variant_name &&
              item.variant_name.toLowerCase() !== "default"
                ? `${item.product_name} (${item.variant_name})`
                : item.product_name,
            dimension: dimensionText,
            qty: item.quantity,
            finishing: item.production_notes || "-",
            pricePerUnit,
            lengthM: item.length_m,
            widthM: item.width_m,
            uom: item.uom,
            subtotal: itemSubtotal,
            isProduction: item.category_is_production !== false,
            categoryName: item.category_name,
            designFileUrl: item.design_file_url,
            productionNotes: item.production_notes,
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
          items: override.items ?? baseOrder.items,
        };
      }

      return baseOrder;
    });
  }, [response, localOverrides]);

  // Production queue transactions
  const productionTransactions = useMemo((): OrderTransaction[] => {
    return allRemoteOrders.filter((ord) => ord.orderType === "PRODUCTION");
  }, [allRemoteOrders]);

  // Retail queue transactions
  const retailOrders = useMemo((): OrderTransaction[] => {
    return allRemoteOrders.filter((ord) => ord.orderType === "RETAIL");
  }, [allRemoteOrders]);

  // All combined transactions (for lookups regardless of active tab)
  const allTransactions = useMemo((): OrderTransaction[] => {
    return allRemoteOrders;
  }, [allRemoteOrders]);

  // Tab-filtered transactions for list queue
  const transactions = useMemo((): OrderTransaction[] => {
    return activeTab === "PRODUCTION" ? productionTransactions : retailOrders;
  }, [activeTab, productionTransactions, retailOrders]);

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

  // Active Selected Order lookup in allTransactions
  const activeOrder = useMemo(() => {
    return allTransactions.find((t) => t.id === selectedOrderId) || null;
  }, [allTransactions, selectedOrderId]);

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
    const currentSingleAmount =
      singleAmount === null ? grandTotal : singleAmount;
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

  // Stats across production and retail
  const stats = useMemo(() => {
    const pendingProduction = productionTransactions.filter(
      (t) => t.status === "NEED_PAYMENT",
    ).length;
    const pendingRetail = retailOrders.filter(
      (t) => t.status === "NEED_PAYMENT",
    ).length;
    const lunas = allTransactions.filter((t) => t.status === "LUNAS");
    const totalRevenue = lunas.reduce(
      (sum, t) => sum + (t.grandTotal || 0),
      0,
    );
    return {
      pending: pendingProduction + pendingRetail,
      pendingProduction,
      pendingRetail,
      lunasCount: lunas.length,
      totalRevenue,
    };
  }, [productionTransactions, retailOrders, allTransactions]);

  // Mutation to update order status (e.g. Send Back to Draft or Cancel Order)
  const updateStatusMutation = useMutation<
    void,
    AppError,
    { id: string; status: string }
  >({
    mutationFn: ({ id, status }) =>
      updateOrderStatusUseCase.execute(id, status),
    onSuccess: (_, variables) => {
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

  // Mutation to update order items in backend
  const updateOrderItemsMutation = useMutation<
    void,
    AppError,
    {
      orderId: string;
      targetOrder: OrderTransaction;
      updatedItems: OrderItem[];
      successMsg?: string;
    }
  >({
    mutationFn: ({ orderId, targetOrder, updatedItems }) =>
      updateOrderUseCase.execute(orderId, {
        designer_id: targetOrder.designerId || "",
        reseller_id: targetOrder.resellerId || null,
        customer_name: targetOrder.customerName,
        customer_phone: targetOrder.customerPhone || "",
        notes: "",
        items: updatedItems.map((it) => ({
          product_variant_id: it.productVariantId || "",
          uom: it.uom || "pcs",
          quantity: it.qty,
          design_file_url: it.designFileUrl || "",
          production_notes: it.productionNotes || it.finishing || "",
          finishing_ids: it.finishingIds || [],
          length_m: it.lengthM,
          width_m: it.widthM,
          price_per_unit: it.pricePerUnit,
        })),
      }),
    onSuccess: (_, variables) => {
      refetch();
      if (variables.successMsg) {
        toast.success("Berhasil", variables.successMsg);
      }
    },
    onError: (error) => {
      toast.error(
        "Gagal Menyimpan Perubahan",
        error.message || "Terjadi kesalahan saat menyimpan perubahan order.",
      );
    },
  });

  // Mutation to merge a retail order into a production ticket in backend
  const mergeOrderMutation = useMutation<
    OrderModel,
    AppError,
    { targetOrderId: string; sourceOrderId: string }
  >({
    mutationFn: ({ targetOrderId, sourceOrderId }) =>
      mergeOrderUseCase.execute(targetOrderId, sourceOrderId),
    onSuccess: (mergedOrder) => {
      refetch();
      setActiveTab("PRODUCTION");
      setSelectedOrderId(mergedOrder.id);
      toast.success(
        "Berhasil Digabungkan",
        `Nota ritel berhasil digabungkan ke tiket ${mergedOrder.job_number}.`,
      );
    },
    onError: (error) => {
      toast.error(
        "Gagal Menggabungkan Nota",
        error.message || "Terjadi kesalahan saat menggabungkan nota ke backend.",
      );
    },
  });

  // Mutation to create a direct retail order in backend
  const createDirectOrderMutation = useMutation<
    OrderModel,
    AppError,
    {
      customerName: string;
      customerPhone: string;
      items: OrderItem[];
    }
  >({
    mutationFn: ({ customerName, customerPhone, items }) =>
      createDirectOrderUseCase.execute({
        designer_id: "",
        reseller_id: null,
        customer_name: customerName.trim() || "Customer Walk In",
        customer_phone: customerPhone.trim() || "-",
        notes: "Pesanan Ritel Kasir",
        items: items.map((it) => ({
          product_variant_id: it.productVariantId || "",
          uom: it.uom || "pcs",
          quantity: it.qty,
          design_file_url: "",
          production_notes: it.finishing || "Siap Ambil",
          finishing_ids: [],
        })),
      }),
    onSuccess: (newOrder) => {
      refetch();
      setActiveTab("RETAIL");
      setSelectedOrderId(newOrder.id);
      toast.success(
        "Nota Ritel Dibuat",
        `Transaksi ${newOrder.job_number} berhasil dibuat & siap checkout.`,
      );
    },
    onError: (error) => {
      toast.error(
        "Gagal Membuat Nota Ritel",
        error.message || "Terjadi kesalahan saat menyimpan nota ke server.",
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

  const cancelOrderMutation = useMutation<
    void,
    AppError,
    { id: string; reason: string }
  >({
    mutationFn: ({ id, reason }) => cancelOrderUseCase.execute(id, { reason }),
    onSuccess: () => {
      refetch();
      setIsCancelConfirmOpen(false);
      setCancelReason("");
      setSelectedOrderId(null);
      toast.success("Pesanan Dibatalkan", "Pesanan berhasil dibatalkan.");
    },
    onError: (error) => {
      toast.error(
        "Pembatalan Gagal",
        error.message || "Terjadi kesalahan saat membatalkan pesanan.",
      );
    },
  });

  const handleCancelOrder = () => {
    if (!activeOrder) return;
    if (!cancelReason.trim()) {
      toast.error("Validasi Gagal", "Alasan pembatalan wajib diisi.");
      return;
    }
    cancelOrderMutation.mutate({
      id: activeOrder.id,
      reason: cancelReason.trim(),
    });
  };

  const handleSelectOrder = (orderId: string) => {
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
    const targetOrder = allTransactions.find((t) => t.id === orderId);
    if (!targetOrder) return;

    setLocalOverrides((prev) => {
      const orderOverride = prev[orderId] || {};
      const currentItems = targetOrder.items;
      const updatedItems = currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              pricePerUnit: price,
              subtotal:
                item.uom === "m2"
                  ? price *
                    item.qty *
                    ((item.lengthM || 0) * (item.widthM || 0))
                  : item.uom === "m_lari"
                    ? price * item.qty * (item.lengthM || 0)
                    : price * item.qty,
            }
          : item,
      );
      const newGrandTotal = updatedItems.reduce(
        (sum, it) => sum + it.subtotal,
        0,
      );
      return {
        ...prev,
        [orderId]: {
          ...orderOverride,
          items: updatedItems,
          grandTotal: newGrandTotal,
        },
      };
    });
  };

  // Add retail (non-production) item to an active order (MERGE INTO TICKET) directly in BE
  const handleAddRetailItemToOrder = (
    orderId: string,
    product: RetailProductItem,
    qty: number,
  ) => {
    const targetOrder = allTransactions.find((t) => t.id === orderId);
    if (!targetOrder) return;

    const currentItems = targetOrder.items;
    const existingIndex = currentItems.findIndex(
      (it) => it.productVariantId === product.variantId,
    );

    let updatedItems: OrderItem[];
    const existing =
      existingIndex > -1 ? currentItems[existingIndex] : undefined;
    if (existing) {
      const newQty = existing.qty + qty;
      const newSubtotal = existing.pricePerUnit * newQty;
      updatedItems = currentItems.map((it, idx) =>
        idx === existingIndex
          ? { ...it, qty: newQty, subtotal: newSubtotal }
          : it,
      );
    } else {
      const newItem: OrderItem = {
        id: `retail-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productVariantId: product.variantId,
        productName: product.name,
        dimension: "Pcs",
        qty,
        finishing: "Siap Ambil",
        pricePerUnit: product.price,
        uom: product.uom,
        subtotal: product.price * qty,
        isProduction: false,
        categoryName: product.categoryName,
        designFileUrl: "",
        productionNotes: "Item Ritel Tambahan",
        finishingIds: [],
      };
      updatedItems = [...currentItems, newItem];
    }

    updateOrderItemsMutation.mutate({
      orderId,
      targetOrder,
      updatedItems,
      successMsg: `${product.name} (${qty}x) digabungkan ke nota ${targetOrder.ticketNo}.`,
    });
  };

  // Remove an item from the order directly in BE
  const handleRemoveItemFromOrder = (orderId: string, itemId: string) => {
    const targetOrder = allTransactions.find((t) => t.id === orderId);
    if (!targetOrder) return;

    const updatedItems = targetOrder.items.filter((it) => it.id !== itemId);
    updateOrderItemsMutation.mutate({
      orderId,
      targetOrder,
      updatedItems,
      successMsg: "Item berhasil dihapus dari daftar belanja.",
    });
  };

  // Split a retail item out of a production ticket into a NEW separate retail order in BE (PISAH NOTA)
  const handleSplitItemToNewRetailOrder = (
    sourceOrderId: string,
    itemId: string,
  ) => {
    const sourceOrder = allTransactions.find((t) => t.id === sourceOrderId);
    if (!sourceOrder) return;

    const itemToSplit = sourceOrder.items.find((it) => it.id === itemId);
    if (!itemToSplit) return;

    const remainingItems = sourceOrder.items.filter((it) => it.id !== itemId);

    // 1. Remove from source order in BE
    updateOrderItemsMutation.mutate(
      {
        orderId: sourceOrderId,
        targetOrder: sourceOrder,
        updatedItems: remainingItems,
      },
      {
        onSuccess: () => {
          // 2. Create standalone retail order in BE
          createDirectOrderMutation.mutate({
            customerName: sourceOrder.customerName || "Customer Walk In",
            customerPhone: sourceOrder.customerPhone || "-",
            items: [itemToSplit],
          });
          toast.success(
            "Nota Berhasil Dipisahkan",
            `Item "${itemToSplit.productName}" dipindahkan ke Nota Ritel Baru.`,
          );
        },
      },
    );
  };

  // Merge an entire existing retail order into a target production ticket in BE
  const handleMergeRetailOrderToProductionTicket = (
    retailOrderId: string,
    targetProductionOrderId: string,
  ) => {
    mergeOrderMutation.mutate({
      targetOrderId: targetProductionOrderId,
      sourceOrderId: retailOrderId,
    });
  };

  // Create a direct retail order from cashier in BE (Standalone Retail Order)
  const handleCreateDirectRetailOrder = (
    customerName: string,
    customerPhone: string,
    items: OrderItem[],
  ) => {
    createDirectOrderMutation.mutate({
      customerName,
      customerPhone,
      items,
    });
  };

  // Process payment for both Production and Retail orders in BE
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

    const payload: ProcessPaymentInput = {
      reseller_id: activeOrder.resellerId || null,
      customer_name: activeOrder.customerName,
      customer_phone: activeOrder.customerPhone || "",
      payments,
      items: activeOrder.items.map((it) => ({
        id: it.id,
        price_per_unit: it.pricePerUnit,
      })),
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
    activeTab,
    setActiveTab,
    retailOrders,
    isDraftConfirmOpen,
    setIsDraftConfirmOpen,
    isCancelConfirmOpen,
    setIsCancelConfirmOpen,
    cancelReason,
    setCancelReason,
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
    allTransactions,
    productionTransactions,
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
    cancelOrderMutation,
    processPaymentMutation,
    createDirectOrderMutation,
    mergeOrderMutation,
    updateOrderItemsMutation,
    handleSendBackToDraft,
    handleCancelOrder,
    handleSelectOrder,
    handleUpdateItemPrice,
    handleAddRetailItemToOrder,
    handleRemoveItemFromOrder,
    handleSplitItemToNewRetailOrder,
    handleCreateDirectRetailOrder,
    handleMergeRetailOrderToProductionTicket,
    handleProcessPayment,
  };
};
