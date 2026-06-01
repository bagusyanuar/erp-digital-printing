import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Card, CardHeader, CardContent } from "@erp-digital-printing/ui/Card";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { toast } from "@erp-digital-printing/ui/Toast";
import {
  LuSearch,
  LuFilter,
  LuUser,
  LuCalendar,
  LuShoppingBag,
  LuCreditCard,
  LuReceipt,
  LuCheck,
  LuPrinter,
  LuPercent,
  LuDollarSign,
  LuClock,
  LuInfo,
  LuSparkles,
  LuCoins,
  LuArrowRight,
} from "@erp-digital-printing/ui/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useOrderDI } from "@presentation/order/hooks/useOrderDI";
import { orderKeys } from "@infrastructure/order/keys";
import type { AppError } from "@core/shared/errors/domain.error";
import type { OrderModel } from "@core/order/domains/models/order.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { ProcessPaymentInput } from "@core/order/domains/repositories/order.repository";

// Interface Definitions
interface OrderItem {
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

interface OrderTransaction {
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

const OrderPage = () => {
  const [localOverrides, setLocalOverrides] = useState<
    Record<string, Partial<OrderTransaction>>
  >({});
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { getOrdersUseCase, payOrderUseCase } = useOrderDI();

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
  const [paymentType, setPaymentType] = useState<"FULL" | "DP">("FULL");
  const [dpAmount, setDpAmount] = useState<number>(0);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
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
    return paymentType === "FULL" ? grandTotal : dpAmount;
  }, [paymentType, grandTotal, dpAmount]);

  const remainingAmount = useMemo(() => {
    return Math.max(0, grandTotal - totalPaid);
  }, [grandTotal, totalPaid]);

  const changeAmount = 0;

  const isPaymentValid = useMemo(() => {
    if (grandTotal <= 0) return false;
    if (paymentType === "DP") {
      return dpAmount >= 0 && dpAmount <= grandTotal;
    }
    return true;
  }, [grandTotal, paymentType, dpAmount]);

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

  // Handlers
  const handleSelectOrder = (orderId: string) => {
    // Clear override of previous order if not yet paid/DP-ed
    if (selectedOrderId && selectedOrderId !== orderId) {
      const prevOrder = transactions.find((t) => t.id === selectedOrderId);
      if (prevOrder && prevOrder.status !== "LUNAS" && prevOrder.status !== "PARTIAL_PAID") {
        setLocalOverrides((prev) => {
          const updated = { ...prev };
          delete updated[selectedOrderId];
          return updated;
        });
      }
    }

    setSelectedOrderId(orderId);
    setPaymentMethod("CASH");
    setPaymentType("FULL");
    setDpAmount(0);
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

  // Mutation to process active payment in backend
  const processPaymentMutation = useMutation<void, AppError, { id: string; payload: ProcessPaymentInput }>({
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
      setIsReceiptOpen(true);
      toast.success(
        "Transaksi Berhasil",
        `Pembayaran tiket ${activeOrder?.ticketNo} berhasil diproses & disimpan ke server.`,
      );
    },
    onError: (error) => {
      toast.error(
        "Transaksi Gagal",
        error.message || "Terjadi kesalahan saat memproses pembayaran di server.",
      );
    },
  });

