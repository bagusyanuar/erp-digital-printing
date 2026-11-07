import React, { useState } from "react";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Button } from "@erp-digital-printing/ui/Button";
import {
  LuCreditCard,
  LuBanknote,
  LuQrCode,
  LuReceipt,
  LuCircleCheck,
} from "@erp-digital-printing/ui/icons";
import type {
  CustomerReceivableModel,
  ReceivableInvoiceItemModel,
} from "@core/receivable/domains/models/receivable.model";
import type {
  PayCustomerInvoiceInput,
  PaymentSplitItem,
} from "@core/receivable/applications/inputs/receivable.input";

interface ReceivablePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerReceivableModel | null;
  invoice: ReceivableInvoiceItemModel | null;
  onSubmit: (input: PayCustomerInvoiceInput) => void;
  isLoading?: boolean;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export const ReceivablePaymentDialog: React.FC<ReceivablePaymentDialogProps> = ({
  isOpen,
  onClose,
  customer,
  invoice,
  onSubmit,
  isLoading = false,
}) => {
  const outstandingAmount = invoice?.remainingAmount ?? 0;

  // Single payment state
  const [payAmount, setPayAmount] = useState<number>(() => outstandingAmount);
  const [payMethod, setPayMethod] = useState<"cash" | "transfer" | "qris">("cash");

  // Split payment state
  const [isSplitPayment, setIsSplitPayment] = useState<boolean>(false);
  const [splitAmounts, setSplitAmounts] = useState<{
    cash: number;
    transfer: number;
    qris: number;
  }>({
    cash: 0,
    transfer: 0,
    qris: 0,
  });

  if (!customer || !invoice) return null;

  const totalSplitInput =
    (splitAmounts.cash || 0) +
    (splitAmounts.transfer || 0) +
    (splitAmounts.qris || 0);

  const remainingOutstanding = Math.max(0, outstandingAmount - totalSplitInput);
  const singleRemaining = Math.max(0, outstandingAmount - (payAmount || 0));

  const isInvalid = isSplitPayment
    ? totalSplitInput <= 0 || totalSplitInput > outstandingAmount
    : payAmount <= 0 || payAmount > outstandingAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalid) return;

    let payments: PaymentSplitItem[] = [];

    if (isSplitPayment) {
      if (splitAmounts.cash > 0) {
        payments.push({ paymentMethod: "cash", amount: splitAmounts.cash });
      }
      if (splitAmounts.transfer > 0) {
        payments.push({ paymentMethod: "transfer", amount: splitAmounts.transfer });
      }
      if (splitAmounts.qris > 0) {
        payments.push({ paymentMethod: "qris", amount: splitAmounts.qris });
      }
    } else {
      payments = [{ paymentMethod: payMethod, amount: payAmount }];
    }

    onSubmit({
      customerId: customer.id,
      invoiceId: invoice.id,
      payments,
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      className="max-w-xl w-full p-6 sm:p-7 rounded-3xl border-border/50 bg-card text-foreground"
    >
      <div className="space-y-5">
        {/* Header - Beri pr-12 agar tidak tabrakan dengan tombol Close Dialog (LuX) */}
        <div className="border-b border-border/30 pb-4 pr-12">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <LuReceipt size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Bayar Pelunasan Nota
              </h2>
              <p className="text-xs text-muted-foreground">
                Pelunasan piutang customer <strong className="text-foreground">{customer.customerName}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Summary Card */}
        <div className="bg-muted/30 border border-border/50 rounded-xl p-3.5 space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Nomor Nota / SPK:</span>
            <span className="font-mono font-bold text-foreground">
              {invoice.invoiceNumber} ({invoice.jobNumber})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Total Nilai Nota:</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(invoice.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1.5 border-t border-border/30 font-bold">
            <span className="text-rose-500">Sisa Tagihan Nota:</span>
            <span className="text-rose-500 font-mono text-sm">
              {formatCurrency(outstandingAmount)}
            </span>
          </div>
        </div>

        {/* Toggle Split Payment */}
        <div className="flex items-center justify-between bg-muted/20 border border-border/50 p-3 rounded-xl">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground">
              Split Pembayaran
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              Bayar menggunakan beberapa metode sekaligus
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsSplitPayment(!isSplitPayment);
              setPayAmount(outstandingAmount);
              setSplitAmounts({ cash: 0, transfer: 0, qris: 0 });
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isSplitPayment ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                isSplitPayment ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Payment Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSplitPayment ? (
            <>
              {/* Single Payment Mode */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Jumlah Pembayaran (Pelunasan)
                  </span>
                  <button
                    type="button"
                    onClick={() => setPayAmount(outstandingAmount)}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    Bayar Lunas Semua
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={outstandingAmount}
                    value={payAmount || ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setPayAmount(Math.min(val, outstandingAmount));
                    }}
                    placeholder="Masukkan nominal bayar..."
                    className="w-full h-11 pl-9 pr-3 text-sm font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  />
                </div>
              </div>

              {/* Payment Method chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Metode Pembayaran
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={payMethod === "cash" ? "default" : "outline"}
                    onClick={() => setPayMethod("cash")}
                    className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      payMethod === "cash"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted text-muted-foreground border-border/60"
                    }`}
                  >
                    <LuBanknote size={15} />
                    CASH
                  </Button>
                  <Button
                    type="button"
                    variant={payMethod === "transfer" ? "default" : "outline"}
                    onClick={() => setPayMethod("transfer")}
                    className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      payMethod === "transfer"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted text-muted-foreground border-border/60"
                    }`}
                  >
                    <LuCreditCard size={15} />
                    TRANSFER
                  </Button>
                  <Button
                    type="button"
                    variant={payMethod === "qris" ? "default" : "outline"}
                    onClick={() => setPayMethod("qris")}
                    className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      payMethod === "qris"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted text-muted-foreground border-border/60"
                    }`}
                  >
                    <LuQrCode size={15} />
                    QRIS
                  </Button>
                </div>
              </div>

              {/* Single Sisa Preview */}
              <div className="flex justify-between items-center p-3 rounded-xl bg-background border border-border/50 text-xs">
                <span className="text-muted-foreground font-medium">Sisa Setelah Pembayaran:</span>
                <span className="font-mono font-bold">
                  {singleRemaining === 0 ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">
                      <LuCircleCheck size={12} />
                      NOTA LUNAS
                    </span>
                  ) : (
                    <span className="text-rose-500">{formatCurrency(singleRemaining)}</span>
                  )}
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Split Payment Mode */}
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                {/* Cash Input */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <LuBanknote size={14} className="text-primary/70" />
                      Tunai (Cash)
                    </span>
                    {outstandingAmount - (splitAmounts.transfer + splitAmounts.qris) > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const sisa = Math.max(
                            0,
                            outstandingAmount - (splitAmounts.transfer + splitAmounts.qris),
                          );
                          setSplitAmounts((prev) => ({ ...prev, cash: sisa }));
                        }}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        Gunakan Sisa ({formatCurrency(Math.max(0, outstandingAmount - (splitAmounts.transfer + splitAmounts.qris)))})
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={splitAmounts.cash || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setSplitAmounts((prev) => ({ ...prev, cash: val }));
                      }}
                      placeholder="0"
                      className="w-full h-10 pl-9 pr-3 text-sm font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    />
                  </div>
                </div>

                {/* Transfer Input */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <LuCreditCard size={14} className="text-primary/70" />
                      Transfer Bank
                    </span>
                    {outstandingAmount - (splitAmounts.cash + splitAmounts.qris) > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const sisa = Math.max(
                            0,
                            outstandingAmount - (splitAmounts.cash + splitAmounts.qris),
                          );
                          setSplitAmounts((prev) => ({ ...prev, transfer: sisa }));
                        }}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        Gunakan Sisa ({formatCurrency(Math.max(0, outstandingAmount - (splitAmounts.cash + splitAmounts.qris)))})
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={splitAmounts.transfer || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setSplitAmounts((prev) => ({ ...prev, transfer: val }));
                      }}
                      placeholder="0"
                      className="w-full h-10 pl-9 pr-3 text-sm font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    />
                  </div>
                </div>

                {/* QRIS Input */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <LuQrCode size={14} className="text-primary/70" />
                      QRIS
                    </span>
                    {outstandingAmount - (splitAmounts.cash + splitAmounts.transfer) > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const sisa = Math.max(
                            0,
                            outstandingAmount - (splitAmounts.cash + splitAmounts.transfer),
                          );
                          setSplitAmounts((prev) => ({ ...prev, qris: sisa }));
                        }}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        Gunakan Sisa ({formatCurrency(Math.max(0, outstandingAmount - (splitAmounts.cash + splitAmounts.transfer)))})
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={splitAmounts.qris || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setSplitAmounts((prev) => ({ ...prev, qris: val }));
                      }}
                      placeholder="0"
                      className="w-full h-10 pl-9 pr-3 text-sm font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    />
                  </div>
                </div>

                {/* Split Summary Box */}
                <div className="bg-muted/30 border border-border/40 p-3 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sisa Piutang:</span>
                    <span className="text-foreground font-mono font-bold">{formatCurrency(outstandingAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Diinput:</span>
                    <span className="text-foreground font-mono font-bold">{formatCurrency(totalSplitInput)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-border/30">
                    <span className="text-muted-foreground">Sisa Belum Terbayar:</span>
                    <span
                      className={`font-mono font-bold ${
                        remainingOutstanding > 0 ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {remainingOutstanding > 0 ? formatCurrency(remainingOutstanding) : "PAS / LUNAS"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-2.5 pt-4 border-t border-border/30">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl text-xs font-bold px-4 border-border/60"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isInvalid}
              className="rounded-xl text-xs font-bold px-5 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-3 w-3 rounded-full border border-white border-t-transparent animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <LuCircleCheck size={14} />
                  Bayar Pelunasan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
