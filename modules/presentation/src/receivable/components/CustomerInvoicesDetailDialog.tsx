import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Button } from "@erp-digital-printing/ui/Button";
import {
  LuReceipt,
  LuClock,
  LuBanknote,
  LuCircleCheck,
  LuMessageCircle,
  LuChevronDown,
  LuChevronUp,
  LuPackage,
  LuLoader,
} from "@erp-digital-printing/ui/icons";
import { useOrderDI } from "@presentation/order/hooks/useOrderDI";
import { orderKeys } from "@infrastructure/order/keys";
import type {
  CustomerReceivableModel,
  ReceivableInvoiceItemModel,
} from "@core/receivable/domains/models/receivable.model";

interface CustomerInvoicesDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerReceivableModel | null;
  onPayInvoice: (customer: CustomerReceivableModel, invoice: ReceivableInvoiceItemModel) => void;
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

interface CustomerInvoiceRowProps {
  invoice: ReceivableInvoiceItemModel;
  customer: CustomerReceivableModel;
  isExpanded: boolean;
  onToggle: () => void;
  onPayInvoice: (customer: CustomerReceivableModel, invoice: ReceivableInvoiceItemModel) => void;
}

const CustomerInvoiceRow: React.FC<CustomerInvoiceRowProps> = ({
  invoice,
  customer,
  isExpanded,
  onToggle,
  onPayInvoice,
}) => {
  const { getOrderByIdUseCase } = useOrderDI();
  const isPaid = invoice.remainingAmount === 0;

  const {
    data: orderDetail,
    isLoading: isLoadingItems,
    isError: isErrorItems,
  } = useQuery({
    queryKey: orderKeys.detail(invoice.id),
    queryFn: () => getOrderByIdUseCase.execute(invoice.id),
    enabled: isExpanded,
    staleTime: 5 * 60 * 1000,
  });

  const orderItems = orderDetail?.order_items ?? [];

  return (
    <div
      className={`border rounded-xl transition-all overflow-hidden ${
        isPaid
          ? "border-emerald-500/20 bg-emerald-500/5"
          : invoice.isOverdue
            ? "border-rose-500/30 bg-rose-500/5"
            : "border-border/60 bg-background"
      }`}
    >
      {/* Nota Header Row */}
      <div
        className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-muted/30"
        onClick={onToggle}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs text-foreground">
              {invoice.invoiceNumber}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              ({invoice.jobNumber})
            </span>
            {isPaid ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <LuCircleCheck size={11} />
                Lunas
              </span>
            ) : invoice.amountPaid > 0 ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <LuClock size={11} />
                Sebagian (DP)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                Belum Dibayar
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground line-clamp-1">
            {invoice.notes || "Pekerjaan cetak digital"}
          </p>
          <span className="text-[10px] text-muted-foreground block">
            Tgl Order: {formatOrderDate(invoice.orderDate)}
          </span>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-border/30">
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground block uppercase font-medium">
              Sisa Tagihan
            </span>
            <span
              className={`font-mono font-bold text-sm ${
                isPaid ? "text-emerald-600" : "text-rose-500"
              }`}
            >
              {isPaid ? "LUNAS" : formatCurrency(invoice.remainingAmount)}
            </span>
            <span className="text-[10px] text-muted-foreground block font-mono">
              Total: {formatCurrency(invoice.totalAmount)}
            </span>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {!isPaid && (
              <Button
                size="sm"
                onClick={() => onPayInvoice(customer, invoice)}
                className="h-8 px-3 rounded-lg text-xs font-bold bg-primary text-primary-foreground shadow-sm flex items-center gap-1"
              >
                <LuBanknote size={14} />
                Bayar
              </Button>
            )}

            <button
              type="button"
              onClick={onToggle}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-border/60 hover:bg-muted text-muted-foreground"
              title="Lihat rincian item & riwayat pembayaran nota ini"
            >
              {isExpanded ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details: Items & Payment History */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-2 border-t border-border/30 bg-muted/20 space-y-3">
          {/* Section 1: Item yang Dibeli */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <LuPackage size={13} className="text-primary" />
                Item yang Dibeli ({isLoadingItems ? "..." : orderItems.length})
              </span>
            </div>

            {isLoadingItems ? (
              <div className="p-3 rounded-lg border border-border/40 bg-background/50 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <LuLoader className="animate-spin text-primary" size={14} />
                <span>Memuat rincian item nota...</span>
              </div>
            ) : isErrorItems ? (
              <div className="p-2.5 rounded-lg border border-border/40 bg-background/50 text-xs text-muted-foreground flex items-center justify-between">
                <span>Rincian item detail belum tersedia.</span>
                {invoice.notes && (
                  <span className="text-[11px] font-medium text-foreground italic">
                    "{invoice.notes}"
                  </span>
                )}
              </div>
            ) : orderItems.length === 0 ? (
              <div className="p-2.5 rounded-lg border border-border/40 bg-background/50 text-xs text-muted-foreground">
                {invoice.notes ? (
                  <span>Catatan: {invoice.notes}</span>
                ) : (
                  <span className="italic">Tidak ada rincian item spesifik pada nota ini.</span>
                )}
              </div>
            ) : (
              <div className="border border-border/40 rounded-xl overflow-hidden divide-y divide-border/20 bg-background">
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

          {/* Section 2: Riwayat Pembayaran Nota */}
          <div className="space-y-1.5 pt-2 border-t border-border/30">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <LuReceipt size={13} className="text-emerald-600" />
              Riwayat Pembayaran Nota ({invoice.payments.length})
            </span>

            {invoice.payments.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-1">
                Belum ada pembayaran yang dicatat untuk nota ini.
              </p>
            ) : (
              <div className="space-y-1.5">
                {invoice.payments.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg border border-border/50 bg-background flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-foreground">
                        Pembayaran #{idx + 1}
                      </span>
                      <span className="text-muted-foreground ml-2 uppercase text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded">
                        {p.paymentMethod}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatDateTime(p.paymentDate)} • Kasir: {p.cashierName}
                        {p.notes && ` • "${p.notes}"`}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-emerald-600">
                      +{formatCurrency(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const CustomerInvoicesDetailDialog: React.FC<CustomerInvoicesDetailDialogProps> = ({
  isOpen,
  onClose,
  customer,
  onPayInvoice,
}) => {
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  if (!customer) return null;

  const toggleExpand = (invoiceId: string) => {
    setExpandedInvoiceId((prev) => (prev === invoiceId ? null : invoiceId));
  };

  const handleSendWhatsAppRecap = () => {
    const phone = customer.customerPhone.replace(/^0/, "62");
    const unpaidInvoices = customer.invoices.filter((inv) => inv.remainingAmount > 0);

    let invoiceLines = "";
    unpaidInvoices.forEach((inv, idx) => {
      // NOTE: Jika kedepan klien butuh jatuh tempo di WA, tambahkan: (Tempo: ${inv.dueDate})
      invoiceLines += `\n${idx + 1}. *${inv.invoiceNumber}* (${inv.jobNumber}) - Sisa: ${formatCurrency(inv.remainingAmount)}`;
    });

    const message = `Halo *${customer.customerName}*, berikut kami sampaikan rekap tagihan piutang Anda sebanyak *${unpaidInvoices.length} nota* dengan total sisa *${formatCurrency(customer.totalRemaining)}*:\n${invoiceLines}\n\nMohon konfirmasi jadwal pelunasan atau transfer ke rekening kami. Terima kasih atas kerjasamanya! 🙏`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      className="max-w-4xl w-full p-6 rounded-2xl border-border/50 bg-card text-foreground max-h-[90vh] flex flex-col"
    >
      <div className="space-y-5 flex flex-col min-h-0 flex-1">
        {/* Header - Beri pr-12 sm:pr-14 agar tidak tabrakan dengan tombol Close Dialog (LuX) */}
        <div className="border-b border-border/30 pb-4 shrink-0 pr-12 sm:pr-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <LuReceipt size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    {customer.customerName}
                  </h2>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      customer.customerType === "RESELLER"
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {customer.customerType}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  No. Telepon / WA: <span className="font-semibold text-foreground">{customer.customerPhone}</span>
                </p>
              </div>
            </div>

            {/* Quick WA Button */}
            {customer.totalRemaining > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSendWhatsAppRecap}
                className="rounded-xl text-xs font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
              >
                <LuMessageCircle size={15} />
                Kirim Rekap WA ({customer.unpaidInvoicesCount} Nota)
              </Button>
            )}
          </div>
        </div>

        {/* Customer Totals Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-muted/30 rounded-xl border border-border/40 text-center shrink-0">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase block">
              Total Nota
            </span>
            <span className="text-xs font-bold text-foreground">
              {customer.invoices.length} Nota ({customer.unpaidInvoicesCount} Belum Lunas)
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase block">
              Total Nilai Belanja
            </span>
            <span className="text-xs font-mono font-bold text-foreground">
              {formatCurrency(customer.totalAmount)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase block">
              Total Terbayar
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600">
              {formatCurrency(customer.totalPaid)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-rose-500 uppercase block">
              Total Sisa Piutang
            </span>
            <span className="text-sm font-mono font-black text-rose-500">
              {formatCurrency(customer.totalRemaining)}
            </span>
          </div>
        </div>

        {/* Invoices List / Table */}
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Daftar Rincian Nota Transaksi ({customer.invoices.length})
            </span>
            <span className="text-[11px] text-muted-foreground">
              Klik baris nota untuk melihat histori cicilan
            </span>
          </div>

          <div className="space-y-2.5">
            {customer.invoices.map((inv) => (
              <CustomerInvoiceRow
                key={inv.id}
                invoice={inv}
                customer={customer}
                isExpanded={expandedInvoiceId === inv.id}
                onToggle={() => toggleExpand(inv.id)}
                onPayInvoice={onPayInvoice}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-border/30 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-bold"
          >
            Tutup
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

