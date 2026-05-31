import React, { useState, useMemo } from "react";
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

// Interface Definitions
interface OrderItem {
  id: string;
  productName: string;
  dimension: string;
  qty: number;
  finishing: string;
  pricePerUnit: number;
}

interface OrderTransaction {
  id: string;
  ticketNo: string;
  customerName: string;
  status: "NEED_PAYMENT" | "LUNAS" | "BATAL";
  createdAt: string;
  items: OrderItem[];
  paymentMethod?: string;
  discountAmount?: number;
  taxAmount?: number;
  totalPaid?: number;
  changeAmount?: number;
  grandTotal?: number;
}

// Mock Data for Cashier Queue
const MOCK_ORDER_QUEUE: OrderTransaction[] = [
  {
    id: "ord-1",
    ticketNo: "TKT-20260531-001",
    customerName: "Budi Santoso",
    status: "NEED_PAYMENT",
    createdAt: "2026-05-31 18:30",
    items: [
      {
        id: "item-1",
        productName: "Spanduk Flexi 280gr (MMT)",
        dimension: "300 x 100 cm (m2)",
        qty: 2,
        finishing: "Mata ayam pojok-pojok",
        pricePerUnit: 0,
      },
      {
        id: "item-2",
        productName: "X-Banner Alumunium",
        dimension: "60 x 160 cm",
        qty: 1,
        finishing: "Stand & Banner",
        pricePerUnit: 0,
      },
    ],
  },
  {
    id: "ord-2",
    ticketNo: "TKT-20260531-002",
    customerName: "CV Maju Bersama (Roni)",
    status: "NEED_PAYMENT",
    createdAt: "2026-05-31 19:15",
    items: [
      {
        id: "item-3",
        productName: "Brosur A4 Art Paper 150gr",
        dimension: "Pcs",
        qty: 500,
        finishing: "Lipat 3",
        pricePerUnit: 0,
      },
      {
        id: "item-4",
        productName: "Stiker Kromo Cutting A3+",
        dimension: "Lembar A3+",
        qty: 20,
        finishing: "Kiss Cut Pola",
        pricePerUnit: 0,
      },
    ],
  },
  {
    id: "ord-3",
    ticketNo: "TKT-20260531-003",
    customerName: "Putri Amelia",
    status: "NEED_PAYMENT",
    createdAt: "2026-05-31 19:45",
    items: [
      {
        id: "item-5",
        productName: "Kartu Nama Matte Premium",
        dimension: "Box",
        qty: 3,
        finishing: "Laminasi Doff 2 sisi",
        pricePerUnit: 0,
      },
    ],
  },
  {
    id: "ord-4",
    ticketNo: "TKT-20260531-004",
    customerName: "Toko Berkah Plastik",
    status: "LUNAS",
    createdAt: "2026-05-31 17:10",
    paymentMethod: "QRIS",
    discountAmount: 5000,
    taxAmount: 15400,
    totalPaid: 150000,
    changeAmount: 0,
    grandTotal: 150000,
    items: [
      {
        id: "item-6",
        productName: "Stiker Vinyl Outdoor (Glossy)",
        dimension: "100 x 100 cm (m2)",
        qty: 2,
        finishing: "Roll cut",
        pricePerUnit: 70000,
      },
    ],
  },
];

// Mock Resellers database
const MOCK_RESELLERS = [
  { id: "r1", name: "CV Printing Perkasa", phone: "08123456789" },
  { id: "r2", name: "Toko Sinar Grafika", phone: "08567890123" },
  { id: "r3", name: "Indo Advertising", phone: "08999988877" },
  { id: "r4", name: "Percetakan Berkah", phone: "08777766655" }
];

