import React from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TablePagination,
} from "@erp-digital-printing/ui/Table";
import {
  LuEye,
  LuMessageCircle,
  LuCircleCheck,
  LuClock,
  LuFileText,
} from "@erp-digital-printing/ui/icons";
import type { CustomerReceivableModel } from "@core/receivable/domains/models/receivable.model";

interface CustomerReceivableTableProps {
  customers: CustomerReceivableModel[];
  page: number;
  pageSize: number;
  totalEntries: number;
  isLoading?: boolean;
  isHistoryTab?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSelectCustomer: (customer: CustomerReceivableModel) => void;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export const CustomerReceivableTable: React.FC<CustomerReceivableTableProps> = ({
  customers,
  page,
  pageSize,
  totalEntries,
  isLoading = false,
  isHistoryTab = false,
  onPageChange,
  onPageSizeChange,
  onSelectCustomer,
}) => {
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;

  const handleSendWhatsAppRecap = (cust: CustomerReceivableModel, e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = cust.customerPhone.replace(/^0/, "62");
    const unpaidInvoices = cust.invoices.filter((inv) => inv.remainingAmount > 0);

    let invoiceLines = "";
    unpaidInvoices.forEach((inv, idx) => {
      // NOTE: Jika kedepan klien butuh info jatuh tempo di teks WA, tambahkan: (Tempo: ${inv.dueDate})
      invoiceLines += `\n${idx + 1}. *${inv.invoiceNumber}* (${inv.jobNumber}) - Sisa: ${formatCurrency(inv.remainingAmount)}`;
    });

    const message = `Halo *${cust.customerName}*, kami dari bagian Keuangan Percetakan menginformasikan rekap tagihan piutang berjalan Anda sebanyak *${unpaidInvoices.length} nota* dengan total sisa *${formatCurrency(cust.totalRemaining)}*:\n${invoiceLines}\n\nMohon konfirmasi jadwal pelunasan atau transfer ke rekening kami. Terima kasih banyak atas kerjasamanya! 🙏`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/40 bg-muted/20">
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 pl-6">
              Nama Pelanggan / Kontak
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-center">
              Jumlah Nota
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5">
              Status Pembayaran
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-right">
              Total Belanja
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-right">
              Total Terbayar
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-right">
              {isHistoryTab ? "Sisa Tagihan" : "Total Sisa Piutang"}
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-center pr-6">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-36 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-muted-foreground">
                    Memuat daftar pelanggan berpiutang...
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-36 text-center text-xs text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <LuCircleCheck size={26} className="text-muted-foreground/60" />
                  <p className="font-semibold">
                    {isHistoryTab
                      ? "Belum ada riwayat pelanggan yang selesai berpiutang."
                      : "Tidak ada tagihan piutang aktif yang cocok dengan filter."}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((cust) => {
              return (
                <TableRow
                  key={cust.id}
                  className="hover:bg-muted/30 transition-colors border-b border-border/30 cursor-pointer"
                  onClick={() => onSelectCustomer(cust)}
                >
                  {/* Nama Pelanggan & Kontak */}
                  <TableCell className="py-3.5 pl-6 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {cust.customerName}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          cust.customerType === "RESELLER"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {cust.customerType}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground block mt-0.5 font-medium">
                      {cust.customerPhone}
                    </span>
                  </TableCell>

                  {/* Jumlah Nota */}
                  <TableCell className="py-3.5 text-center text-xs">
                    <span className="inline-flex items-center gap-1 font-bold text-xs bg-muted/60 text-foreground px-2.5 py-1 rounded-lg border border-border/50">
                      <LuFileText size={13} className="text-muted-foreground" />
                      {isHistoryTab ? `${cust.totalInvoicesCount} Nota Lunas` : `${cust.unpaidInvoicesCount} Nota Gantung`}
                    </span>
                  </TableCell>

                  {/* Status Pembayaran */}
                  <TableCell className="py-3.5 text-xs">
                    {isHistoryTab ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <LuCircleCheck size={13} />
                        Semua Lunas
                      </span>
                    ) : cust.totalPaid > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        <LuClock size={12} />
                        Ada Cicilan (DP)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                        Belum Ada Bayar
                      </span>
                    )}

                    {/*
                      NOTE KEDEPAN:
                      Jika klien butuh status jatuh tempo / aging overdue, aktifkan logika ini:
                      cust.hasOverdue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                          <LuTriangleAlert size={12} /> Overdue {cust.maxDaysOverdue} hari
                        </span>
                      ) : (
                        <span>Tempo: {cust.oldestDueDate}</span>
                      )
                    */}
                  </TableCell>

                  {/* Total Belanja */}
                  <TableCell className="py-3.5 text-right font-mono text-xs font-semibold text-foreground">
                    {formatCurrency(cust.totalAmount)}
                  </TableCell>

                  {/* Total Terbayar */}
                  <TableCell className="py-3.5 text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-500">
                    {formatCurrency(cust.totalPaid)}
                  </TableCell>

                  {/* Total Sisa Piutang */}
                  <TableCell className="py-3.5 text-right font-mono text-xs">
                    {isHistoryTab ? (
                      <span className="font-bold text-emerald-600">Rp 0</span>
                    ) : (
                      <span className="font-black text-rose-500 text-sm">
                        {formatCurrency(cust.totalRemaining)}
                      </span>
                    )}
                  </TableCell>

                  {/* Aksi */}
                  <TableCell className="py-3.5 text-center pr-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectCustomer(cust)}
                        title="Lihat Daftar Nota"
                        className="h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 border-border/60 hover:bg-muted"
                      >
                        <LuEye size={14} />
                        Lihat Nota ({cust.invoices.length})
                      </Button>

                      {!isHistoryTab && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleSendWhatsAppRecap(cust, e)}
                          title="Kirim Rekap Tagihan via WhatsApp"
                          className="h-8 px-2.5 rounded-lg text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 flex items-center gap-1 font-bold text-xs"
                        >
                          <LuMessageCircle size={15} />
                          Tagih WA
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination
        currentPage={page}
        pageSize={pageSize}
        totalEntries={totalEntries}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};

