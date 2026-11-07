import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Button } from "@erp-digital-printing/ui/Button";
import {
  LuCircleCheck,
  LuBanknote,
  LuCreditCard,
  LuQrCode,
  LuPackage,
  LuLoader,
} from "@erp-digital-printing/ui/icons";
import { useOrderDI } from "@presentation/order/hooks/useOrderDI";
import { orderKeys } from "@infrastructure/order/keys";
import type { SettledInvoiceReceivableModel } from "@core/receivable/domains/models/receivable.model";

interface SettledInvoiceDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: SettledInvoiceReceivableModel | null;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

const formatOrderDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  try {
    const parts = dateStr.split(" ")[0]!.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return "-";
  try {
    const [datePart, timePart] = dateStr.split(" ");
    if (datePart) {
      const parts = datePart.split("-");
      if (parts.length === 3) {
        const [year, month, day] = parts;
        const formattedDate = `${day}/${month}/${year}`;
        if (timePart) {
          const [h, m] = timePart.split(":");
          return `${formattedDate}, ${h}:${m}`;
        }
        return formattedDate;
      }
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export const SettledInvoiceDetailDialog: React.FC<SettledInvoiceDetailDialogProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const { getOrderByIdUseCase } = useOrderDI();
  const invoiceId = invoice?.id ?? "";

  const {
    data: orderDetail,
    isLoading: isLoadingItems,
    isError: isErrorItems,
  } = useQuery({
    queryKey: orderKeys.detail(invoiceId),
    queryFn: () => getOrderByIdUseCase.execute(invoiceId),
    enabled: isOpen && Boolean(invoiceId),
    staleTime: 5 * 60 * 1000,
  });

  const orderItems = orderDetail?.order_items ?? [];

  if (!invoice) return null;

  const getMethodBadge = (method: string) => {
    switch (method.toLowerCase()) {
      case "cash":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
            <LuBanknote size={12} />
            TUNAI
          </span>
        );
      case "transfer":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">
            <LuCreditCard size={12} />
            TRANSFER
          </span>
        );
      case "qris":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded">
            <LuQrCode size={12} />
            QRIS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
            SPLIT PAYMENT
          </span>
        );
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      className="max-w-xl w-full p-6 sm:p-7 rounded-3xl border-border/50 bg-card text-foreground"
    >
      <div className="space-y-6">
        {/* Header - Beri pr-12 agar badge dan judul tidak tabrakan dengan tombol Close (LuX) */}
        <div className="border-b border-border/30 pb-4 pr-12">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
              <LuCircleCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Bukti Pelunasan Piutang
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <LuCircleCheck size={12} />
                  LUNAS
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {invoice.invoiceNumber} • {invoice.jobNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Pelanggan:</span>
            <span className="font-bold text-foreground">
              {invoice.customerName} ({invoice.customerPhone})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Tanggal Order:</span>
            <span className="font-medium text-foreground">{formatOrderDate(invoice.orderDate)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Tanggal Pelunasan:</span>
            <span className="font-bold text-emerald-600">{formatDateTime(invoice.settledDate)}</span>
          </div>
          {invoice.notes && (
            <div className="pt-2 border-t border-border/30 text-muted-foreground">
              <span className="font-bold block text-[10px] uppercase text-muted-foreground">Catatan Pekerjaan:</span>
              <p className="mt-0.5">{invoice.notes}</p>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-border/30 text-sm font-bold">
            <span className="text-foreground">Total Tagihan Dilunasi:</span>
            <span className="font-mono text-emerald-600 text-base">
              {formatCurrency(invoice.totalAmount)}
            </span>
          </div>
        </div>

        {/* Purchased Items Section */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <LuPackage size={13} className="text-primary" />
            Item yang Dibeli ({isLoadingItems ? "..." : orderItems.length})
          </span>

          {isLoadingItems ? (
            <div className="p-3 rounded-xl border border-border/40 bg-background/50 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <LuLoader className="animate-spin text-primary" size={14} />
              <span>Memuat rincian item nota...</span>
            </div>
          ) : isErrorItems ? (
            <div className="p-2.5 rounded-xl border border-border/40 bg-background/50 text-xs text-muted-foreground flex items-center justify-between">
              <span>Rincian item detail belum tersedia.</span>
            </div>
          ) : orderItems.length === 0 ? (
            <div className="p-2.5 rounded-xl border border-border/40 bg-background/50 text-xs text-muted-foreground">
              <span className="italic">Tidak ada rincian item spesifik pada nota ini.</span>
            </div>
          ) : (
            <div className="border border-border/40 rounded-xl overflow-hidden divide-y divide-border/20 bg-background max-h-48 overflow-y-auto pr-1">
              {orderItems.map((item, idx) => {
                const displayName =
                  item.variant_name &&
                  item.variant_name.toLowerCase() !== "default" &&
                  item.variant_name.toLowerCase() !== item.product_name.toLowerCase()
                    ? `${item.product_name} (${item.variant_name})`
                    : item.product_name;

                const hasDimension =
                  (item.uom === "m2" && item.length_m && item.width_m) ||
                  (item.uom === "m_lari" && item.length_m);

                const dimensionText =
                  item.uom === "m2"
                    ? `${item.length_m} × ${item.width_m} m`
                    : `${item.length_m} m`;

                return (
                  <div
                    key={item.id || idx}
                    className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-foreground">
                          {idx + 1}. {displayName}
                        </span>
                        {hasDimension && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-muted rounded text-muted-foreground border border-border/40">
                            {dimensionText}
                          </span>
                        )}
                      </div>

                      {item.production_notes && item.production_notes !== "-" && (
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          Catatan: {item.production_notes}
                        </p>
                      )}

                      <span className="text-[10px] text-primary font-semibold block">
                        {formatCurrency(item.price_per_unit)} × {item.quantity}{" "}
                        {item.uom === "m2" || item.uom === "m_lari" ? "pcs" : (item.uom || "Qty")}
                        {item.additional_cost > 0 && ` (+Finishing: ${formatCurrency(item.additional_cost)})`}
                      </span>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="font-mono font-bold text-foreground text-xs block">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment History Timeline */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Rincian Pembayaran yang Masuk ({invoice.payments.length})
          </span>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {invoice.payments.map((p, idx) => (
              <div
                key={p.id}
                className="p-3 rounded-xl border border-border/50 bg-background flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">
                      Pembayaran #{idx + 1}
                    </span>
                    {getMethodBadge(p.paymentMethod)}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDateTime(p.paymentDate)} • Kasir: {p.cashierName}
                  </p>
                </div>
                <span className="font-mono font-bold text-emerald-600 text-sm">
                  +{formatCurrency(p.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end items-center pt-4 border-t border-border/30">
          {/* 
            NOTE KEDEPAN:
            Jika klien nantinya butuh cetak kuitansi / tanda terima pelunasan, aktifkan tombol ini:
            <Button
              type="button"
              variant="outline"
              onClick={() => alert(`Mencetak Bukti Pelunasan Nota ${invoice.invoiceNumber}...`)}
              className="rounded-xl text-xs font-bold flex items-center gap-1.5 h-10 border-border/60 hover:bg-muted mr-auto"
            >
              <LuPrinter size={15} />
              Cetak Kuitansi
            </Button>
          */}

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-bold h-10"
          >
            Tutup
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
