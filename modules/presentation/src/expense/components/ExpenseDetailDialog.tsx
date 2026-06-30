import React from "react";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Button } from "@erp-digital-printing/ui/Button";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@erp-digital-printing/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@erp-digital-printing/ui/Table";
import {
  LuX,
  LuFileText,
  LuUser,
  LuCalendar,
  LuReceipt,
  LuCoins,
} from "@erp-digital-printing/ui/icons";
import type { ExpenseBill } from "../types/expenseTypes";

interface ExpenseDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bill: ExpenseBill | null;
}

export const ExpenseDetailDialog: React.FC<ExpenseDetailDialogProps> = ({
  isOpen,
  onClose,
  bill,
}) => {
  if (!bill) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const discountAmount = bill.discount || 0;
  const subtotal = bill.items.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingDebt = Math.max(0, bill.totalAmount - bill.paidAmount);

  // Status badges config
  const statusConfig = {
    PAID: {
      label: "Lunas",
      className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    PARTIAL_PAID: {
      label: "Cicilan",
      className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    UNPAID: {
      label: "Hutang",
      className: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    },
    VOID: {
      label: "Batal / Void",
      className: "bg-muted text-muted-foreground border-border",
    },
  };

  const currentStatus = statusConfig[bill.paymentStatus] || {
    label: bill.paymentStatus,
    className: "bg-muted text-muted-foreground border-border",
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="xl" className="lg:max-w-5xl" showCloseButton={false}>
      {/* Header */}
      <CardHeader className="px-6 py-5 border-b border-border/50 flex flex-row items-start justify-between gap-4 bg-card">
        <div className="space-y-0.5">
          <CardTitle
            variant="h4"
            weight="semibold"
            className="text-lg tracking-tight flex items-center gap-2"
          >
            <LuReceipt className="text-primary" size={20} />
            Detail Rincian Nota Pengeluaran
          </CardTitle>
          <CardDescription className="text-sm">
            Informasi lengkap faktur belanja, daftar item, dan riwayat pembayaran cicilan.
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted active:scale-90 transition-all -mr-2 -mt-0.5"
          onClick={onClose}
        >
          <LuX className="h-4 w-4" />
        </Button>
      </CardHeader>

      {/* Content Body */}
      <CardContent className="p-0 max-h-[75vh] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch divide-y lg:divide-y-0 lg:divide-x divide-border/50">
          
          {/* LEFT PANEL: Metadata & Purchased Items (Col span: 7/12) */}
          <div className="lg:col-span-7 p-6 space-y-6 bg-muted/5">
            {/* Metadata Badges Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-2xl border border-border/40 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0">
                  <LuFileText size={16} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    No. Nota / Faktur
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {bill.billNumber}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0">
                  <LuCalendar size={16} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Tanggal Nota
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {bill.date}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0">
                  <LuUser size={16} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Supplier / Vendor
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {bill.supplierName}
                  </span>
                </div>
              </div>
            </div>

            {/* Item Table List */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                Daftar Item Belanja ({bill.items.length})
              </h3>
              <div className="border border-border/40 rounded-2xl overflow-hidden bg-card shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-[10px] font-extrabold uppercase py-2.5 pl-4">
                        Deskripsi Item
                      </TableHead>
                      <TableHead className="text-[10px] font-extrabold uppercase py-2.5">
                        Kategori Biaya
                      </TableHead>
                      <TableHead className="text-[10px] font-extrabold uppercase py-2.5 text-right pr-4">
                        Nominal
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bill.items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-xs text-muted-foreground">
                          Tidak ada rincian item belanja.
                        </TableCell>
                      </TableRow>
                    ) : (
                      bill.items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/20">
                          <TableCell className="py-3 pl-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-semibold text-foreground leading-snug">
                                {item.description}
                              </span>
                              <div className="flex gap-1.5 items-center">
                                <span
                                  className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                    item.expenseType === "PRODUCTION"
                                      ? "bg-sky-500/10 text-sky-600 border-sky-500/20"
                                      : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  }`}
                                >
                                  {item.expenseType === "PRODUCTION" ? "Produksi" : "Operasional"}
                                </span>
                                {item.productCategoryName && (
                                  <span className="text-[9px] font-semibold text-muted-foreground">
                                    • Link: {item.productCategoryName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-xs text-muted-foreground font-medium">
                            {item.categoryName}
                          </TableCell>
                          <TableCell className="py-3 text-xs font-bold text-right text-foreground pr-4">
                            {formatCurrency(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Notes Section */}
            {bill.description && (
              <div className="p-4 bg-muted/20 rounded-2xl border border-border/30 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Catatan Nota
                </span>
                <p className="text-xs text-foreground font-medium leading-relaxed">
                  {bill.description}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Financial Summary & Payments (Col span: 5/12) */}
          <div className="lg:col-span-5 p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Transaction Status */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Status Transaksi
                </span>
                <span
                  className={`inline-flex items-center justify-center w-full px-3 py-2 rounded-xl text-xs font-bold border uppercase tracking-wider text-center ${currentStatus.className}`}
                >
                  {currentStatus.label}
                </span>
              </div>

              {/* Financial Calculation summary */}
              <div className="bg-card p-4 rounded-2xl border border-border/40 shadow-sm space-y-3.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block border-b border-border/30 pb-2">
                  Ringkasan Keuangan
                </span>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Potongan / Diskon:</span>
                    <span className="font-medium text-foreground">
                      -{formatCurrency(discountAmount)}
                    </span>
                  </div>

                  <div className="border-t border-border/30 my-2 pt-2 flex justify-between items-center font-bold text-sm text-foreground">
                    <span>Total Belanja:</span>
                    <span className="text-primary">
                      {formatCurrency(bill.totalAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Telah Dibayar:</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(bill.paidAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Sisa Hutang:</span>
                    <span className="font-semibold text-rose-500">
                      {formatCurrency(remainingDebt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment History List */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block flex items-center gap-1.5">
                  <LuCoins size={12} className="text-muted-foreground" />
                  Riwayat Pembayaran
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {bill.payments.length === 0 ? (
                    <div className="p-4 bg-muted/20 border border-dashed border-border/60 rounded-xl text-center text-xs text-muted-foreground font-medium">
                      Belum ada pembayaran dicatat.
                    </div>
                  ) : (
                    bill.payments.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40 shadow-xs hover:border-primary/20 transition-all"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-foreground">
                            {formatCurrency(p.amountPaid)}
                          </span>
                          <span className="text-[9px] text-muted-foreground block">
                            {p.paymentDate} • via {p.paymentAccount}
                          </span>
                        </div>
                        <div className="h-6 px-2 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-bold flex items-center justify-center uppercase">
                          Sukses
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </CardContent>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border/50 bg-card flex items-center justify-end gap-3 rounded-b-lg">
        <Button
          variant="outline"
          className="h-10 px-4 rounded-xl border-border/50 hover:bg-muted active:scale-95 transition-all text-xs font-semibold"
          onClick={onClose}
        >
          Tutup
        </Button>
        <Button
          className="h-10 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm active:scale-95 transition-all text-xs font-bold"
          onClick={handlePrint}
        >
          Cetak Nota
        </Button>
      </div>
    </Dialog>
  );
};
