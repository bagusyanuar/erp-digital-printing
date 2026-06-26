import React, { useState } from "react";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Label } from "@erp-digital-printing/ui/Label";
import { DatePicker } from "@erp-digital-printing/ui/DatePicker";
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

interface CapitalInjectionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    date: string;
    amount: number;
    paymentMethod: string;
    description: string;
  }) => void;
}

const toLocalDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const CapitalInjectionFormDialog: React.FC<CapitalInjectionFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [date, setDate] = useState<string>(() => toLocalDateString(new Date()));
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const resetForm = () => {
    setDate(toLocalDateString(new Date()));
    setAmount("");
    setPaymentMethod("cash");
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
    if (numericAmount <= 0) {
      setErrorMsg("Nominal setoran modal harus lebih besar dari Rp 0.");
      return;
    }
    if (!paymentMethod) {
      setErrorMsg("Pilih salah satu metode kas/bank penerima.");
      return;
    }

    onSubmit({
      date,
      amount: numericAmount,
      paymentMethod,
      description: description.trim(),
    });
    
    resetForm();
  };

  const getPaymentMethodLabel = (val: string) => {
    if (val === "cash") return "Kas Kecil";
    if (val === "transfer") return "Bank";
    return val || "-- Kas Penerima --";
  };

  return (
    <Dialog isOpen={open} onClose={handleClose} size="md" showCloseButton={false}>
      <form onSubmit={handleSubmit}>
        <CardHeader className="px-6 py-5 border-b border-border/50 flex flex-row items-start justify-between gap-4">
          <div className="space-y-0.5">
            <CardTitle variant="h4" weight="semibold" className="text-lg tracking-tight">
              Tambah Setoran Modal
            </CardTitle>
            <CardDescription className="text-sm">
              Catat suntikan atau setoran modal baru ke dalam sistem keuangan.
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
            {/* Tanggal Setoran */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Tanggal Setoran</Label>
              <DatePicker
                className="w-full h-11 border-border/50 bg-background"
                value={date ? new Date(`${date}T00:00:00`) : undefined}
                onChange={(newVal) =>
                  setDate(newVal ? toLocalDateString(newVal) : "")
                }
              />
            </div>

            {/* Kas Penerima */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Kas Penerima</Label>
              <Combobox value={paymentMethod} onValueChange={setPaymentMethod}>
                <ComboboxTrigger className="font-semibold w-full h-11 border rounded-xl px-3 border-border/50 text-sm bg-background text-left flex items-center justify-between">
                  <span>{getPaymentMethodLabel(paymentMethod)}</span>
                </ComboboxTrigger>
                <ComboboxContent className="w-[var(--radix-popover-trigger-width)] bg-background border border-border/80 shadow-lg rounded-xl overflow-hidden z-[10000]">
                  <ComboboxList className="max-h-48 p-1">
                    <ComboboxItem value="cash">Kas Kecil</ComboboxItem>
                    <ComboboxItem value="transfer">Bank</ComboboxItem>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>

          {/* Nominal Setoran */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Nominal Setoran (Rp)</Label>
            <TextField
              type="number"
              placeholder="Contoh: 50000000"
              className="w-full border-border/50 focus:bg-background transition-all font-bold text-primary h-11"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setErrorMsg("");
              }}
              required
            />
          </div>

          {/* Keterangan */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Keterangan / Catatan</Label>
            <textarea
              placeholder="Tulis detail/keterangan setoran modal..."
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
            Simpan Setoran
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
