import React from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Card, CardContent } from "@erp-digital-printing/ui/Card";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { toast } from "@erp-digital-printing/ui/Toast";
import {
  LuSearch,
  LuUser,
  LuCalendar,
  LuShoppingBag,
  LuCreditCard,
  LuReceipt,
  LuCheck,
  LuPrinter,
  LuDollarSign,
  LuClock,
  LuInfo,
  LuSparkles,
  LuCoins,
  LuArrowRight,
  LuQrCode,
  LuCornerUpLeft,
  LuTrash2,
} from "@erp-digital-printing/ui/icons";
import { useOrder } from "../hooks/useOrder";

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

const OrderPage = () => {
  const {
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
    updateStatusMutation,
    processPaymentMutation,
    handleSendBackToDraft,
    handleCancelOrder,
    handleSelectOrder,
    handleUpdateItemPrice,
    handleProcessPayment,
  } = useOrder();

  const [isPrinting, setIsPrinting] = React.useState(false);

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
                            {isPaid
                              ? "Lunas"
                              : order.status === "PARTIAL_PAID"
                                ? "Panjar / DP"
                                : "Baru (Need Payment)"}
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
                {activeOrder.status === "LUNAS" ||
                activeOrder.status === "PARTIAL_PAID" ? (
                  <div
                    className={`border p-4 rounded-2xl flex flex-col items-center text-center gap-2 ${
                      activeOrder.status === "LUNAS"
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 text-emerald-700"
                        : "bg-amber-50 dark:bg-amber-950/20 border-amber-200/50 text-amber-700"
                    }`}
                  >
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center font-black ${
                        activeOrder.status === "LUNAS"
                          ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {activeOrder.status === "LUNAS" ? (
                        <LuCheck size={18} />
                      ) : (
                        <LuCoins size={18} />
                      )}
                    </div>
                    <div className="space-y-1">
                      <span
                        className={`text-xs font-black block uppercase ${
                          activeOrder.status === "LUNAS"
                            ? "text-emerald-800 dark:text-emerald-400"
                            : "text-amber-800 dark:text-amber-400"
                        }`}
                      >
                        {activeOrder.status === "LUNAS"
                          ? "Transaksi Lunas"
                          : "Transaksi Panjar / DP"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold block">
                        Terbayar via {activeOrder.paymentMethod} sebesar{" "}
                        {formatCurrency(activeOrder.totalPaid || 0)}
                      </span>
                      {activeOrder.status === "PARTIAL_PAID" && (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-black block">
                          Sisa Tagihan:{" "}
                          {formatCurrency(activeOrder.remainingAmount || 0)}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLastCompletedOrder(activeOrder);
                        setIsTemporaryReceipt(false);
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
                    {/* Actions: Send to Draft & Cancel Order */}
                    <div className="grid grid-cols-2 gap-3 pb-4 border-b border-border/30">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setIsDraftConfirmOpen(true)}
                        className="h-9 rounded-xl font-bold text-[11px] border-amber-500/20 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <LuCornerUpLeft size={13} />
                        Kirim ke Draft
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setIsCancelConfirmOpen(true)}
                        className="h-9 rounded-xl font-bold text-[11px] border-rose-500/20 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <LuTrash2 size={13} />
                        Batalkan Order
                      </Button>
                    </div>

                    {/* Toggle Split Payment */}
                    <div className="flex items-center justify-between bg-card border border-border/60 p-3.5 rounded-2xl shadow-sm">
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
                          setSingleAmount(0);
                          setSplitAmounts({ cash: 0, transfer: 0, qris: 0 });
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isSplitPayment
                            ? "bg-primary"
                            : "bg-muted-foreground/30"
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
                        {/* Normal / Single Payment Mode */}
                        <div className="space-y-2.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                            Metode Pembayaran
                          </span>
                          <div className="grid grid-cols-4 gap-2">
                            {["CASH", "TRANSFER", "QRIS", "PIUTANG"].map((method) => {
                              const isSelected = paymentMethod === method;
                              return (
                                <Button
                                  key={method}
                                  variant={isSelected ? "default" : "outline"}
                                  onClick={() => {
                                    setPaymentMethod(method);
                                    if (method === "PIUTANG") {
                                      setSingleAmount(0);
                                    } else {
                                      setSingleAmount(null); // reset to full payment of selected order
                                    }
                                  }}
                                  className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                                    isSelected
                                      ? "bg-primary text-primary-foreground shadow-md"
                                      : "hover:bg-muted text-muted-foreground border-border/50"
                                  }`}
                                >
                                  {method === "CASH" ? (
                                    <LuDollarSign size={13} />
                                  ) : method === "TRANSFER" ? (
                                    <LuCreditCard size={13} />
                                  ) : method === "QRIS" ? (
                                    <LuQrCode size={13} />
                                  ) : (
                                    <LuCoins size={13} />
                                  )}
                                  {method}
                                </Button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Single Payment Amount Input */}
                        {paymentMethod !== "PIUTANG" ? (
                          <div className="space-y-1.5 animate-in fade-in duration-200">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                              Nominal Pembayaran
                            </span>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                                Rp
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={
                                  singleAmount === null
                                    ? grandTotal
                                    : singleAmount
                                }
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (raw === "") {
                                    setSingleAmount(null);
                                  } else {
                                    const val = parseFloat(raw);
                                    setSingleAmount(isNaN(val) ? 0 : val);
                                  }
                                }}
                                placeholder="Masukkan nominal..."
                                className="w-full h-10 pl-9 pr-3 text-xs font-mono font-bold bg-card border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                              />
                            </div>
                            {remainingAmount > 0 && (
                              <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 p-2.5 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                                <LuInfo size={14} className="shrink-0" />
                                <span>
                                  Sisa Tagihan (Tempo):{" "}
                                  <strong>
                                    {formatCurrency(remainingAmount)}
                                  </strong>
                                </span>
                              </div>
                            )}
                            {changeAmount > 0 && (
                              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 p-2.5 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                                <LuCheck size={14} className="shrink-0" />
                                <span>
                                  Kembalian Tunai:{" "}
                                  <strong>{formatCurrency(changeAmount)}</strong>
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 p-2.5 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                            <LuInfo size={14} className="shrink-0" />
                            <span>
                              Transaksi dicatat sebagai <strong>Piutang/Hutang Penuh</strong>. Sisa Tagihan (Tempo): <strong>{formatCurrency(grandTotal)}</strong>.
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Split Payment Mode inputs */}
                        <div className="space-y-3.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                            Nominal Pembayaran Terbagi
                          </span>

                          {/* Cash Input */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-foreground flex items-center gap-1.5">
                                <LuDollarSign
                                  size={13}
                                  className="text-primary/70"
                                />
                                Tunai (Cash)
                              </span>
                              {grandTotal -
                                (splitAmounts.transfer + splitAmounts.qris) >
                                0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const sisa = Math.max(
                                      0,
                                      grandTotal -
                                        (splitAmounts.transfer +
                                          splitAmounts.qris),
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
                                      grandTotal -
                                        (splitAmounts.transfer +
                                          splitAmounts.qris),
                                    ),
                                  )}
                                  )
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                                Rp
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={splitAmounts.cash || ""}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setSplitAmounts((prev) => ({
                                    ...prev,
                                    cash: val,
                                  }));
                                }}
                                placeholder="0"
                                className="w-full h-9 pl-9 pr-3 text-xs font-mono font-bold bg-card border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                              />
                            </div>
                          </div>

                          {/* Transfer Input */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-foreground flex items-center gap-1.5">
                                <LuCreditCard
                                  size={13}
                                  className="text-primary/70"
                                />
                                Transfer Bank
                              </span>
                              {grandTotal -
                                (splitAmounts.cash + splitAmounts.qris) >
                                0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const sisa = Math.max(
                                      0,
                                      grandTotal -
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
                                      grandTotal -
                                        (splitAmounts.cash + splitAmounts.qris),
                                    ),
                                  )}
                                  )
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
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
                                className="w-full h-9 pl-9 pr-3 text-xs font-mono font-bold bg-card border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                              />
                            </div>
                          </div>

                          {/* QRIS Input */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-foreground flex items-center gap-1.5">
                                <LuQrCode
                                  size={13}
                                  className="text-primary/70"
                                />
                                QRIS
                              </span>
                              {grandTotal -
                                (splitAmounts.cash + splitAmounts.transfer) >
                                0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const sisa = Math.max(
                                      0,
                                      grandTotal -
                                        (splitAmounts.cash +
                                          splitAmounts.transfer),
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
                                      grandTotal -
                                        (splitAmounts.cash +
                                          splitAmounts.transfer),
                                    ),
                                  )}
                                  )
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                                Rp
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={splitAmounts.qris || ""}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setSplitAmounts((prev) => ({
                                    ...prev,
                                    qris: val,
                                  }));
                                }}
                                placeholder="0"
                                className="w-full h-9 pl-9 pr-3 text-xs font-mono font-bold bg-card border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                              />
                            </div>
                          </div>

                          {/* Real-time split details summary */}
                          <div className="bg-primary/[0.02] border border-border/40 p-3.5 rounded-2xl text-[11px] font-semibold space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Total Tagihan:
                              </span>
                              <span className="text-foreground font-bold">
                                {formatCurrency(grandTotal)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Total Diinput:
                              </span>
                              <span className="text-foreground font-bold">
                                {formatCurrency(totalPaid)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Sisa Belum Terbayar:
                              </span>
                              <span
                                className={`font-black ${
                                  remainingAmount > 0
                                    ? "text-rose-600 dark:text-rose-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                                }`}
                              >
                                {remainingAmount > 0
                                  ? formatCurrency(remainingAmount)
                                  : "PAS / LUNAS"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        if (activeOrder) {
                          setLastCompletedOrder(activeOrder);
                          setIsTemporaryReceipt(true);
                          setIsReceiptOpen(true);
                        }
                      }}
                      className="w-full h-10 rounded-xl font-bold border-dashed border-primary/45 text-primary hover:bg-primary/5 flex items-center justify-center gap-2 transition-all active:scale-95 mb-2.5"
                    >
                      <LuPrinter size={15} />
                      Cetak Nota Sementara (Draft)
                    </Button>

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
                        disabled={
                          !isPaymentValid || processPaymentMutation.isPending
                        }
                        className={`h-11 flex-[2] rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                          isPaymentValid && !processPaymentMutation.isPending
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25"
                            : "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                        }`}
                      >
                        <LuPrinter size={16} />
                        {processPaymentMutation.isPending
                          ? "Memproses..."
                          : "Bayar & Cetak Struk"}
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
                {isTemporaryReceipt
                  ? "Preview Nota Sementara"
                  : "Preview Struk Kasir"}
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                {isTemporaryReceipt
                  ? "Simulasi hasil cetakan nota sementara (Draft) 58mm."
                  : "Simulasi hasil cetakan thermal struk digital printing 58mm."}
              </p>
            </div>

            {/* Simulated Receipt Paper container */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 overflow-y-auto max-h-[50vh] shadow-inner">
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center">
                <span className="font-bold text-sm block">
                  DIGITAL PRINTING ERP
                </span>
                {isTemporaryReceipt && (
                  <span className="inline-block bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider my-1">
                    NOTA SEMENTARA (DRAFT)
                  </span>
                )}
                <span className="block text-[10px] text-muted-foreground">
                  Jl. Percetakan Keren No. 88, Jakarta
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  Telp: 021-555-9081
                </span>
              </div>

              {/* Receipt metadata */}
              <div className="py-3 space-y-1 border-b border-dashed border-slate-300 dark:border-slate-700">
                {!isTemporaryReceipt && (
                  <div className="flex justify-between">
                    <span>No. Tiket:</span>
                    <span className="font-bold">
                      {lastCompletedOrder.ticketNo}
                    </span>
                  </div>
                )}
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
                        {item.uom === "m2" && item.lengthCm && item.widthCm ? (
                          `${item.lengthCm / 100}x${item.widthCm / 100} x ${item.qty} x ${formatCurrency(item.pricePerUnit)}`
                        ) : item.uom === "m_lari" && item.lengthCm ? (
                          `${item.lengthCm / 100} x ${item.qty} x ${formatCurrency(item.pricePerUnit)}`
                        ) : (
                          `${item.qty} x ${formatCurrency(item.pricePerUnit)}`
                        )}
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
                    {formatCurrency(
                      isTemporaryReceipt
                        ? lastCompletedOrder.items.reduce(
                            (s, i) => s + i.subtotal,
                            0,
                          )
                        : lastCompletedOrder.grandTotal || 0,
                    )}
                  </span>
                </div>

                {!isTemporaryReceipt && (
                  <>
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
                          {formatCurrency(
                            lastCompletedOrder.remainingAmount || 0,
                          )}
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
                  </>
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
                onClick={async () => {
                  setIsPrinting(true);

                  const printFormatCurrency = (val: number): string => {
                    const formattedNumber = new Intl.NumberFormat("id-ID", {
                      maximumFractionDigits: 0,
                    }).format(val);
                    return `Rp ${formattedNumber}`;
                  };

                  const formatLine = (
                    left: string,
                    right: string,
                    charWidth = 32,
                  ): string => {
                    const spacesNeeded = charWidth - left.length - right.length;
                    if (spacesNeeded > 0) {
                      return left + " ".repeat(spacesNeeded) + right + "\n";
                    }
                    return (
                      left +
                      "\n" +
                      " ".repeat(charWidth - right.length) +
                      right +
                      "\n"
                    );
                  };

                  // ESC/POS Command: Center Align
                  let rawData = "\x1b\x61\x01";
                  
                  // ESC/POS Command: Print NV Bit Image #1 (normal mode)
                  rawData += "\x1c\x70\x01\x00\n";
                  
                  rawData += "      DIGITAL PRINTING ERP      \n";
                  if (isTemporaryReceipt) {
                    rawData += "     NOTA SEMENTARA (DRAFT)     \n";
                  }
                  rawData += "Jl. Percetakan Keren No. 88, Jkt\n";
                  rawData += "       Telp: 021-555-9081       \n";
                  
                  // ESC/POS Command: Left Align
                  rawData += "\x1b\x61\x00";
                  rawData += "--------------------------------\n";
                  
                  if (!isTemporaryReceipt) {
                    rawData += formatLine("No. Tiket", lastCompletedOrder.ticketNo);
                  }
                  rawData += formatLine("Tanggal", lastCompletedOrder.createdAt);
                  rawData += formatLine("Pelanggan", lastCompletedOrder.customerName.toUpperCase());
                  rawData += formatLine("Kasir", "Sistem Kasir Utama");
                  
                  rawData += "--------------------------------\n";

                  lastCompletedOrder.items.forEach((item) => {
                    rawData += `${item.productName}\n`;
                    const leftDetail = (item.uom === "m2" && item.lengthCm && item.widthCm)
                      ? `${item.lengthCm / 100}x${item.widthCm / 100} x ${item.qty} x ${printFormatCurrency(item.pricePerUnit)}`
                      : (item.uom === "m_lari" && item.lengthCm)
                      ? `${item.lengthCm / 100} x ${item.qty} x ${printFormatCurrency(item.pricePerUnit)}`
                      : `${item.qty} x ${printFormatCurrency(item.pricePerUnit)}`;
                    const rightDetail = printFormatCurrency(item.subtotal);
                    rawData += formatLine(leftDetail, rightDetail);
                    rawData += "\n";
                  });

                  rawData += "--------------------------------\n";
                  
                  const totalItemsText = `${lastCompletedOrder.items.length} item`;
                  rawData += formatLine("Total Item", totalItemsText);
                  
                  const subtotalValue = lastCompletedOrder.items.reduce((s, i) => s + i.subtotal, 0);
                  rawData += formatLine("Subtotal", printFormatCurrency(subtotalValue));
                  
                  rawData += "================================\n";
                  const grandTotalValue = isTemporaryReceipt ? subtotalValue : (lastCompletedOrder.grandTotal || 0);
                  rawData += formatLine("TOTAL BELANJA", printFormatCurrency(grandTotalValue));
                  rawData += "--------------------------------\n";
                  
                  if (!isTemporaryReceipt) {
                    rawData += formatLine("Metode Bayar", lastCompletedOrder.paymentMethod || "-");
                    rawData += formatLine("Bayar", printFormatCurrency(lastCompletedOrder.totalPaid || 0));
                    
                    if (lastCompletedOrder.status === "PARTIAL_PAID") {
                      rawData += formatLine("SISA (UTANG)", printFormatCurrency(lastCompletedOrder.remainingAmount || 0));
                    } else if (lastCompletedOrder.status === "LUNAS") {
                      rawData += formatLine("Kembalian", printFormatCurrency(lastCompletedOrder.changeAmount || 0));
                    }
                    rawData += "--------------------------------\n";
                  }
                  
                  // ESC/POS Command: Center Align
                  rawData += "\x1b\x61\x01";
                  rawData += "      --- TERIMA KASIH ---      \n";
                  rawData += "  Barang yang sudah dibeli tidak \n";
                  rawData += "    dapat ditukar/dikembalikan   \n";
                  rawData += "          Sukses Selalu!         \n\n\n\n\n\n";

                  // ESC/POS Command: Auto Cut
                  rawData += "\x1d\x56\x00";

                  try {
                    const response = await fetch(
                      "http://localhost:9876/print",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          printer_name: "PRINTER-POS",
                          raw_data: rawData,
                        }),
                      }
                    );

                    if (!response.ok) {
                      throw new Error(
                        "Gagal memproses struk melalui Print Agent lokal."
                      );
                    }

                    toast.success(
                      isTemporaryReceipt
                        ? "Mencetak Nota Sementara..."
                        : "Mencetak Struk...",
                      isTemporaryReceipt
                        ? "Dokumen nota sementara dikirim ke mesin thermal printer lokal."
                        : "Dokumen struk dikirim ke mesin thermal printer lokal."
                    );
                    setIsReceiptOpen(false);
                  } catch (error) {
                    console.error("Error printing:", error);
                    toast.error(
                      "Gagal Cetak",
                      "Pastikan Print Agent lokal (localhost:9876) sudah berjalan."
                    );
                  } finally {
                    setIsPrinting(false);
                  }
                }}
                disabled={isPrinting}
                className="h-10 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPrinting ? (
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 rounded-full border-2 border-primary-foreground/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  </div>
                ) : (
                  <LuPrinter size={16} />
                )}
                {isPrinting
                  ? "Mencetak..."
                  : isTemporaryReceipt
                  ? "Cetak Nota Sementara"
                  : "Cetak ke Thermal Printer"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Confirmation Dialog: Send Back to Draft */}
      <Dialog
        isOpen={isDraftConfirmOpen}
        onClose={() => setIsDraftConfirmOpen(false)}
        size="sm"
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground"
        showCloseButton={true}
      >
        <div className="space-y-5 flex flex-col">
          <div className="flex flex-col gap-1 border-b border-border/30 pb-4 pr-10">
            <h2 className="text-lg font-black tracking-tight text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <LuCornerUpLeft size={18} />
              Kembalikan ke Draft?
            </h2>
            <p className="text-xs text-muted-foreground font-semibold">
              Konfirmasi pengembalian status transaksi.
            </p>
          </div>

          <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
            Tindakan ini akan mengembalikan pesanan{" "}
            <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
              {activeOrder?.ticketNo}
            </span>{" "}
            ke status **Draft**. Desainer akan dapat mengedit kembali item
            belanja ini. Transaksi akan dihapus dari antrean kasir.
          </p>

          <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsDraftConfirmOpen(false)}
              className="h-9 px-4 rounded-xl font-bold border-border/60 hover:bg-muted/50 text-xs"
            >
              Batal
            </Button>
            <Button
              onClick={handleSendBackToDraft}
              className="h-9 px-5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25 flex items-center gap-1.5 text-xs transition-all active:scale-95"
            >
              <LuCornerUpLeft size={14} />
              Kirim ke Draft
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Confirmation Dialog: Cancel Order */}
      <Dialog
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        size="sm"
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground"
        showCloseButton={true}
      >
        <div className="space-y-5 flex flex-col">
          <div className="flex flex-col gap-1 border-b border-border/30 pb-4 pr-10">
            <h2 className="text-lg font-black tracking-tight text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <LuTrash2 size={18} />
              Batalkan Pesanan?
            </h2>
            <p className="text-xs text-muted-foreground font-semibold">
              Konfirmasi pembatalan transaksi permanen.
            </p>
          </div>

          <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
            Apakah Anda yakin ingin membatalkan pesanan{" "}
            <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
              {activeOrder?.ticketNo}
            </span>{" "}
            secara permanen? Tindakan ini tidak dapat dibatalkan dan transaksi
            tidak dapat diproses lebih lanjut.
          </p>

          <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsCancelConfirmOpen(false)}
              className="h-9 px-4 rounded-xl font-bold border-border/60 hover:bg-muted/50 text-xs"
            >
              Batal
            </Button>
            <Button
              onClick={handleCancelOrder}
              className="h-9 px-5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 flex items-center gap-1.5 text-xs transition-all active:scale-95"
            >
              <LuTrash2 size={14} />
              Batalkan Order
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Full-screen Loading Overlay for status mutations */}
      {updateStatusMutation.isPending && (
        <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card border border-border/50 p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 max-w-xs text-center">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">
                Memproses Permintaan...
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Sedang memperbarui status order di server
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