const OrderPage = () => {
  const [transactions, setTransactions] =
    useState<OrderTransaction[]>(MOCK_ORDER_QUEUE);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "SEMUA" | "MENUNGGU" | "LUNAS"
  >("SEMUA");

  // Payment UI states
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [cashInput, setCashInput] = useState<string>("");
  const [customerLevel, setCustomerLevel] = useState<"END_USER" | "RESELLER">("END_USER");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedResellerId, setSelectedResellerId] = useState("");
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
    return activeOrder.items.reduce(
      (sum, item) => sum + item.pricePerUnit * item.qty,
      0,
    );
  }, [activeOrder]);

  const discountAmount = useMemo(() => {
    return Math.round((subtotal * discountPercent) / 100);
  }, [subtotal, discountPercent]);

  const taxAmount = useMemo(() => {
    // 11% PPN on subtotal after discount
    return Math.round((subtotal - discountAmount) * 0.11);
  }, [subtotal, discountAmount]);

  const grandTotal = useMemo(() => {
    return subtotal - discountAmount + taxAmount;
  }, [subtotal, discountAmount, taxAmount]);

  const changeAmount = useMemo(() => {
    const cashVal = parseFloat(cashInput) || 0;
    if (paymentMethod !== "CASH") return 0;
    return Math.max(0, cashVal - grandTotal);
  }, [cashInput, paymentMethod, grandTotal]);

  const isPaymentValid = useMemo(() => {
    if (grandTotal <= 0) return false;
    if (paymentMethod === "CASH") {
      const cashVal = parseFloat(cashInput) || 0;
      return cashVal >= grandTotal;
    }
    return true; // E-wallet/Bank Transfer are exact payments
  }, [cashInput, paymentMethod, grandTotal]);

  // Filtered queue items
  const filteredQueue = useMemo(() => {
    return transactions.filter((order) => {
      const matchesSearch =
        order.ticketNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "SEMUA" ||
        (statusFilter === "MENUNGGU" &&
          order.status === "NEED_PAYMENT") ||
        (statusFilter === "LUNAS" && order.status === "LUNAS");

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

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
    setSelectedOrderId(orderId);
    setDiscountPercent(0);
    setPaymentMethod("CASH");
    setCashInput("");
    setCustomerLevel("END_USER");
    setCustomerName("");
    setCustomerPhone("");
    setSelectedResellerId("");
  };

  const handleUpdateItemPrice = (orderId: string, itemId: string, price: number) => {
    setTransactions((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          items: order.items.map((item) => {
            if (item.id !== itemId) return item;
            return { ...item, pricePerUnit: price };
          }),
        };
      })
    );
  };

  const handleProcessPayment = () => {
    if (!activeOrder) return;

    if (paymentMethod === "CASH" && !isPaymentValid) {
      toast.error(
        "Pembayaran Kurang",
        "Nominal uang tunai yang diinput kurang dari total tagihan.",
      );
      return;
    }

    const currentCash = parseFloat(cashInput) || grandTotal;

    // Create completed order snapshot
    const completedOrder: OrderTransaction = {
      ...activeOrder,
      status: "LUNAS",
      paymentMethod,
      discountAmount,
      taxAmount,
      grandTotal,
      totalPaid: paymentMethod === "CASH" ? currentCash : grandTotal,
      changeAmount:
        paymentMethod === "CASH" ? Math.max(0, currentCash - grandTotal) : 0,
    };

    // Update original state list
    setTransactions((prev) =>
      prev.map((t) => (t.id === activeOrder.id ? completedOrder : t)),
    );

    setLastCompletedOrder(completedOrder);
    setIsReceiptOpen(true);
    toast.success(
      "Transaksi Berhasil",
      `Pembayaran tiket ${activeOrder.ticketNo} berhasil diproses.`,
    );
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
        <div className="grid grid-cols-3 gap-3 md:w-auto w-full">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 p-3 rounded-2xl flex items-center gap-3">
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

          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 p-3 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <LuCheck size={18} />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                Terbayar
              </span>
              <span className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                {stats.lunasCount} Invoice
              </span>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 p-3 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <LuCoins size={18} />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                Omset
              </span>
              <span className="text-sm font-black text-foreground">
                {formatCurrency(stats.totalRevenue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Cashier Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COMPONENT (7 Columns): Order Queue & Filters */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border/50 p-3.5 rounded-2xl">
            {/* Search Input */}
            <div className="flex-1 w-full">
              <TextField
                placeholder="Cari No. Tiket atau Nama Pelanggan..."
                prefixIcon={LuSearch}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto overflow-x-auto">
              {(["SEMUA", "MENUNGGU", "LUNAS"] as const).map((tab) => (
                <Button
                  key={tab}
                  variant={statusFilter === tab ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(tab)}
                  className={`h-9 px-4 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    statusFilter === tab
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <LuFilter size={12} />
                    {tab === "SEMUA"
                      ? "Semua"
                      : tab === "MENUNGGU"
                        ? "Antrean Baru (NEED_PAYMENT)"
                        : "Lunas"}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Queue Cards */}
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-270px)] pr-2 scrollbar-thin">
            {filteredQueue.length > 0 ? (
              filteredQueue.map((order) => {
                const isSelected = order.id === selectedOrderId;
                const isPaid = order.status === "LUNAS";
                const totalItemPrice = order.items.reduce(
                  (sum, item) => sum + item.pricePerUnit * item.qty,
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
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                            }`}
                          >
                            {isPaid ? "Lunas" : "Baru (Need Payment)"}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <LuUser size={14} className="text-primary/70" />
                            {order.customerName}
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
                        {isPaid ? (
                          <>
                            <span className="text-xs font-semibold text-muted-foreground">
                              Total Bayar
                            </span>
                            <span className="text-base font-black text-foreground">
                              {formatCurrency(order.grandTotal || 0)}
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

              {/* Customer Level Selector Chips */}
              <div className="px-5 py-3 border-b border-border/20 bg-muted/10 flex items-center justify-between gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Level Pelanggan:
                </span>
                <div className="flex gap-2">
                  <Button
                    variant={customerLevel === "END_USER" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCustomerLevel("END_USER")}
                    className={`h-7 px-3 rounded-lg text-xs font-black transition-all ${
                      customerLevel === "END_USER"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted text-muted-foreground border-border/50"
                    }`}
                  >
                    End User
                  </Button>
                  <Button
                    variant={customerLevel === "RESELLER" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setCustomerLevel("RESELLER");
                      setCustomerName("");
                      setCustomerPhone("");
                      setSelectedResellerId("");
                    }}
                    className={`h-7 px-3 rounded-lg text-xs font-black transition-all ${
                      customerLevel === "RESELLER"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted text-muted-foreground border-border/50"
                    }`}
                  >
                    Reseller
                  </Button>
                </div>
              </div>

              {/* Customer Info Form */}
              <div className="p-5 border-b border-border/20 bg-muted/5 space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                    Nama Pelanggan
                  </span>
                  {customerLevel === "END_USER" ? (
                    <TextField
                      placeholder="Masukkan nama pelanggan..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs font-semibold"
                    />
                  ) : (
                    <select
                      value={selectedResellerId}
                      onChange={(e) => {
                        const resellerId = e.target.value;
                        setSelectedResellerId(resellerId);
                        const selected = MOCK_RESELLERS.find((r) => r.id === resellerId);
                        if (selected) {
                          setCustomerName(selected.name);
                          setCustomerPhone(selected.phone);
                        } else {
                          setCustomerName("");
                          setCustomerPhone("");
                        }
                      }}
                      className="w-full h-10 px-3 text-xs rounded-xl border border-border/80 bg-background text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">-- Pilih Reseller --</option>
                      {MOCK_RESELLERS.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                    No. Handphone Pelanggan
                  </span>
                  <TextField
                    placeholder={customerLevel === "RESELLER" ? "Pilih reseller untuk mengisi nomor HP" : "Masukkan nomor handphone..."}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={customerLevel === "RESELLER"}
                    className="w-full text-xs font-semibold font-mono"
                  />
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
                          {formatCurrency(item.pricePerUnit)} x {item.qty}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-muted-foreground font-bold">Harga Satuan (Rp):</span>
                          <input
                            type="number"
                            min="0"
                            value={item.pricePerUnit || ""}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              handleUpdateItemPrice(activeOrder.id, item.id, val);
                            }}
                            placeholder="Input Harga..."
                            className="w-24 h-7 px-1.5 py-0.5 text-xs font-mono font-bold bg-muted border border-border/80 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                          />
                          <span className="text-[10px] text-muted-foreground font-black">x {item.qty}</span>
                        </div>
                      )}
                    </div>
                    <span className="font-black text-foreground shrink-0 self-center">
                      {item.pricePerUnit > 0 ? formatCurrency(item.pricePerUnit * item.qty) : "-"}
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

                {/* Discount Percentage Slider/Buttons */}
                {activeOrder.status !== "LUNAS" && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-muted-foreground flex items-center gap-1">
                        <LuPercent size={13} className="text-primary" />
                        Diskon Pelanggan
                      </span>
                      <span className="font-black text-rose-600">
                        {discountAmount > 0 ? `-${formatCurrency(discountAmount)} (${discountPercent}%)` : "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {([0, 5, 10, 15, 20] as const).map((pct) => (
                        <Button
                          key={pct}
                          variant={
                            discountPercent === pct ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setDiscountPercent(pct)}
                          className={`h-8 rounded-lg text-xs font-black p-0 transition-all ${
                            discountPercent === pct
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {pct}%
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tax / PPN info */}
                <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <LuReceipt size={13} className="text-primary" />
                    PPN (11%)
                  </span>
                  <span className="font-bold text-foreground">
                    {taxAmount > 0 ? formatCurrency(taxAmount) : "-"}
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
                {activeOrder.status === "LUNAS" ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 p-4 rounded-2xl flex flex-col items-center text-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black">
                      <LuCheck size={18} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-black text-emerald-800 dark:text-emerald-400 block uppercase">
                        Transaksi Lunas
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold block">
                        Terbayar via {activeOrder.paymentMethod} sebesar{" "}
                        {formatCurrency(activeOrder.grandTotal || 0)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLastCompletedOrder(activeOrder);
                        setIsReceiptOpen(true);
                      }}
                      className="mt-2 h-8 px-4 rounded-lg text-xs font-bold border-emerald-300 hover:bg-emerald-100/30 flex items-center gap-2"
                    >
                      <LuPrinter size={13} />
                      Cetak Ulang Struk
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Payment Method Selector */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                        Metode Pembayaran
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {["CASH", "QRIS", "TRANSFER"].map((method) => {
                          const isSelected = paymentMethod === method;
                          return (
                            <Button
                              key={method}
                              variant={isSelected ? "default" : "outline"}
                              onClick={() => {
                                setPaymentMethod(method);
                                setCashInput("");
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

                    {/* Cash Tendered Input (Only show if CASH) */}
                    {paymentMethod === "CASH" && (
                      <div className="space-y-2 animate-in slide-in-from-top-3 duration-300">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-muted-foreground flex items-center gap-1">
                            <LuDollarSign size={13} className="text-primary" />
                            Nominal Uang Tunai (Tunai)
                          </span>
                          {parseFloat(cashInput) > 0 && (
                            <span className="font-black text-emerald-600">
                              Kembalian: {formatCurrency(changeAmount)}
                            </span>
                          )}
                        </div>

                        <TextField
                          type="number"
                          placeholder="Masukkan jumlah uang tunai..."
                          value={cashInput}
                          onChange={(e) => setCashInput(e.target.value)}
                          className="w-full text-base font-mono font-bold"
                        />

                        {/* Quick Cash Suggestions */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                          {[grandTotal, 50000, 100000, 150000, 200000].map(
                            (cashVal) => {
                              if (
                                cashVal < grandTotal &&
                                cashVal !== grandTotal
                              )
                                return null;
                              return (
                                <Button
                                  key={cashVal}
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setCashInput(Math.ceil(cashVal).toString())
                                  }
                                  className="h-7 px-3 rounded-lg text-[10px] font-black shrink-0 hover:bg-muted text-foreground border-border/50"
                                >
                                  {cashVal === grandTotal
                                    ? "Pas"
                                    : formatCurrency(cashVal)}
                                </Button>
                              );
                            },
                          )}
                        </div>
                      </div>
                    )}

                    {/* Submit Actions */}
                    <div className="pt-2 flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedOrderId(null)}
                        className="h-11 flex-1 rounded-xl font-bold border-border/60 hover:bg-muted/50"
                      >
                        Batal
                      </Button>
                      <Button
                        onClick={handleProcessPayment}
                        disabled={!isPaymentValid}
                        className={`h-11 flex-[2] rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                          isPaymentValid
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25"
                            : "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                        }`}
                      >
                        <LuPrinter size={16} />
                        Bayar & Cetak Struk
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
                        {formatCurrency(item.pricePerUnit * item.qty)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grand summary */}
              <div className="py-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    {formatCurrency(
                      lastCompletedOrder.items.reduce(
                        (s, i) => s + i.pricePerUnit * i.qty,
                        0,
                      ),
                    )}
                  </span>
                </div>

                {lastCompletedOrder.discountAmount &&
                lastCompletedOrder.discountAmount > 0 ? (
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>Potongan Diskon:</span>
                    <span>
                      -{formatCurrency(lastCompletedOrder.discountAmount)}
                    </span>
                  </div>
                ) : null}

                {lastCompletedOrder.taxAmount &&
                lastCompletedOrder.taxAmount > 0 ? (
                  <div className="flex justify-between">
                    <span>PPN (11%):</span>
                    <span>{formatCurrency(lastCompletedOrder.taxAmount)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between font-bold text-sm border-t border-dotted border-slate-300 dark:border-slate-700 pt-2 text-foreground">
                  <span>TOTAL BELANJA:</span>
                  <span>
                    {formatCurrency(lastCompletedOrder.grandTotal || 0)}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] pt-1.5">
                  <span>Metode Bayar:</span>
                  <span className="font-bold">
                    {lastCompletedOrder.paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between text-[10px]">
                  <span>Jumlah Bayar:</span>
                  <span>
                    {formatCurrency(lastCompletedOrder.totalPaid || 0)}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Kembalian:</span>
                  <span>
                    {formatCurrency(lastCompletedOrder.changeAmount || 0)}
                  </span>
                </div>
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
