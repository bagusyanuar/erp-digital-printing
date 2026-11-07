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
  VendorPayableModel,
  PayableExpenseItemModel,
} from "@core/payable/domains/models/payable.model";
import type {
  PayVendorExpenseInput,
  PayablePaymentSplitItem,
} from "@core/payable/applications/inputs/payable.input";

interface PayablePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: VendorPayableModel | null;
  expense: PayableExpenseItemModel | null;
  onSubmit: (input: PayVendorExpenseInput) => void;
  isLoading?: boolean;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export const PayablePaymentDialog: React.FC<PayablePaymentDialogProps> = ({
  isOpen,
  onClose,
  vendor,
  expense,
  onSubmit,
  isLoading = false,
}) => {
  const outstandingAmount = expense?.remainingAmount ?? 0;

  // Single payment state
  const [payAmount, setPayAmount] = useState<number>(() => outstandingAmount);
  const [payMethod, setPayMethod] = useState<"cash" | "transfer" | "qris">("transfer");
  const [sourceAccount, setSourceAccount] = useState<string>("BCA Operasional");
  const [notes, setNotes] = useState<string>("");

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

  if (!vendor || !expense) return null;

  const totalSplitInput =
    (splitAmounts.cash || 0) +
    (splitAmounts.transfer || 0) +
    (splitAmounts.qris || 0);

  const remainingOutstanding = Math.max(0, outstandingAmount - totalSplitInput);
  const singleRemaining = Math.max(0, outstandingAmount - (payAmount || 0));

  const isInvalid = isSplitPayment
    ? totalSplitInput <= 0 || totalSplitInput > outstandingAmount
    : payAmount <= 0 || payAmount > outstandingAmount;

  const handleSelectFullPay = () => {
    if (isSplitPayment) {
      setSplitAmounts({ cash: 0, transfer: outstandingAmount, qris: 0 });
    } else {
      setPayAmount(outstandingAmount);
    }
  };

  const handleSelectHalfPay = () => {
    const half = Math.floor(outstandingAmount / 2);
    if (isSplitPayment) {
      setSplitAmounts({ cash: 0, transfer: half, qris: 0 });
    } else {
      setPayAmount(half);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalid) return;

    let payments: PayablePaymentSplitItem[] = [];

    if (isSplitPayment) {
      if (splitAmounts.cash > 0) {
        payments.push({
          paymentMethod: "cash",
          amount: splitAmounts.cash,
          sourceAccount: "Kas Kecil",
        });
      }
      if (splitAmounts.transfer > 0) {
        payments.push({
          paymentMethod: "transfer",
          amount: splitAmounts.transfer,
          sourceAccount,
        });
      }
      if (splitAmounts.qris > 0) {
        payments.push({
          paymentMethod: "qris",
          amount: splitAmounts.qris,
          sourceAccount: "QRIS Kasir",
        });
      }
    } else {
      payments = [
        {
          paymentMethod: payMethod,
          amount: payAmount,
          sourceAccount: payMethod === "cash" ? "Kas Kecil" : sourceAccount,
        },
      ];
    }

    onSubmit({
      vendorId: vendor.id,
      expenseId: expense.id,
      payments,
      notes: notes.trim() || undefined,
      recordedBy: "Finance Officer",
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      className="max-w-2xl w-full p-6 sm:p-8 rounded-2xl border-border/50 bg-card text-foreground shadow-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Header */}
        <div className="border-b border-border/30 pb-4 pr-12">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
              <LuReceipt size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Bayar Hutang Nota Pengeluaran
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Vendor: <span className="font-semibold text-foreground">{vendor.vendorName}</span> ({expense.expenseNumber})
              </p>
            </div>
          </div>
        </div>

        {/* Bill Summary Banner */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/40 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Total Tagihan Nota:</span>
            <span className="font-bold text-foreground text-sm">
              {formatCurrency(expense.totalAmount)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-amber-600 dark:text-amber-500 font-bold block text-[11px]">
              Sisa Hutang Berjalan:
            </span>
            <span className="font-black text-amber-600 dark:text-amber-500 text-sm">
              {formatCurrency(outstandingAmount)}
            </span>
          </div>
        </div>

        {/* Catatan / Deskripsi Nota Pengeluaran */}
        {expense.notes && (
          <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-xs space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Catatan / Rincian Pengeluaran:
            </span>
            <p className="text-foreground font-medium whitespace-pre-wrap break-words">
              {expense.notes}
            </p>
          </div>
        )}

        {/* Payment Mode Selector (Single vs Split) */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/30 text-xs">
          <span className="font-medium text-muted-foreground">Mode Pembayaran:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsSplitPayment(false)}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                !isSplitPayment
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Single
            </button>
            <button
              type="button"
              onClick={() => setIsSplitPayment(true)}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                isSplitPayment
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Split / Campuran
            </button>
          </div>
        </div>

        {!isSplitPayment ? (
          /* Single Payment Inputs */
          <div className="space-y-4">
            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPayMethod("transfer")}
                  className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                    payMethod === "transfer"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <LuCreditCard size={15} />
                  <span>Transfer Bank</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod("cash")}
                  className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                    payMethod === "cash"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <LuBanknote size={15} />
                  <span>Tunai / Kas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod("qris")}
                  className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                    payMethod === "qris"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <LuQrCode size={15} />
                  <span>QRIS</span>
                </button>
              </div>
            </div>

            {/* Source Account (if transfer) */}
            {payMethod === "transfer" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Rekening Sumber Pengeluaran
                </label>
                <select
                  value={sourceAccount}
                  onChange={(e) => setSourceAccount(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-background border border-border/60 text-xs text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="BCA Operasional">BCA Operasional (0234-889-112)</option>
                  <option value="Mandiri Bisnis">Mandiri Bisnis (132-00-998877-1)</option>
                  <option value="BRI Rekening Toko">BRI Rekening Toko (0012-01-0987)</option>
                </select>
              </div>
            )}

            {/* Nominal Input & Quick Preset Buttons */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Nominal Pembayaran (Rp)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSelectHalfPay}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                  >
                    50% Cicilan
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectFullPay}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                  >
                    100% Lunas
                  </button>
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-muted-foreground">
                  Rp
                </span>
                <input
                  type="number"
                  min={1}
                  max={outstandingAmount}
                  value={payAmount || ""}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-background border border-border/60 text-sm font-bold text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-muted-foreground">Sisa setelah pembayaran:</span>
                <span className={`font-bold ${singleRemaining === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  {formatCurrency(singleRemaining)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Split Payment Inputs */
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Transfer Bank</span>
                <span className="text-[11px] text-muted-foreground font-mono">{sourceAccount}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-muted-foreground">
                  Rp
                </span>
                <input
                  type="number"
                  min={0}
                  value={splitAmounts.transfer || ""}
                  onChange={(e) =>
                    setSplitAmounts((prev) => ({ ...prev, transfer: Number(e.target.value) }))
                  }
                  placeholder="0"
                  className="w-full h-9 pl-9 pr-3 rounded-md bg-background border border-border/60 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tunai / Kas Kecil
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-muted-foreground">
                  Rp
                </span>
                <input
                  type="number"
                  min={0}
                  value={splitAmounts.cash || ""}
                  onChange={(e) =>
                    setSplitAmounts((prev) => ({ ...prev, cash: Number(e.target.value) }))
                  }
                  placeholder="0"
                  className="w-full h-9 pl-9 pr-3 rounded-md bg-background border border-border/60 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                QRIS
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-muted-foreground">
                  Rp
                </span>
                <input
                  type="number"
                  min={0}
                  value={splitAmounts.qris || ""}
                  onChange={(e) =>
                    setSplitAmounts((prev) => ({ ...prev, qris: Number(e.target.value) }))
                  }
                  placeholder="0"
                  className="w-full h-9 pl-9 pr-3 rounded-md bg-background border border-border/60 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/30 flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Total Input Split:</span>
              <span className={`font-black ${totalSplitInput === outstandingAmount ? "text-emerald-600" : "text-amber-600"}`}>
                {formatCurrency(totalSplitInput)} (Sisa: {formatCurrency(remainingOutstanding)})
              </span>
            </div>
          </div>
        )}

        {/* Notes Input */}
        <div className="space-y-1.5 p-0.5">
          <label className="text-xs font-semibold text-foreground">
            Catatan / Keterangan Pembayaran (Opsional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Transfer pelunasan via m-banking BCA referensi 88910"
            className="w-full min-h-[84px] p-3 rounded-lg bg-background border border-border/60 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/30">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-md text-xs"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isInvalid || isLoading}
            className="rounded-md text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <LuCircleCheck size={15} />
            <span>{isLoading ? "Menyimpan..." : "Simpan Pembayaran"}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