  const handleProcessPayment = () => {
    if (!activeOrder) return;

    const payload = {
      reseller_id: activeOrder.resellerId || null,
      customer_name: activeOrder.customerName,
      customer_phone: activeOrder.customerPhone || "",
      payment_method: paymentMethod.toLowerCase(),
      payment_type: paymentType === "FULL" ? "full" : "tempo",
      amount_paid: totalPaid,
    };

    processPaymentMutation.mutate({
      id: activeOrder.id,
      payload,
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="p-6 space-y-6 font-sans bg-background min-h-screen animate-in fade-in duration-500">
      {/* Header POS Dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/30 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuCreditCard className="text-primary animate-pulse" size={32} />
            Kasir & Pembayaran (POS)
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Proses pembayaran tiket cetak dari Desainer, kelola diskon, PPN, dan
            cetak struk kasir termal secara langsung.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 gap-3 md:w-auto w-full">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 py-3 px-6 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-xl">
              <LuClock size={18} />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                Antrean
              </span>
              <span className="text-lg font-black text-amber-800 dark:text-amber-300">
                {stats.pending} Tiket
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Cashier Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COMPONENT (7 Columns): Order Queue & Filters */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card border border-border/50 p-3.5 rounded-2xl">
            {/* Search Input */}
            <TextField
              placeholder="Cari No. Tiket atau Nama Pelanggan..."
              prefixIcon={LuSearch}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Queue Cards */}
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-270px)] pr-2 scrollbar-thin">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 bg-card border border-dashed border-border rounded-3xl text-center space-y-3">
                <div className="relative w-8 h-8 mx-auto">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
                <h3 className="font-bold text-foreground">Memuat Antrean...</h3>
              </div>
            ) : filteredQueue.length > 0 ? (
              filteredQueue.map((order) => {
                const isSelected = order.id === selectedOrderId;
                const isPaid = order.status === "LUNAS";
                const totalItemPrice = order.items.reduce(
                  (sum, item) => sum + item.subtotal,
                  0,
                );

                return (
                  <Card
                    key={order.id}
                    onClick={() => handleSelectOrder(order.id)}
                    className={`rounded-2xl cursor-pointer transition-all duration-300 border hover:shadow-md ${
                      isSelected
                        ? "border-primary bg-primary/[0.02] shadow-sm ring-2 ring-primary/10"
                        : "border-border/60 hover:border-primary/40 bg-card"
                    }`}
                  >
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs bg-muted px-2.5 py-1 rounded-lg border border-border/50 text-foreground">
                            {order.ticketNo}
                          </span>
                           <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                                : order.status === "PARTIAL_PAID"
                                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                                  : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/50"
                            }`}
                          >
                            {isPaid ? "Lunas" : order.status === "PARTIAL_PAID" ? "Panjar / DP" : "Baru (Need Payment)"}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-foreground flex-wrap">
                            <LuUser size={14} className="text-primary/70" />
                            <span>{order.customerName}</span>
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border leading-none ${
                                order.resellerId
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50"
                                  : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/50"
                              }`}
                            >
                              {order.resellerId ? "Biro / Reseller" : "Retail"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                            <LuCalendar size={14} />
                            {order.createdAt}
                          </div>
                        </div>

                        {/* List of items in short string */}
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 pl-1.5 border-l-2 border-primary/20 bg-muted/20 py-1.5 pr-2 rounded-r-lg max-w-xl">
                          <LuShoppingBag
                            size={13}
                            className="text-primary/70 shrink-0"
                          />
                          <span className="truncate font-semibold text-[11px]">
                            {order.items
                              .map((it) => `${it.productName} (${it.qty}x)`)
                              .join(", ")}
                          </span>
                        </div>
                      </div>

                      {/* Right-aligned Order Action / Amount */}
                      <div className="text-right flex flex-col items-end gap-1 shrink-0">
                        {isPaid || order.status === "PARTIAL_PAID" ? (
                          <>
                            <span className="text-xs font-semibold text-muted-foreground">
                              {isPaid ? "Total Bayar" : "Telah Dibayar (DP)"}
                            </span>
                            <span className="text-base font-black text-foreground">
                              {formatCurrency(order.totalPaid || 0)}
                            </span>
                          </>
                        ) : null}
                        <div className="flex items-center gap-1 text-[11px] font-black text-primary group mt-1">
                          {isPaid ? "Detail Nota" : "Proses Kasir"}
                          <LuArrowRight
                            size={12}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-card border border-dashed border-border rounded-3xl text-center space-y-3">
                <LuInfo size={36} className="text-muted-foreground/60" />
                <h3 className="font-bold text-foreground">Antrean Kosong</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Tidak ada transaksi kasir yang cocok dengan pencarian atau
                  filter status saat ini.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COMPONENT (5 Columns): Checkout Payment Processing Panel */}
        <div className="lg:col-span-5">
          {activeOrder ? (
            <Card className="rounded-3xl border-primary/20 shadow-lg shadow-primary/5 bg-card overflow-hidden sticky top-6">
              {/* Active Panel Header */}
              <div className="p-5 border-b border-border/30 bg-primary/[0.02]">
                <h3 className="font-black text-lg text-foreground flex items-center gap-2">
                  <LuSparkles size={18} className="text-primary" />
                  Proses Transaksi
                </h3>
                <p className="text-[11px] text-muted-foreground font-semibold">
                  {activeOrder.ticketNo}
                </p>
              </div>

              {/* Customer Info Display (Read-Only) */}
              <div className="p-5 border-b border-border/20 bg-muted/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Pelanggan (Input Desainer)
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border leading-none ${
                      activeOrder.resellerId
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50"
                        : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/50"
                    }`}
                  >
                    {activeOrder.resellerId ? "Biro / Reseller" : "Retail"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                      Nama
                    </span>
                    <span className="font-bold text-foreground text-sm flex items-center gap-1.5 leading-none">
                      <LuUser size={14} className="text-primary/70 shrink-0" />
                      {activeOrder.customerName}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                      No. Handphone
                    </span>
                    <span className="font-mono font-bold text-foreground text-xs block leading-none">
                      {activeOrder.customerPhone || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Summary list */}
              <div className="p-5 space-y-3 max-h-[220px] overflow-y-auto border-b border-border/20 scrollbar-thin">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                  Detail Item Belanja
                </span>

                {activeOrder.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between text-xs py-2 border-b border-border/10 last:border-0"
                  >
                    <div className="space-y-0.5 flex-1 pr-3">
                      <span className="font-bold text-foreground block line-clamp-1">
                        {idx + 1}. {item.productName}
                      </span>
                      <span className="text-[10px] text-muted-foreground block font-medium">
                        {item.dimension} | {item.finishing}
                      </span>
                      {activeOrder.status === "LUNAS" ? (
                        <span className="text-[10px] font-bold text-primary block">
                          {formatCurrency(item.pricePerUnit)}
                          {item.uom === "m2" &&
                            ` x ${(((item.lengthCm || 0) * (item.widthCm || 0)) / 10000).toFixed(2)} m²`}
                          {item.uom === "m_lari" &&
                            ` x ${((item.lengthCm || 0) / 100).toFixed(2)} m`}
                          {` x ${item.qty}`}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-muted-foreground font-bold">
                            Harga (Rp):
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={item.pricePerUnit || ""}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              handleUpdateItemPrice(
                                activeOrder.id,
                                item.id,
                                val,
                              );
                            }}
                            placeholder="Input Harga..."
                            className="w-24 h-7 px-1.5 py-0.5 text-xs font-mono font-bold bg-muted border border-border/80 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                          />
                          <span className="text-[10px] text-muted-foreground font-black">
                            {item.uom === "m2" &&
                              ` x ${(((item.lengthCm || 0) * (item.widthCm || 0)) / 10000).toFixed(2)} m²`}
                            {item.uom === "m_lari" &&
                              ` x ${((item.lengthCm || 0) / 100).toFixed(2)} m`}
                            {` x ${item.qty}`}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="font-black text-foreground shrink-0 self-center">
                      {item.pricePerUnit > 0
                        ? formatCurrency(item.subtotal)
                        : "-"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations & Discounts */}
              <div className="p-5 space-y-4 border-b border-border/20">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                  <span>Subtotal Belanja</span>
                  <span className="font-bold text-foreground">
                    {subtotal > 0 ? formatCurrency(subtotal) : "-"}
                  </span>
                </div>

                {/* Grand Total Display */}
                <div className="bg-primary/5 dark:bg-primary/10 p-3.5 rounded-2xl border border-primary/15 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-primary">
                    Total Tagihan
                  </span>
                  <span className="text-xl font-black text-foreground">
                    {grandTotal > 0 ? formatCurrency(grandTotal) : "-"}
                  </span>
                </div>
              </div>

              {/* Payment Processing (If not paid) */}
              <div className="p-5 bg-muted/30 space-y-4">
                {activeOrder.status === "LUNAS" || activeOrder.status === "PARTIAL_PAID" ? (
                  <div className={`border p-4 rounded-2xl flex flex-col items-center text-center gap-2 ${
                    activeOrder.status === "LUNAS" 
                      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 text-emerald-700"
                      : "bg-amber-50 dark:bg-amber-950/20 border-amber-200/50 text-amber-700"
                  }`}>
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center font-black ${
                      activeOrder.status === "LUNAS"
                        ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                    }`}>
                      {activeOrder.status === "LUNAS" ? <LuCheck size={18} /> : <LuCoins size={18} />}
                    </div>
                    <div className="space-y-1">
                      <span className={`text-xs font-black block uppercase ${
                        activeOrder.status === "LUNAS" ? "text-emerald-800 dark:text-emerald-400" : "text-amber-800 dark:text-amber-400"
                      }`}>
                        {activeOrder.status === "LUNAS" ? "Transaksi Lunas" : "Transaksi Panjar / DP"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold block">
                        Terbayar via {activeOrder.paymentMethod} sebesar{" "}
                        {formatCurrency(activeOrder.totalPaid || 0)}
                      </span>
                      {activeOrder.status === "PARTIAL_PAID" && (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-black block">
                          Sisa Tagihan: {formatCurrency(activeOrder.remainingAmount || 0)}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLastCompletedOrder(activeOrder);
                        setIsReceiptOpen(true);
                      }}
                      className={`mt-2 h-8 px-4 rounded-lg text-xs font-bold flex items-center gap-2 ${
                        activeOrder.status === "LUNAS"
                          ? "border-emerald-300 hover:bg-emerald-100/30 text-emerald-700"
                          : "border-amber-300 hover:bg-amber-100/30 text-amber-700"
                      }`}
                    >
                      <LuPrinter size={13} />
                      Cetak Ulang Struk
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Tipe Pembayaran (Premium Chips Selection) */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                        Tipe Pembayaran
                      </span>
                      <div className="flex gap-2.5">
                        {/* Chip Lunas */}
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentType("FULL");
                            setDpAmount(0);
                          }}
                          className={`flex-1 py-2.5 px-3 rounded-xl border text-[11px] font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 duration-200 ${
                            paymentType === "FULL"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 shadow-sm"
                              : "bg-card text-muted-foreground border-border/50 hover:bg-muted/50"
                          }`}
                        >
                          <LuCheck size={13} />
                          Lunas (Full)
                        </button>

                        {/* Chip DP */}
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentType("DP");
                            setDpAmount(0);
                          }}
                          className={`flex-1 py-2.5 px-3 rounded-xl border text-[11px] font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 duration-200 ${
                            paymentType === "DP"
                              ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50 shadow-sm"
                              : "bg-card text-muted-foreground border-border/50 hover:bg-muted/50"
                          }`}
                        >
                          <LuCoins size={13} />
                          Tempo / DP (Credit)
                        </button>
                      </div>
                    </div>

