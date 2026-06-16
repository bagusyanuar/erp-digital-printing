import React, { useState } from "react";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Label } from "@erp-digital-printing/ui/Label";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@erp-digital-printing/ui/Card";
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@erp-digital-printing/ui/Combobox";
import { LuX } from "@erp-digital-printing/ui/icons";
import { ExpenseBill } from "../types/expenseTypes";

interface ExpensePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bill: ExpenseBill | null;
  onSavePayment: (
    billId: string,
    payment: { paymentDate: string; paymentAccount: string; amountPaid: number }
  ) => void;
}

export const ExpensePaymentDialog: React.FC<ExpensePaymentDialogProps> = ({
  isOpen,
  onClose,
  bill,
  onSavePayment,
}) => {
  const remainingDebt = bill ? bill.totalAmount - bill.paidAmount : 0;

  const [paymentDate, setPaymentDate] = useState(() =>
    (new Date().toISOString().split("T")[0] || "")
  );
  const [paymentAccount, setPaymentAccount] = useState("Transfer");
  const [amountPaid, setAmountPaid] = useState(() => remainingDebt.toString());
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bill) return;

    const amount = parseFloat(amountPaid) || 0;
    if (amount <= 0) {
      setErrorMsg("Nominal pembayaran harus lebih dari Rp 0.");
      return;
    }
    if (amount > remainingDebt) {
      setErrorMsg(`Nominal pembayaran tidak boleh melebihi sisa hutang (${formatCurrency(remainingDebt)}).`);
      return;
    }

    onSavePayment(bill.id, {
      paymentDate,
      paymentAccount,
      amountPaid: amount,
    });
    onClose();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="md" showCloseButton={false}>
      <form onSubmit={handleSubmit}>
        <CardHeader className="px-6 py-5 border-b border-border/50 flex flex-row items-start justify-between gap-4">
          <div className="space-y-0.5">
            <CardTitle variant="h4" weight="semibold" className="text-lg tracking-tight">
              Bayar Cicilan Nota
            </CardTitle>
            <CardDescription className="text-sm">
              Catat cicilan pembayaran untuk melunasi sisa tagihan hutang dagang.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted active:scale-90 transition-all -mr-2 -mt-0.5"
            type="button"
            onClick={onClose}
          >
            <LuX className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="px-6 py-5 space-y-4">
          {/* Summary Nota info */}
          {bill && (
            <div className="bg-muted/30 p-4 rounded-2xl border border-border/40 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>No. Nota:</span>
                <span className="font-bold text-foreground">{bill.billNumber}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Supplier / Vendor:</span>
                <span className="font-semibold text-foreground">{bill.supplierName}</span>
              </div>
              <div className="border-t border-border/20 pt-2 flex justify-between font-bold text-foreground">
                <span>Total Tagihan:</span>
                <span>{formatCurrency(bill.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Telah Dibayar:</span>
                <span>{formatCurrency(bill.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-bold text-sm border-t border-dashed border-border/30 pt-1.5">
                <span>Sisa Hutang:</span>
                <span>{formatCurrency(remainingDebt)}</span>
              </div>
            </div>
          )}

          {/* Input Cicilan */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Tanggal Pembayaran</Label>
            <TextField
              type="date"
              className="border-border/50 focus:bg-background transition-all"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Nominal Bayar (Rp)</Label>
              <TextField
                type="number"
                placeholder="Contoh: 1000000"
                className="border-border/50 focus:bg-background transition-all font-bold text-right text-primary"
                value={amountPaid}
                onChange={(e) => {
                  setAmountPaid(e.target.value);
                  setErrorMsg("");
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Sumber Dana / Kas</Label>
              <Combobox value={paymentAccount} onValueChange={setPaymentAccount}>
                <ComboboxTrigger className="font-semibold w-full h-11 border rounded-xl px-3 border-border/50 text-sm bg-background text-left flex items-center justify-between">
                  <span>{paymentAccount || "-- Kas --"}</span>
                </ComboboxTrigger>
                <ComboboxContent className="w-[var(--radix-popover-trigger-width)] bg-background border border-border/80 shadow-lg rounded-xl overflow-hidden z-[10000]">
                  <ComboboxList className="max-h-48 p-1">
                    <ComboboxItem value="Cash">Kas Tunai (Cash)</ComboboxItem>
                    <ComboboxItem value="Transfer">Bank Transfer</ComboboxItem>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-600 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl font-bold">
              {errorMsg}
            </div>
          )}

          {/* Bukti Upload Mock */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Unggah Bukti Bayar (Opsional)</Label>
            <div className="border border-dashed border-border/60 hover:border-primary/50 transition-all rounded-xl p-3 text-center cursor-pointer bg-muted/10">
              <span className="text-[11px] text-muted-foreground font-semibold">
                Klik untuk lampirkan struk transfer
              </span>
            </div>
          </div>
        </CardContent>

        <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-3 bg-muted/20">
          <Button
            variant="outline"
            className="h-10 px-4 rounded-xl font-medium border-border/50 hover:bg-muted active:scale-95 transition-all"
            type="button"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            className="h-10 px-4 rounded-xl font-bold bg-primary hover:bg-primary/95 text-white active:scale-95 transition-all"
            type="submit"
          >
            Simpan Pembayaran
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
