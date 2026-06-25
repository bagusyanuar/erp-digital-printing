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

interface CapitalWithdrawalFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    date: string;
    investorName: string;
    amount: number;
    paymentMethod: string;
    description: string;
  }) => void;
}

export const CapitalWithdrawalFormDialog: React.FC<CapitalWithdrawalFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [date, setDate] = useState<string>(() => new Date().toISOString().split("T")[0] ?? "");
  const [investorName, setInvestorName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank BCA");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0] ?? "");
    setInvestorName("");
    setAmount("");
    setPaymentMethod("Bank BCA");
    setDescription("");
    setErrorMsg("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount) || 0;
    if (!investorName.trim()) {
      setErrorMsg("Nama pemilik/investor harus diisi.");
      return;
    }
    if (numericAmount <= 0) {
      setErrorMsg("Nominal penarikan modal harus lebih besar dari Rp 0.");
      return;
    }
    if (!paymentMethod) {
      setErrorMsg("Pilih salah satu metode kas/bank sumber.");
      return;
    }

    onSubmit({
      date,
      investorName: investorName.trim(),
      amount: numericAmount,
      paymentMethod,
      description: description.trim(),
    });
    
    resetForm();
  };

  return (
    <Dialog isOpen={open} onClose={handleClose} size="md" showCloseButton={false}>
      <form onSubmit={handleSubmit}>
        <CardHeader className="px-6 py-5 border-b border-border/50 flex flex-row items-start justify-between gap-4">
          <div className="space-y-0.5">
            <CardTitle variant="h4" weight="semibold" className="text-lg tracking-tight">
              Tambah Penarikan Modal (Prive)
            </CardTitle>
            <CardDescription className="text-sm">
              Catat penarikan modal/prive oleh owner atau investor dari sistem.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted active:scale-90 transition-all -mr-2 -mt-0.5"
            type="button"
            onClick={handleClose}
          >
            <LuX className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="px-6 py-5 space-y-4">
          {errorMsg && (
            <div className="text-xs text-rose-600 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl font-bold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tanggal Penarikan */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Tanggal Penarikan</Label>
              <TextField
                type="date"
                className="border-border/50 focus:bg-background transition-all"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Nama Pemilik/Investor */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Pemilik / Investor</Label>
              <TextField
                placeholder="Contoh: Hendra Wijaya"
                className="border-border/50 focus:bg-background transition-all"
                value={investorName}
                onChange={(e) => {
                  setInvestorName(e.target.value);
                  setErrorMsg("");
                }}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nominal Penarikan */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Nominal Penarikan (Rp)</Label>
              <TextField
                type="number"
                placeholder="Contoh: 10000000"
                className="border-border/50 focus:bg-background transition-all font-bold text-primary"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrorMsg("");
                }}
                required
              />
            </div>

            {/* Kas/Bank Sumber */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Kas / Bank Sumber</Label>
              <Combobox value={paymentMethod} onValueChange={setPaymentMethod}>
                <ComboboxTrigger className="font-semibold w-full h-11 border rounded-xl px-3 border-border/50 text-sm bg-background text-left flex items-center justify-between">
                  <span>{paymentMethod || "-- Kas/Bank --"}</span>
                </ComboboxTrigger>
                <ComboboxContent className="w-[var(--radix-popover-trigger-width)] bg-background border border-border/80 shadow-lg rounded-xl overflow-hidden z-[10000]">
                  <ComboboxList className="max-h-48 p-1">
                    <ComboboxItem value="Kas Besar">Kas Besar (Tunai)</ComboboxItem>
                    <ComboboxItem value="Bank BCA">Bank BCA</ComboboxItem>
                    <ComboboxItem value="Bank Mandiri">Bank Mandiri</ComboboxItem>
                    <ComboboxItem value="Bank BRI">Bank BRI</ComboboxItem>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>

          {/* Keterangan */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Keterangan / Catatan</Label>
            <textarea
              placeholder="Tulis alasan/keterangan penarikan modal..."
              className="w-full min-h-[80px] rounded-xl border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>

        <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-3 bg-muted/20">
          <Button
            variant="outline"
            className="h-10 px-4 rounded-xl font-medium border-border/50 hover:bg-muted active:scale-95 transition-all"
            type="button"
            onClick={handleClose}
          >
            Batal
          </Button>
          <Button
            className="h-10 px-4 rounded-xl font-bold bg-primary hover:bg-primary/95 text-white active:scale-95 transition-all"
            type="submit"
          >
            Simpan Penarikan
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
