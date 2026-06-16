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
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
} from "@erp-digital-printing/ui/Combobox";
import { LuX } from "@erp-digital-printing/ui/icons";

export interface OperationalExpenseMock {
  id: string;
  date: string;
  categoryName: string;
  recipientName: string;
  paymentAccount: string;
  amount: number;
  description: string;
  status: "Lunas" | "Dibatalkan";
}

interface OperationalFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  expense: OperationalExpenseMock | null;
  readOnly?: boolean;
}

export const OperationalFormDialog: React.FC<OperationalFormDialogProps> = ({
  isOpen,
  onClose,
  expense,
  readOnly = false,
}) => {
  const [date, setDate] = useState(expense ? expense.date : new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState(expense ? "cat-1" : "");
  const [recipientName, setRecipientName] = useState(expense ? expense.recipientName : "");
  const [paymentAccount, setPaymentAccount] = useState(expense ? expense.paymentAccount : "");
  const [amount, setAmount] = useState(expense ? expense.amount.toString() : "");
  const [description, setDescription] = useState(expense ? expense.description : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="md" showCloseButton={false}>
      <form onSubmit={handleSubmit}>
        <CardHeader className="px-6 py-5 border-b border-border/50 flex flex-row items-start justify-between gap-4">
          <div className="space-y-0.5">
            <CardTitle variant="h4" weight="semibold" className="text-lg tracking-tight">
              {readOnly
                ? "Detail Pengeluaran Operasional"
                : expense
                ? "Ubah Pengeluaran Operasional"
                : "Tambah Pengeluaran Operasional"}
            </CardTitle>
            <CardDescription className="text-sm">
              {readOnly
                ? "Informasi rincian transaksi biaya operasional kantor."
                : "Catat biaya rutin kantor seperti gaji, listrik, internet, dll."}
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
          {/* Row Tanggal & Nominal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Tanggal</Label>
              <TextField
                type="date"
                disabled={readOnly}
                className="border-border/50 focus:bg-background transition-all"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Nominal (Rp)</Label>
              <TextField
                type="number"
                disabled={readOnly}
                placeholder="Contoh: 500000"
                className="border-border/50 focus:bg-background transition-all"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Kategori Pengeluaran */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Kategori Pengeluaran</Label>
            <Combobox value={categoryId} onValueChange={setCategoryId}>
              <ComboboxTrigger disabled={readOnly} className="font-semibold w-full h-11 border rounded-xl px-3 border-border/50 text-sm bg-background text-left flex items-center justify-between disabled:opacity-55 disabled:cursor-not-allowed">
                <span>
                  {categoryId === "cat-1" ? "Gaji Karyawan" : "-- Pilih Kategori --"}
                </span>
              </ComboboxTrigger>
              {!readOnly && (
                <ComboboxContent className="w-[var(--radix-popover-trigger-width)] bg-background border border-border/80 shadow-lg rounded-xl overflow-hidden z-[10000]">
                  <ComboboxList className="max-h-60 overflow-y-auto p-1">
                    <ComboboxItem value="cat-1">Gaji Karyawan</ComboboxItem>
                    <ComboboxItem value="cat-2">Biaya Listrik (PLN)</ComboboxItem>
                    <ComboboxItem value="cat-3">Biaya Internet (Indihome)</ComboboxItem>
                    <ComboboxItem value="cat-4">Air Minum Galon</ComboboxItem>
                  </ComboboxList>
                </ComboboxContent>
              )}
            </Combobox>
          </div>

          {/* Penerima & Sumber Dana */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Penerima / Karyawan</Label>
              <TextField
                disabled={readOnly}
                placeholder="Penerima dana"
                className="border-border/50 focus:bg-background transition-all"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Sumber Dana / Kas</Label>
              <Combobox value={paymentAccount} onValueChange={setPaymentAccount}>
                <ComboboxTrigger disabled={readOnly} className="font-semibold w-full h-11 border rounded-xl px-3 border-border/50 text-sm bg-background text-left flex items-center justify-between disabled:opacity-55 disabled:cursor-not-allowed">
                  <span>{paymentAccount || "-- Pilih Sumber Kas --"}</span>
                </ComboboxTrigger>
                {!readOnly && (
                  <ComboboxContent className="w-[var(--radix-popover-trigger-width)] bg-background border border-border/80 shadow-lg rounded-xl overflow-hidden z-[10000]">
                    <ComboboxList className="max-h-60 overflow-y-auto p-1">
                      <ComboboxItem value="Cash">Cash</ComboboxItem>
                      <ComboboxItem value="Transfer">Transfer</ComboboxItem>
                    </ComboboxList>
                  </ComboboxContent>
                )}
              </Combobox>
            </div>
          </div>

          {/* Keterangan */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Deskripsi / Keterangan</Label>
            <TextField
              disabled={readOnly}
              placeholder="Tambahkan catatan detail pengeluaran..."
              className="border-border/50 focus:bg-background transition-all"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Upload Bukti */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Lampiran Bukti Pembayaran</Label>
            {readOnly ? (
              <div className="border border-border/50 rounded-2xl p-4 bg-muted/20 flex items-center justify-between">
                <span className="text-xs text-foreground font-semibold">
                  bukti_listrik.pdf
                </span>
                <Button variant="ghost" className="text-primary text-xs font-bold" onClick={(e) => { e.preventDefault(); alert("Membuka file lampiran..."); }}>
                  Unduh / Lihat
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border/60 hover:border-primary/50 transition-all rounded-2xl p-4 text-center cursor-pointer bg-muted/20">
                <span className="text-xs text-muted-foreground font-semibold">
                  Klik atau seret file gambar/PDF nota di sini
                </span>
              </div>
            )}
          </div>
        </CardContent>

        <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-3 bg-muted/20">
          <Button
            variant="outline"
            className="h-10 px-4 rounded-xl font-medium border-border/50 hover:bg-muted active:scale-95 transition-all"
            type="button"
            onClick={onClose}
          >
            {readOnly ? "Tutup" : "Batal"}
          </Button>
          {!readOnly && (
            <Button
              className="h-10 px-4 rounded-xl font-bold bg-primary hover:bg-primary/95 text-white active:scale-95 transition-all"
              type="submit"
            >
              {expense ? "Perbarui" : "Simpan"}
            </Button>
          )}
        </div>
      </form>
    </Dialog>
  );
};
