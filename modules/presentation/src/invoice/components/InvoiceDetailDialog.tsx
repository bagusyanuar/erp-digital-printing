import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Button } from "@erp-digital-printing/ui/Button";
import {
  LuReceipt,
  LuUser,
  LuCalendar,
  LuClock,
  LuCircleX,
  LuRotateCcw,
  LuCircleCheck,
  LuLoader,
  LuTriangleAlert,
  LuPackage,
} from "@erp-digital-printing/ui/icons";
import { useOrderDI } from "@presentation/order/hooks/useOrderDI";
import { orderKeys } from "@infrastructure/order/keys";
import type { OrderModel, OrderPaymentModel } from "@core/order/domains/models/order.model";
import type { AppError } from "@core/shared/errors/domain.error";

export interface InvoiceDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

const formatDateTime = (createdAt?: string): string => {
  if (!createdAt) return "-";
  try {
    const dateObj = new Date(createdAt);
    if (isNaN(dateObj.getTime())) {
      const parts = createdAt.split(" ");
      if (parts[0]) {
        const dParts = parts[0].split("-");
        if (dParts.length === 3) {
          return `${dParts[2]}/${dParts[1]}/${dParts[0]}${parts[1] ? `, ${parts[1].substring(0, 5)}` : ""}`;
        }
      }
      return createdAt;
    }

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  } catch {
    return createdAt;
  }
};

