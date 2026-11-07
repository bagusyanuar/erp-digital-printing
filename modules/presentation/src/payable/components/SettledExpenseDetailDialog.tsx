import React from "react";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Button } from "@erp-digital-printing/ui/Button";
import {
  LuReceipt,
  LuCircleCheck,
  LuCalendar,
} from "@erp-digital-printing/ui/icons";
import type { SettledExpensePayableModel } from "@core/payable/domains/models/payable.model";

interface SettledExpenseDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: SettledExpensePayableModel | null;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  try {
    const datePart = dateStr.split(" ")[0];
    if (!datePart) return dateStr;
    const parts = datePart.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export const SettledExpenseDetailDialog: React.FC<SettledExpenseDetailDialogProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  if (!item) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      className="max-w-xl w-full p-6 sm:p-7 rounded-2xl border-border/50 bg-card text-foreground"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-border/30 pb-4 pr-12">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <LuCircleCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Detail Nota Terlunasi
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  LUNAS
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.expenseNumber} {item.referenceNumber ? `• Ref: ${item.referenceNumber}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Vendor Info */}
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Vendor / Supplier:</span>
            <span className="font-semibold text-foreground">{item.vendorName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Kontak / Telepon:</span>
            <span className="font-mono text-foreground">{item.vendorPhone}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Tgl Transaksi:</span>
            <span className="text-foreground">{formatDate(item.expenseDate)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Tgl Pelunasan:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatDate(item.settledDate)}
            </span>
          </div>
        </div>

        {/* Total & Summary */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block uppercase tracking-wider">
              Total Tagihan Lunas
            </span>
            <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
              Sisa Hutang: Rp 0
            </span>
          </div>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(item.totalAmount)}
          </span>
        </div>

        {/* Payment History */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Riwayat Pembayaran ({item.payments.length})
          </h4>
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {item.payments.map((p, idx) => (
              <div
                key={p.id || idx}
                className="p-2.5 rounded-lg border border-border/40 bg-card text-xs flex justify-between items-center"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-foreground flex items-center gap-2">
                    <span>{formatCurrency(p.amount)}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground uppercase">
                      {p.paymentMethod}
                    </span>
                    {p.sourceAccount && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        • {p.sourceAccount}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {p.paymentDate} • Oleh {p.recordedBy}
                  </div>
                </div>
                {p.notes && (
                  <span className="text-[11px] text-muted-foreground italic max-w-xs break-words whitespace-pre-wrap text-right">
                    "{p.notes}"
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-border/30">
          <Button variant="secondary" onClick={onClose} className="rounded-md">
            Tutup
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
