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
  LuCircleCheck,
  LuBanknote,
  LuCreditCard,
  LuQrCode,
} from "@erp-digital-printing/ui/icons";
import type { SettledInvoiceReceivableModel } from "@core/receivable/domains/models/receivable.model";

interface SettledReceivableTableProps {
  invoices: SettledInvoiceReceivableModel[];
  page: number;
  pageSize: number;
  totalEntries: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onDetail: (invoice: SettledInvoiceReceivableModel) => void;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

const formatOrderDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  try {
    const parts = dateStr.split(" ")[0]!.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return "-";
  try {
    const [datePart, timePart] = dateStr.split(" ");
    if (datePart) {
      const parts = datePart.split("-");
      if (parts.length === 3) {
        const [year, month, day] = parts;
        const formattedDate = `${day}/${month}/${year}`;
        if (timePart) {
          const [h, m] = timePart.split(":");
          return `${formattedDate}, ${h}:${m}`;
        }
        return formattedDate;
      }
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export const SettledReceivableTable: React.FC<SettledReceivableTableProps> = ({
  invoices,
  page,
  pageSize,
  totalEntries,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
  onDetail,
}) => {
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;

  const getMethodBadge = (method: string) => {
    switch (method.toLowerCase()) {
      case "cash":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
            <LuBanknote size={12} />
            TUNAI
          </span>
        );
      case "transfer":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">
            <LuCreditCard size={12} />
            TRANSFER
          </span>
        );
      case "qris":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded">
            <LuQrCode size={12} />
            QRIS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
            SPLIT PAYMENT
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/40 bg-muted/20">
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 pl-6">
              No. Nota / SPK
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5">
              Pelanggan
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5">
              Tanggal Pelunasan
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-right">
              Total Lunas
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-center">
              Metode Pelunasan
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-center">
              Status
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
                    Memuat riwayat nota lunas...
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-36 text-center text-xs text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <LuCircleCheck size={26} className="text-muted-foreground/60" />
                  <p className="font-semibold">
                    Belum ada riwayat nota yang telah lunas.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((item) => {
              return (
                <TableRow
                  key={item.id}
                  className="hover:bg-muted/30 transition-colors border-b border-border/30 cursor-pointer"
                  onClick={() => onDetail(item)}
                >
                  {/* No. Nota & SPK */}
                  <TableCell className="py-3.5 pl-6 font-mono text-xs">
                    <span className="font-bold text-foreground block">
                      {item.invoiceNumber}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {item.jobNumber}
                    </span>
                  </TableCell>

                  {/* Customer */}
                  <TableCell className="py-3.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">
                        {item.customerName}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          item.customerType === "RESELLER"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {item.customerType}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground block mt-0.5 font-medium">
                      {item.customerPhone}
                    </span>
                  </TableCell>

                  {/* Tanggal Pelunasan */}
                  <TableCell className="py-3.5 text-xs">
                    <span className="font-bold text-emerald-600 block">
                      {formatDateTime(item.settledDate)}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Tgl Order: {formatOrderDate(item.orderDate)}
                    </span>
                  </TableCell>

                  {/* Total Lunas */}
                  <TableCell className="py-3.5 text-right font-mono text-xs font-bold text-emerald-600">
                    {formatCurrency(item.totalAmount)}
                  </TableCell>

                  {/* Metode Pelunasan */}
                  <TableCell className="py-3.5 text-center text-xs">
                    {getMethodBadge(item.paymentMethod)}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3.5 text-center text-xs">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <LuCircleCheck size={12} />
                      LUNAS
                    </span>
                  </TableCell>

                  {/* Aksi */}
                  <TableCell className="py-3.5 text-center pr-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDetail(item)}
                        title="Lihat Detail & Bukti Pelunasan"
                        className="h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 border-border/60 hover:bg-muted"
                      >
                        <LuEye size={14} />
                        Detail
                      </Button>

                      {/* 
                        NOTE KEDEPAN:
                        Jika klien nantinya butuh cetak kuitansi / tanda terima pelunasan langsung dari tabel riwayat:
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alert(`Mencetak Bukti Pelunasan Nota ${item.invoiceNumber}...`)}
                          title="Cetak Kuitansi Pelunasan"
                          className="h-8 w-8 p-0 rounded-lg text-muted-foreground border-border/60 hover:bg-muted"
                        >
                          <LuPrinter size={14} />
                        </Button>
                      */}
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