export const InvoiceDetailDialog: React.FC<InvoiceDetailDialogProps> = ({
  isOpen,
  onClose,
  orderId,
}) => {
  const { getOrderByIdUseCase, getOrderPaymentsUseCase } = useOrderDI();

  const {
    data: order,
    isLoading: isLoadingOrder,
    isError: isErrorOrder,
  } = useQuery<OrderModel, AppError>({
    queryKey: orderKeys.detail(orderId ?? ""),
    queryFn: () => getOrderByIdUseCase.execute(orderId!),
    enabled: isOpen && Boolean(orderId),
    staleTime: 5 * 60 * 1000,
  });

  const { data: paymentsData, isLoading: isLoadingPayments } = useQuery<
    OrderPaymentModel[],
    AppError
  >({
    queryKey: orderKeys.payments(orderId ?? ""),
    queryFn: () => getOrderPaymentsUseCase.execute(orderId!),
    enabled: isOpen && Boolean(orderId),
    staleTime: 5 * 60 * 1000,
  });

  const payments = paymentsData || order?.order_payments || [];

  const groupedPayments = useMemo(() => {
    if (!payments || payments.length === 0) return [];

    const map = new Map<number, OrderPaymentModel[]>();
    payments.forEach((p) => {
      const num = p.payment_number || 1;
      if (!map.has(num)) {
        map.set(num, []);
      }
      map.get(num)!.push(p);
    });

    return Array.from(map.entries())
      .map(([payment_number, pays]) => {
        const totalAmount = pays.reduce((sum, p) => sum + p.amount, 0);
        const created_at = formatDateTime(pays[0]?.created_at);
        const cashier_name = pays[0]?.cashier_name || "Sistem";
        const methods = pays.map((p) => p.payment_method).join(", ");
        const payment_type = pays[0]?.payment_type;

        return {
          id: pays[0]?.id ?? `${payment_number}`,
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

  const items = useMemo(() => {
    if (!order) return [];
    return (order.order_items ?? []).map((item) => {
      const displayName =
        item.variant_name &&
        item.variant_name.toLowerCase() !== "default" &&
        item.variant_name.toLowerCase() !== item.product_name.toLowerCase()
          ? `${item.product_name} (${item.variant_name})`
          : item.product_name;

      return {
        id: item.id,
        productName: displayName,
        notes: item.production_notes || "-",
        pricePerUnit: item.price_per_unit || 0,
        qty: item.quantity,
        additionalCost: item.additional_cost || 0,
        subtotal: item.subtotal || 0,
        lengthM: item.length_m,
        widthM: item.width_m,
        uom: item.uom,
      };
    });
  }, [order]);

  const outstanding = order ? Math.max(0, order.grand_total - order.amount_paid) : 0;
  const isReseller = Boolean(order?.reseller_id);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] w-full max-w-4xl flex flex-col"
      showCloseButton={true}
    >
      {isLoadingOrder ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <LuLoader className="animate-spin text-primary" size={32} />
          <span className="text-xs font-semibold text-muted-foreground">
            Memuat rincian invoice...
          </span>
        </div>
      ) : isErrorOrder || !order ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <LuTriangleAlert size={24} />
          </div>
          <h3 className="text-sm font-bold text-foreground">Data Invoice Tidak Ditemukan</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Gagal mengambil rincian pesanan dari server. Pastikan koneksi atau ID nota valid.
          </p>
          <div className="pt-2">
            <Button size="sm" variant="outline" onClick={onClose} className="rounded-xl text-xs">
              Tutup
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 flex flex-col overflow-hidden h-[75vh] max-h-[75vh]">
          {/* Header */}
          <div className="flex flex-col gap-1 border-b border-border/30 pb-4 shrink-0 pr-12">
            <div className="flex items-center gap-2">
              <LuReceipt size={20} className="text-primary" />
              <h2 className="text-xl font-black tracking-tight text-foreground">
                Detail Rincian Belanja
              </h2>
            </div>
            <p className="text-xs text-muted-foreground font-semibold">
              Invoice:{" "}
              <span className="font-mono text-foreground font-bold">
                {order.invoice_number || order.job_number}
              </span>
            </p>
          </div>

          {/* Two-Column Content Layout */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0">
            {/* LEFT COLUMN: Customer info & Items */}
            <div className="flex flex-col h-full overflow-y-auto pr-1 space-y-4">
              {/* Pelanggan Box */}
              <div className="bg-muted/30 p-4 rounded-2xl border border-border/40 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                      Pelanggan
                    </span>
                    <span className="font-bold text-foreground text-xs block">
                      {order.customer_name || "Customer Walk In"}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border leading-none ${
                        isReseller
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {isReseller ? "Reseller" : "Retail"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                      No. Telepon / WA
                    </span>
                    <span className="font-mono text-foreground text-xs font-semibold block">
                      {order.customer_phone || "-"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/30 pt-3 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                      Nomor Tiket / Job
                    </span>
                    <span className="font-mono font-black text-foreground text-xs bg-muted px-2 py-0.5 rounded border border-border inline-block">
                      {order.job_number}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                      Desainer / CS
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <LuUser size={10} className="text-primary" />
                      </div>
                      <span className="font-bold text-foreground text-xs">
                        {order.designer_name || "Staff"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 col-span-2 border-t border-border/30 pt-2.5">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                      Tanggal Order
                    </span>
                    <div className="flex items-center justify-between gap-1.5 text-xs text-foreground font-bold">
                      <div className="flex items-center gap-1.5">
                        <LuCalendar size={13} className="text-primary/70" />
                        <span>{formatDateTime(order.created_at)}</span>
                      </div>

                      {order.status === "CANCELLED" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border bg-rose-500/10 text-rose-600 border-rose-500/20">
                          <LuCircleX size={10} />
                          Dibatalkan
                        </span>
                      ) : order.status === "REFUND" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border bg-purple-500/10 text-purple-600 border-purple-500/20">
                          <LuRotateCcw size={10} />
                          Refund
                        </span>
                      ) : outstanding === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          <LuCircleCheck size={10} />
                          Lunas
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border bg-amber-500/10 text-amber-600 border-amber-500/20">
                          <LuClock size={10} />
                          Sebagian (DP)
                        </span>
                      )}
                    </div>
                  </div>

                  {order.deadline && (
                    <div className="space-y-0.5 col-span-2 border-t border-border/30 pt-2">
                      <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider block">
                        Deadline
                      </span>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        {order.deadline}
                      </span>
                    </div>
                  )}

                  {Boolean(order.notes?.trim() && order.notes?.trim() !== "-") && (
                    <div className="space-y-0.5 col-span-2 border-t border-border/30 pt-2">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                        Memo Transaksi
                      </span>
                      <p className="text-xs font-semibold text-foreground leading-relaxed">
                        {order.notes.trim()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Item List */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <LuPackage size={13} className="text-primary" />
                  Daftar Item Cetak ({items.length})
                </span>

                <div className="border border-border/40 rounded-xl overflow-hidden divide-y divide-border/20 bg-background">
                  {items.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground italic">
                      Tidak ada rincian item produk pada nota ini.
                    </div>
                  ) : (
                    items.map((item, idx) => {
                      const hasDimension =
                        (item.uom === "m2" && item.lengthM && item.widthM) ||
                        (item.uom === "m_lari" && item.lengthM);

                      const dimensionText =
                        item.uom === "m2"
                          ? `${item.lengthM} × ${item.widthM} m`
                          : `${item.lengthM} m`;

                      return (
                        <div
                          key={item.id || idx}
                          className="p-3 bg-card flex justify-between gap-3 text-xs font-semibold hover:bg-muted/10 transition-colors"
                        >
                          <div className="space-y-1">
                            <span className="text-foreground block font-bold">
                              {idx + 1}. {item.productName}
                            </span>

                            {item.notes && item.notes !== "-" && (
                              <p className="text-[10px] text-muted-foreground font-medium">
                                Spesifikasi: {item.notes}
                              </p>
                            )}

                            {hasDimension && (
                              <p className="text-[10px] text-muted-foreground font-mono">
                                Dimensi: {dimensionText}
                              </p>
                            )}

                            <span className="text-[10px] text-primary font-bold block">
                              {formatCurrency(item.pricePerUnit)} × {item.qty}{" "}
                              {item.uom === "m2" || item.uom === "m_lari" ? "pcs" : (item.uom || "Qty")}
                              {item.additionalCost > 0 && ` (+Finishing: ${formatCurrency(item.additionalCost)})`}
                            </span>
                          </div>

                          <span className="font-mono font-black text-foreground shrink-0 self-center">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Payments Timeline & Financial Summary */}
            <div className="flex flex-col h-full overflow-hidden space-y-4 justify-between">
              {/* Payment Timeline */}
              <div className="flex flex-col flex-1 min-h-0 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block shrink-0">
                  Riwayat Transaksi Masuk ({groupedPayments.length})
                </span>

                <div className="flex-1 bg-muted/15 border border-border/40 rounded-2xl p-4 overflow-y-auto">
                  {isLoadingPayments ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-2 py-8">
                      <LuLoader className="animate-spin text-primary" size={20} />
                      <span className="text-xs font-semibold text-muted-foreground">
                        Memuat riwayat pembayaran...
                      </span>
                    </div>
                  ) : groupedPayments.length > 0 ? (
                    <div className="relative border-l border-border pl-4 space-y-4">
                      {groupedPayments.map((pay, idx) => {
                        const isRefund = pay.payment_type === "REFUND";
                        return (
                          <div key={pay.id || idx} className="relative flex flex-col gap-1">
                            <div
                              className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ${
                                isRefund
                                  ? "bg-rose-500 ring-rose-100 dark:ring-rose-950/40"
                                  : "bg-emerald-500 ring-emerald-100 dark:ring-emerald-950/40"
                              }`}
                            />
                            <div className="flex justify-between items-start gap-3 text-xs font-semibold">
                              <div>
                                <span className="text-foreground font-black block">
                                  {isRefund
                                    ? "Refund / Pengembalian Dana"
                                    : pay.payment_type === "DOWN_PAYMENT"
                                      ? "Pembayaran Awal (DP)"
                                      : pay.payment_type === "FULL_PAYMENT"
                                        ? "Lunas / Pembayaran Langsung"
                                        : `Pelunasan #${pay.payment_number}`}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
                                  {pay.created_at} • Kasir: {pay.cashier_name}
                                </span>
                              </div>
                              <span
                                className={`font-mono font-black shrink-0 ${
                                  isRefund ? "text-rose-600" : "text-emerald-600"
                                }`}
                              >
                                {isRefund ? "-" : "+"} {formatCurrency(pay.totalAmount)}
                              </span>
                            </div>

                            <div className="mt-1 pl-3 border-l-2 border-border/40 space-y-1">
                              {pay.details.map((detail) => (
                                <div
                                  key={detail.id}
                                  className="flex justify-between items-center text-[10px] font-semibold"
                                >
                                  <span className="text-muted-foreground uppercase tracking-wider">
                                    {detail.payment_method}
                                  </span>
                                  <span className="font-mono text-foreground">
                                    {formatCurrency(detail.amount)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {outstanding > 0 && (
                        <div className="relative pt-1">
                          <div className="absolute -left-[21px] top-2 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950/40 animate-pulse" />
                          <div className="flex justify-between items-start gap-3 text-xs font-semibold">
                            <div>
                              <span className="text-amber-600 dark:text-amber-400 font-black block">
                                Sisa Tagihan (Piutang)
                              </span>
                              <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
                                Menunggu pelunasan
                              </span>
                            </div>
                            <span className="font-mono font-black text-rose-500 shrink-0">
                              {formatCurrency(outstanding)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-1.5">
                      <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto text-rose-500">
                        <LuClock size={16} />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground block">
                        Belum ada riwayat pembayaran
                      </span>
                      <span className="text-[10px] text-muted-foreground block font-medium max-w-[200px] mx-auto">
                        Nota berstatus piutang belum dibayar (UNPAID).
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Summary Box */}
              <div className="border-t border-border/30 pt-3 space-y-2 text-xs font-semibold shrink-0">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Total Belanja</span>
                  <span className="font-mono font-bold text-foreground">
                    {formatCurrency(order.grand_total)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                  <span>Terbayar</span>
                  <span className="font-mono font-bold">
                    {formatCurrency(order.amount_paid)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-dashed border-border/40 pt-2 font-black">
                  <span className="text-primary uppercase tracking-wider text-[10px]">
                    Sisa Tagihan
                  </span>
                  <span
                    className={`font-mono text-sm ${
                      outstanding > 0 ? "text-rose-500" : "text-emerald-600"
                    }`}
                  >
                    {outstanding > 0 ? formatCurrency(outstanding) : "LUNAS"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end pt-3 border-t border-border/30 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs font-bold h-10 px-5"
            >
              Tutup
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};

