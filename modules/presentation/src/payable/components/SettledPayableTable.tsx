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
  LuFileText,
  LuCreditCard,
  LuBanknote,
  LuQrCode,
  LuSplit,
} from "@erp-digital-printing/ui/icons";
import type { SettledExpensePayableModel } from "@core/payable/domains/models/payable.model";

interface SettledPayableTableProps {
  items: SettledExpensePayableModel[];
  page: number;
  pageSize: number;
  totalEntries: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSelectSettledItem: (item: SettledExpensePayableModel) => void;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  try {
    const datePart = dateStr.split(" ")[0];
    if (!datePart) return dateStr;
    const parts = datePart.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export const SettledPayableTable: React.FC<SettledPayableTableProps> = ({
  items,
  page,
  pageSize,
  totalEntries,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
  onSelectSettledItem,
}) => {
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;

  const renderPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "transfer":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <LuCreditCard size={12} />
            Transfer Bank
          </span>
        );
      case "cash":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <LuBanknote size={12} />
            Tunai / Kas
          </span>
        );
      case "qris":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <LuQrCode size={12} />
            QRIS
          </span>
        );
      case "split":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <LuSplit size={12} />
            Split / Bertahap
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted text-muted-foreground">
            {method}
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
              No. Expense / Nota Vendor
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5">
              Nama Vendor / Kontak
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-center">
              Kategori
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-center">
              Tgl Pengeluaran
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-center">
              Tgl Lunas
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-center">
              Metode Pembayaran
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-right">
              Total Lunas
            </TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-3.5 text-center pr-6">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <TableRow key={`skeleton-settled-${idx}`} className="animate-pulse border-b border-border/30">
                <TableCell className="py-4 pl-6">
                  <div className="h-4 w-32 bg-muted rounded mb-1" />
                  <div className="h-3 w-20 bg-muted/60 rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-36 bg-muted rounded mb-1" />
                  <div className="h-3 w-24 bg-muted/60 rounded" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="h-5 w-20 bg-muted rounded-full mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="h-4 w-20 bg-muted rounded mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="h-4 w-20 bg-muted rounded mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="h-5 w-24 bg-muted rounded-full mx-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-4 w-24 bg-muted rounded ml-auto" />
                </TableCell>
                <TableCell className="text-center pr-6">
                  <div className="h-8 w-16 bg-muted rounded ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground/60">
                    <LuFileText size={20} />
                  </div>
                  <p className="text-sm font-semibold">Belum ada riwayat pelunasan hutang</p>
                  <p className="text-xs text-muted-foreground">
                    Nota pengeluaran yang terlunasi akan otomatis masuk ke arsip ini.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow
                key={item.id}
                onClick={() => onSelectSettledItem(item)}
                className="cursor-pointer border-b border-border/30 hover:bg-muted/30 transition-colors group"
              >
                {/* Expense & Reference */}
                <TableCell className="py-4 pl-6">
                  <div className="space-y-0.5">
                    <div className="font-bold text-foreground text-sm group-hover:text-primary transition-colors flex items-center gap-1.5">
                      <span>{item.expenseNumber}</span>
                    </div>
                    {item.referenceNumber && (
                      <div className="text-xs text-muted-foreground">
                        Ref: {item.referenceNumber}
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Vendor Info */}
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-foreground text-sm">
                      {item.vendorName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.vendorPhone}
                    </div>
                  </div>
                </TableCell>

                {/* Category */}
                <TableCell className="text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-secondary text-secondary-foreground">
                    {item.categoryName}
                  </span>
                </TableCell>

                {/* Tanggal Expense */}
                <TableCell className="text-center text-xs text-muted-foreground font-medium">
                  {formatDate(item.expenseDate)}
                </TableCell>

                {/* Tanggal Lunas */}
                <TableCell className="text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatDate(item.settledDate)}
                </TableCell>

                {/* Metode Pembayaran */}
                <TableCell className="text-center">
                  {renderPaymentMethodBadge(item.paymentMethod)}
                </TableCell>

                {/* Total Lunas */}
                <TableCell className="text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatCurrency(item.totalAmount)}
                </TableCell>

                {/* Action */}
                <TableCell className="text-center pr-6" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-semibold rounded-md gap-1"
                    onClick={() => onSelectSettledItem(item)}
                  >
                    <LuEye size={14} />
                    <span>Detail</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
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

