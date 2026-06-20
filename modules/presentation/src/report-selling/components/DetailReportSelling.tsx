import React, { useMemo } from "react";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Button } from "@erp-digital-printing/ui/Button";
import {
  LuReceipt,
  LuUser,
  LuCalendar,
  LuPrinter,
  LuClock,
  LuScissors,
  LuCoins,
} from "@erp-digital-printing/ui/icons";
import { useQuery } from "@tanstack/react-query";
import { useOrderDI } from "@presentation/order/hooks/useOrderDI";
import { orderKeys } from "@infrastructure/order/keys";
import type {
  OrderModel,
  OrderPaymentModel,
} from "@core/order/domains/models/order.model";
import type { AppError } from "@core/shared/errors/domain.error";

interface DetailReportSellingProps {
  isOpen: boolean;
  onClose: () => void;
  sale: OrderModel | null;
}

const DetailReportSelling: React.FC<DetailReportSellingProps> = ({
  isOpen,
  onClose,
  sale,
}) => {
  const { getOrderPaymentsUseCase } = useOrderDI();

  const { data: payments, isLoading: isLoadingPayments } = useQuery<
    OrderPaymentModel[],
    AppError
  >({
    queryKey: orderKeys.payments(sale?.id ?? ""),
    queryFn: () => getOrderPaymentsUseCase.execute(sale!.id),
    enabled: isOpen && !!sale?.id,
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const groupedPayments = useMemo(() => {
    if (!payments) return [];

    // Group by payment_number
    const map = new Map<number, typeof payments>();
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
        let created_at = "";
        if (pays[0]?.created_at) {
          try {
            created_at = new Date(pays[0].created_at).toLocaleString("id-ID", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
          } catch (error) {
            // Fallback to empty string if date format fails
          }
        }
        const cashier_name = pays[0]?.cashier_name || "Sistem";
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

  const items = useMemo(() => {
    if (!sale) return [];
    return (sale.order_items ?? []).map((item) => ({
      productName: item.variant_name
        ? `${item.product_name} (${item.variant_name})`
        : item.product_name,
      notes: item.production_notes || "-",
      pricePerUnit: item.price_per_unit || 0,
      qty: item.quantity,
      subtotal: item.subtotal || 0,
    }));
  }, [sale]);

  if (!sale) return null;

  const outstanding = sale.grand_total - sale.amount_paid;
  const customerType: string = sale.reseller_id ? "reseller" : "retail";

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] w-full max-w-4xl flex flex-col"
      showCloseButton={true}
    >
      <div className="space-y-5 flex flex-col overflow-hidden h-[75vh] max-h-[75vh]">
        {/* Dialog Header */}
        <div className="flex flex-col gap-1 border-b border-border/30 pb-4 shrink-0">
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <LuReceipt size={20} className="text-primary" />
            Detail Rincian Belanja & Finansial
          </h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Invoice:{" "}
            <span className="font-mono text-foreground font-bold">
              {sale.invoice_number || sale.job_number}
            </span>
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          {/* LEFT COLUMN: Dokumen, Produk & Desain (Scrollable) */}
          <div className="flex flex-col h-full overflow-y-auto pr-1 scrollbar-thin space-y-5">
            {/* Utama & Pelanggan Box */}
            <div className="bg-muted/30 p-4 rounded-2xl border border-border/40 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                    Pelanggan
                  </span>
                  <span className="font-bold text-foreground text-xs block">
                    {sale.customer_name || "Customer Walk In"}
                  </span>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border leading-none ${
                      customerType === "corporate"
                        ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50"
                        : customerType === "reseller"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50"
                          : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/50"
                    }`}
                  >
                    {customerType === "reseller"
                      ? "Biro / Reseller"
                      : customerType === "corporate"
                        ? "Corporate"
                        : "Retail"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                    Desainer Pembuat Tiket
                  </span>
                  <span className="font-bold text-foreground text-xs block">
                    {sale.designer_name || "CS"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold block">
                    Staff Pembuat Order
                  </span>
                </div>
              </div>

              {/* Info Tiket Kerja (Desain) */}
              <div className="border-t border-border/30 pt-3 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                    Nomor Tiket / Job
                  </span>
                  <span className="font-mono font-black text-foreground text-xs bg-muted px-2 py-0.5 rounded border border-border inline-block">
                    {sale.job_number}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                    Staff Kasir
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <LuUser size={10} className="text-primary" />
                    </div>
                    <span className="font-bold text-foreground text-xs">
                      {groupedPayments[0]?.cashier_name || "Sistem"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 col-span-2 border-t border-border/30 pt-3">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                    Tanggal Transaksi
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-foreground font-bold">
                    <LuCalendar size={13} className="text-primary/70" />
                    {(() => {
                      try {
                        return new Date(sale.created_at).toLocaleString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          },
                        );
                      } catch (e) {
                        return sale.created_at;
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Item List */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Daftar Item Cetak
              </span>
              <div className="border border-border/40 rounded-xl overflow-hidden divide-y divide-border/20">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-card flex justify-between gap-4 text-xs font-semibold hover:bg-muted/10 transition-colors"
                  >
                    <div>
                      <span className="text-foreground block font-bold">
                        {idx + 1}. {item.productName}
                      </span>
                      {item.notes && item.notes !== "-" && (
                        <span className="text-[10px] text-muted-foreground block font-medium mt-1">
                          Spesifikasi: {item.notes}
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
          </div>

          {/* RIGHT COLUMN: Finansial & Riwayat Pembayaran (Flex Layout, Fixed Summary Bottom) */}
          <div className="flex flex-col h-full overflow-hidden space-y-5 justify-between">
            {/* Timeline Pembayaran */}
            <div className="flex flex-col flex-1 min-h-0 space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block shrink-0">
                Riwayat Transaksi Masuk
              </span>
              <div className="flex-1 bg-muted/15 border border-border/40 rounded-2xl p-4 overflow-y-auto scrollbar-thin">
                {isLoadingPayments ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-2">
                    <div className="relative w-8 h-8">
                      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Memuat riwayat pembayaran...
                    </span>
                  </div>
                ) : groupedPayments.length > 0 ? (
                  <div className="relative border-l border-border pl-4 space-y-4">
                    {groupedPayments.map((pay, idx) => (
                      <div
                        key={pay.id}
                        className="relative flex flex-col gap-1.5"
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

                    {/* Sisa Piutang Info in Timeline */}
                    {outstanding > 0 && (
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950/40 animate-pulse" />
                        <div className="flex justify-between items-start gap-4 text-xs font-semibold">
                          <div>
                            <span className="text-amber-600 dark:text-amber-400 font-black block">
                              Sisa Tagihan (Piutang)
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
                              Menunggu pelunasan
                            </span>
                          </div>
                          <span className="font-black text-rose-500 shrink-0">
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
                    <span className="text-[9px] text-muted-foreground block font-medium max-w-[200px] mx-auto">
                      Transaksi ini berstatus piutang belum dibayar (UNPAID)
                      atau baru di-input.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary Box (Fixed at the Bottom) */}
            <div className="border-t border-border/30 pt-4 space-y-2.5 text-xs font-semibold shrink-0">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Total Belanja</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(sale.grand_total)}
                </span>
              </div>
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                <span>Terbayar</span>
                <span className="font-black">
                  {formatCurrency(sale.amount_paid)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-dashed border-border/30 pt-2 font-black">
                <span className="text-primary uppercase tracking-wider text-[10px]">
                  Sisa Tagihan
                </span>
                <span className="text-sm text-rose-500">
                  {outstanding > 0 ? formatCurrency(outstanding) : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="flex justify-end gap-2.5 border-t border-border/20 pt-4 shrink-0">
          <Button
            variant="outline"
            className="rounded-xl text-xs font-bold px-4 border-border/50 h-10 hover:bg-muted"
            onClick={onClose}
          >
            Tutup
          </Button>
          <Button
            className="rounded-xl text-xs font-black px-4 bg-primary text-primary-foreground flex items-center gap-1.5 h-10 shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
            onClick={() => {
              alert(
                `Mencetak struk untuk nota ${sale.invoice_number || sale.job_number}...`,
              );
            }}
          >
            <LuPrinter size={13} />
            Cetak Struk
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default DetailReportSelling;
