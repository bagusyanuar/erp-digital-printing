import React, { useState } from "react";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Button } from "@erp-digital-printing/ui/Button";
import {
  LuCircleCheck,
  LuBanknote,
  LuCreditCard,
  LuQrCode,
} from "@erp-digital-printing/ui/icons";
import { InvoiceDetailDialog } from "@presentation/invoice/components/InvoiceDetailDialog";
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
  const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false);

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
              <div className="flex items-center gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => setIsInvoiceDetailOpen(true)}
                  className="font-mono font-bold text-xs text-foreground bg-muted hover:bg-primary/20 hover:text-primary hover:border-primary/50 px-2 py-0.5 rounded-lg border border-border/50 inline-block text-left cursor-pointer transition-all duration-150 active:scale-95"
                  title="Klik untuk melihat Detail Nota Lengkap"
                >
                  {invoice.invoiceNumber}
                </button>
                <span className="text-xs text-muted-foreground font-mono">
                  • {invoice.jobNumber}
                </span>
              </div>
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

        {/* Payment History Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Rincian Pembayaran yang Masuk ({invoice.payments.length})
            </span>
            <button
              type="button"
              onClick={() => setIsInvoiceDetailOpen(true)}
              className="text-[11px] text-primary hover:underline font-semibold"
            >
              Lihat Rincian Item Nota &rarr;
            </button>
          </div>

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

      {/* Invoice Detail Dialog Popup */}
      <InvoiceDetailDialog
        isOpen={isInvoiceDetailOpen}
        onClose={() => setIsInvoiceDetailOpen(false)}
        orderId={invoice.id}
      />
    </Dialog>
  );
};