                    {/* DP Amount Input (Only when DP Selected) */}
                    {paymentType === "DP" && (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                          Masukkan Nominal DP (Uang Muka)
                        </span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                            Rp
                          </span>
                          <input
                            type="number"
                            min="0"
                            max={grandTotal}
                            value={dpAmount}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setDpAmount(Math.min(val, grandTotal));
                            }}
                            placeholder="Isi 0 jika tanpa DP (Full Hutang)..."
                            className="w-full h-10 pl-9 pr-3 text-xs font-mono font-bold bg-card border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground px-1">
                          <span>Sisa Tagihan:</span>
                          <span className={remainingAmount > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"}>
                            {formatCurrency(remainingAmount)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Payment Method Selector */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                        Metode Pembayaran
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {["CASH", "TRANSFER"].map((method) => {
                          const isSelected = paymentMethod === method;
                          return (
                            <Button
                              key={method}
                              variant={isSelected ? "default" : "outline"}
                              onClick={() => {
                                setPaymentMethod(method);
                              }}
                              className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                                isSelected
                                  ? "bg-primary text-primary-foreground shadow-md"
                                  : "hover:bg-muted text-muted-foreground border-border/50"
                              }`}
                            >
                              <LuCreditCard size={13} />
                              {method}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="pt-2 flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (selectedOrderId) {
                            setLocalOverrides((prev) => {
                              const updated = { ...prev };
                              delete updated[selectedOrderId];
                              return updated;
                            });
                          }
                          setSelectedOrderId(null);
                        }}
                        className="h-11 flex-1 rounded-xl font-bold border-border/60 hover:bg-muted/50"
                      >
                        Batal
                      </Button>
                       <Button
                        onClick={handleProcessPayment}
                        disabled={!isPaymentValid || processPaymentMutation.isPending}
                        className={`h-11 flex-[2] rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                          isPaymentValid && !processPaymentMutation.isPending
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25"
                            : "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                        }`}
                      >
                        <LuPrinter size={16} />
                        {processPaymentMutation.isPending ? "Memproses..." : "Bayar & Cetak Struk"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          ) : (
            /* Checkout Empty State */
            <div className="h-[450px] bg-card border border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center text-primary/70">
                <LuReceipt size={32} className="animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground text-sm">
                  Pilih Antrean Transaksi
                </h3>
                <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed mx-auto">
                  Pilih salah satu tiket order di panel kiri untuk mulai
                  memproses rincian kasir dan pembayaran.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulated Thermal Receipt Dialog */}
      <Dialog
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        size="md"
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        {lastCompletedOrder && (
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
                  <span>No. Tiket:</span>
                  <span className="font-bold">
                    {lastCompletedOrder.ticketNo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{lastCompletedOrder.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold uppercase">
                    {lastCompletedOrder.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>Sistem Kasir Utama</span>
                </div>
              </div>

              {/* Items listing */}
              <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-2.5">
                {lastCompletedOrder.items.map((item) => (
                  <div key={item.id} className="space-y-0.5">
                    <span className="font-bold block text-foreground">
                      {item.productName}
                    </span>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>
                        {item.qty} x {formatCurrency(item.pricePerUnit)} (
                        {item.dimension})
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
                      lastCompletedOrder.items.reduce(
                        (s, i) => s + i.subtotal,
                        0,
                      ),
                    )}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-xs border-t border-dotted border-slate-300 dark:border-slate-700 pt-2 text-foreground">
                  <span>TOTAL BELANJA:</span>
                  <span>
                    {formatCurrency(lastCompletedOrder.grandTotal || 0)}
                  </span>
                </div>

                <div className="flex justify-between pt-1.5">
                  <span>Metode Bayar:</span>
                  <span className="font-bold">
                    {lastCompletedOrder.paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Jumlah Bayar:</span>
                  <span>
                    {formatCurrency(lastCompletedOrder.totalPaid || 0)}
                  </span>
                </div>

                {lastCompletedOrder.status === "PARTIAL_PAID" && (
                  <div className="flex justify-between font-bold text-rose-600 dark:text-rose-400">
                    <span>SISA TAGIHAN (UTANG):</span>
                    <span>
                      {formatCurrency(lastCompletedOrder.remainingAmount || 0)}
                    </span>
                  </div>
                )}

                {lastCompletedOrder.status === "LUNAS" && (
                  <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Kembalian:</span>
                    <span>
                      {formatCurrency(lastCompletedOrder.changeAmount || 0)}
                    </span>
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
    </div>
  );
};

export default OrderPage;
