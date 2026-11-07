import React, { useState } from "react";
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
  LuTriangleAlert,
  LuCalendar,
} from "@erp-digital-printing/ui/icons";
import type {
  VendorPayableModel,
  PayableExpenseItemModel,
} from "@core/payable/domains/models/payable.model";

interface VendorExpensesDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: VendorPayableModel | null;
  onPayExpense: (vendor: VendorPayableModel, expense: PayableExpenseItemModel) => void;
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

export const VendorExpensesDetailDialog: React.FC<VendorExpensesDetailDialogProps> = ({
  isOpen,
  onClose,
  vendor,
  onPayExpense,
}) => {
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);

  if (!vendor) return null;

  const toggleExpand = (expenseId: string) => {
    setExpandedExpenseId((prev) => (prev === expenseId ? null : expenseId));
  };

  const handleSendVendorWa = () => {
    const phone = vendor.vendorPhone.replace(/^0/, "62");
    const unpaidExpenses = vendor.expenses.filter((e) => e.remainingAmount > 0);

    let expenseLines = "";
    unpaidExpenses.forEach((exp, idx) => {
      expenseLines += `\n${idx + 1}. *${exp.expenseNumber}* (${exp.referenceNumber || "-"}) - Sisa: ${formatCurrency(exp.remainingAmount)}`;
    });

    const message = `Halo *${vendor.vendorName}*, konfirmasi tagihan tempo Anda sebanyak *${unpaidExpenses.length} nota* dengan total sisa hutang *${formatCurrency(vendor.totalRemaining)}*:\n${expenseLines}\n\nTerima kasih.`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      className="max-w-3xl w-full p-6 sm:p-7 rounded-2xl border-border/50 bg-card text-foreground"
    >
      <div className="space-y-6">
        {/* Header Dialog */}
        <div className="border-b border-border/30 pb-4 pr-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                  {vendor.vendorCategory}
                </span>
                <span className="text-xs text-muted-foreground">
                  {vendor.expenses.length} Total Nota
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>{vendor.vendorName}</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                No. Telp / WhatsApp: {vendor.vendorPhone}
              </p>
            </div>

            {vendor.totalRemaining > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30 self-start sm:self-center"
                onClick={handleSendVendorWa}
              >
                <LuMessageCircle size={14} />
                <span>Kirim Rekap WA</span>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/40 text-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Total Pembelian
            </span>
            <span className="text-sm sm:text-base font-bold text-foreground">
              {formatCurrency(vendor.totalAmount)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Total Terbayar
            </span>
            <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(vendor.totalPaid)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 block">
              Sisa Hutang
            </span>
            <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-500">
              {formatCurrency(vendor.totalRemaining)}
            </span>
          </div>
        </div>

        {/* List of Invoices / Expenses */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Rincian Nota Tagihan Pengeluaran
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              {vendor.unpaidExpensesCount} nota belum lunas
            </span>
          </div>

          <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1">
            {vendor.expenses.map((exp) => {
              const isOverdue = exp.isOverdue && exp.remainingAmount > 0;
              const isExpanded = expandedExpenseId === exp.id;
              const hasPayments = exp.payments && exp.payments.length > 0;

              return (
                <div
                  key={exp.id}
                  className={`border rounded-xl transition-all duration-200 ${
                    exp.remainingAmount === 0
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : isOverdue
                        ? "border-rose-500/30 bg-rose-500/5"
                        : "border-border/50 bg-card"
                  }`}
                >
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Info Nota */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">
                          {exp.expenseNumber}
                        </span>
                        {exp.referenceNumber && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                            Ref: {exp.referenceNumber}
                          </span>
                        )}
                        <span className="text-xs font-medium text-muted-foreground">
                          • {exp.categoryName}
                        </span>
                        {exp.remainingAmount === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <LuCircleCheck size={11} />
                            Lunas
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <LuTriangleAlert size={11} />
                            Overdue ({exp.daysOverdue}h)
                          </span>
                        ) : exp.amountPaid > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <LuClock size={11} />
                            Sebagian
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground border border-border/40">
                            <LuClock size={11} />
                            Belum Dibayar
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <LuCalendar size={12} />
                          Tgl: {formatDate(exp.expenseDate)}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <LuClock size={12} />
                          Jatuh Tempo: {formatDate(exp.dueDate)}
                        </span>
                      </div>

                      {exp.notes && (
                        <p className="text-xs text-muted-foreground/90 italic pt-0.5">
                          "{exp.notes}"
                        </p>
                      )}
                    </div>

                    {/* Nominal & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                      <div className="text-left sm:text-right">
                        <div className="text-xs text-muted-foreground">
                          Total: {formatCurrency(exp.totalAmount)}
                        </div>
                        <div className="text-sm font-black text-amber-600 dark:text-amber-500">
                          Sisa: {formatCurrency(exp.remainingAmount)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {exp.remainingAmount > 0 && (
                          <Button
                            size="sm"
                            className="h-8 text-xs font-semibold gap-1 bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 rounded-md"
                            onClick={() => onPayExpense(vendor, exp)}
                          >
                            <LuBanknote size={14} />
                            <span>Bayar Nota</span>
                          </Button>
                        )}

                        {hasPayments && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground"
                            onClick={() => toggleExpand(exp.id)}
                            title="Riwayat Cicilan"
                          >
                            {isExpanded ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Riwayat Cicilan / Pembayaran (Expanded) */}
                  {isExpanded && hasPayments && (
                    <div className="px-4 pb-3.5 pt-1 border-t border-border/30 bg-muted/10 space-y-2">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Riwayat Pembayaran Cicilan ({exp.payments.length})
                      </span>
                      <div className="space-y-1.5">
                        {exp.payments.map((pay) => (
                          <div
                            key={pay.id}
                            className="flex items-center justify-between text-xs p-2 rounded-lg bg-background border border-border/40"
                          >
                            <div className="space-y-0.5">
                              <div className="font-semibold text-foreground flex items-center gap-2">
                                <span>{formatCurrency(pay.amount)}</span>
                                <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                                  {pay.paymentMethod}
                                </span>
                                {pay.sourceAccount && (
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    • {pay.sourceAccount}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {pay.paymentDate} • Oleh {pay.recordedBy}
                              </div>
                            </div>
                            {pay.notes && (
                              <div className="text-[11px] text-muted-foreground italic text-right max-w-[200px] truncate">
                                "{pay.notes}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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

