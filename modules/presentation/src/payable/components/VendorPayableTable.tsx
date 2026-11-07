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
import type { VendorPayableModel } from "@core/payable/domains/models/payable.model";

interface VendorPayableTableProps {
  vendors: VendorPayableModel[];
  page: number;
  pageSize: number;
  totalEntries: number;
  isLoading?: boolean;
  isHistoryTab?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSelectVendor: (vendor: VendorPayableModel) => void;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export const VendorPayableTable: React.FC<VendorPayableTableProps> = ({
  vendors,
  page,
  pageSize,
  totalEntries,
  isLoading = false,
  isHistoryTab = false,
  onPageChange,
  onPageSizeChange,
  onSelectVendor,
}) => {
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;

  const handleSendWhatsAppRecap = (vendor: VendorPayableModel, e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = vendor.vendorPhone.replace(/^0/, "62");
    const unpaidExpenses = vendor.expenses.filter((exp) => exp.remainingAmount > 0);

    let expenseLines = "";
    unpaidExpenses.forEach((exp, idx) => {
      expenseLines += `\n${idx + 1}. *${exp.expenseNumber}* (${exp.referenceNumber || "-"}) - Sisa: ${formatCurrency(exp.remainingAmount)}`;
    });

    const message = `Halo *${vendor.vendorName}*, kami dari Keuangan Percetakan ingin mengonfirmasi rekap tagihan tempo berjalan sebanyak *${unpaidExpenses.length} nota* dengan total sisa hutang *${formatCurrency(vendor.totalRemaining)}*:\n${expenseLines}\n\nKami sedang memproses jadwal pembayaran/transfer ke rekening Anda. Mohon info nomor rekening terbaru jika ada perubahan. Terima kasih! 🙏`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/40 bg-muted/20">
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 pl-6">
              Nama Vendor / Supplier
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-center">
              Jumlah Nota
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5">
              Status Tagihan
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-right">
              Total Tagihan
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-right">
              Total Terbayar
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-right">
              {isHistoryTab ? "Sisa Tagihan" : "Sisa Hutang"}
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-center pr-6">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <TableRow key={`skeleton-${idx}`} className="animate-pulse border-b border-border/30">
                <TableCell className="py-4 pl-6">
                  <div className="h-4 w-40 bg-muted rounded mb-2" />
                  <div className="h-3 w-24 bg-muted/60 rounded" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="h-4 w-12 bg-muted rounded mx-auto" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-24 bg-muted rounded-full" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-4 w-24 bg-muted rounded ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-4 w-24 bg-muted rounded ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-4 w-24 bg-muted rounded ml-auto" />
                </TableCell>
                <TableCell className="text-center pr-6">
                  <div className="h-8 w-16 bg-muted rounded ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : vendors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground/60">
                    <LuFileText size={20} />
                  </div>
                  <p className="text-sm font-semibold">Tidak ada data hutang pengeluaran</p>
                  <p className="text-xs text-muted-foreground">
                    Semua tagihan vendor telah lunas atau filter tidak sesuai.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            vendors.map((vendor) => {
              const isPaid = vendor.totalRemaining === 0;
              const isPartial = vendor.totalPaid > 0 && vendor.totalRemaining > 0;

              return (
                <TableRow
                  key={vendor.id}
                  onClick={() => onSelectVendor(vendor)}
                  className="cursor-pointer border-b border-border/30 hover:bg-muted/30 transition-colors group"
                >
                  {/* Vendor Info */}
                  <TableCell className="py-4 pl-6">
                    <div className="space-y-0.5">
                      <div className="font-bold text-foreground text-sm group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <span>{vendor.vendorName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {vendor.vendorPhone}
                      </div>
                    </div>
                  </TableCell>

                  {/* Total Invoices Count */}
                  <TableCell className="text-center">
                    <div className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full bg-muted/60 text-xs font-semibold text-foreground">
                      <span>{vendor.unpaidExpensesCount} aktif</span>
                      {vendor.totalExpensesCount > vendor.unpaidExpensesCount && (
                        <span className="text-muted-foreground">
                          / {vendor.totalExpensesCount}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Payment Status */}
                  <TableCell>
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <LuCircleCheck size={13} />
                        Lunas
                      </span>
                    ) : isPartial ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <LuClock size={13} />
                        Sebagian (DP)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border/40">
                        <LuClock size={13} />
                        Belum Dibayar
                      </span>
                    )}
                  </TableCell>

                  {/* Total Tagihan */}
                  <TableCell className="text-right font-medium text-muted-foreground text-sm">
                    {formatCurrency(vendor.totalAmount)}
                  </TableCell>

                  {/* Total Terbayar */}
                  <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatCurrency(vendor.totalPaid)}
                  </TableCell>

                  {/* Sisa Hutang */}
                  <TableCell className="text-right font-black text-foreground text-sm">
                    <span className={vendor.totalRemaining > 0 ? "text-amber-600 dark:text-amber-500" : "text-emerald-600"}>
                      {formatCurrency(vendor.totalRemaining)}
                    </span>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-center pr-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      {vendor.totalRemaining > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30 rounded-md"
                          onClick={(e) => handleSendWhatsAppRecap(vendor, e)}
                          title="Kirim Konfirmasi WA ke Vendor"
                        >
                          <LuMessageCircle size={15} />
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 px-2.5 text-xs font-semibold rounded-md gap-1"
                        onClick={() => onSelectVendor(vendor)}
                      >
                        <LuEye size={14} />
                        <span>Detail</span>
                      </Button>
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
        totalPages={totalPages}
        pageSize={pageSize}
        totalEntries={totalEntries}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
