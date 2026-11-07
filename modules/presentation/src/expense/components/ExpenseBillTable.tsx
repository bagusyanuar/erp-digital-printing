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
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@erp-digital-printing/ui/Dropdown";
import {
  FiMoreVertical,
  LuEye,
  LuBan,
  LuReceipt,
  LuInfo,
  LuExternalLink,
} from "@erp-digital-printing/ui/icons";
import { useProfile } from "../../user/hooks/useProfile";
import { isAdministrator } from "../../shared/utils/role.utils";
import type { ExpenseBill } from "../types/expenseTypes";

interface ExpenseBillTableProps {
  bills: ExpenseBill[];
  page: number;
  pageSize: number;
  totalEntries: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onDetail: (bill: ExpenseBill) => void;
  onPay: (bill: ExpenseBill) => void;
  onCancel: (bill: ExpenseBill) => void;
  canCancel?: boolean;
}

export const ExpenseBillTable: React.FC<ExpenseBillTableProps> = ({
  bills,
  page,
  pageSize,
  totalEntries,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
  onDetail,
  onPay,
  onCancel,
  canCancel,
}) => {
  const { data: profile } = useProfile();
  const hasCancelPermission = canCancel ?? isAdministrator(profile?.roles);
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusBadgeClass = (status: ExpenseBill["paymentStatus"]) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
      case "PARTIAL_PAID":
      case "UNPAID":
        return "bg-rose-500/10 text-rose-600 border border-rose-500/20";
      case "VOID":
        return "bg-slate-500/10 text-slate-600 border border-slate-500/20";
    }
  };

  const getStatusLabel = (status: ExpenseBill["paymentStatus"]) => {
    switch (status) {
      case "PAID":
        return "Lunas";
      case "PARTIAL_PAID":
      case "UNPAID":
        return "Belum Lunas";
      case "VOID":
        return "Dibatalkan";
    }
  };

  const formatDateTime = (createdAt?: string, fallbackDate?: string) => {
    const targetStr = createdAt || fallbackDate;
    if (!targetStr) return "-";
    try {
      const dateObj = new Date(targetStr);
      if (isNaN(dateObj.getTime())) return targetStr;

      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();

      if (createdAt) {
        const hours = String(dateObj.getHours()).padStart(2, "0");
        const minutes = String(dateObj.getMinutes()).padStart(2, "0");
        const seconds = String(dateObj.getSeconds()).padStart(2, "0");
        return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
      }
      return `${day}/${month}/${year}`;
    } catch {
      return targetStr;
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Tanggal</TableHead>
              <TableHead>No. Nota</TableHead>
              <TableHead>Supplier / Vendor</TableHead>
              <TableHead>Deskripsi & Ref</TableHead>
              <TableHead className="text-right">Total Tagihan</TableHead>
              <TableHead className="text-right">Sudah Dibayar</TableHead>
              <TableHead className="text-right">Sisa Hutang</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center space-y-3">
                  <div className="relative w-8 h-8 mx-auto">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground block animate-pulse">
                    Memuat Data Pengeluaran...
                  </span>
                </TableCell>
              </TableRow>
            ) : bills.length > 0 ? (
              bills.map((bill) => {
                const isVoid = bill.paymentStatus === "VOID";
                const remainingDebt = bill.totalAmount - bill.paidAmount;

                const uniqueCategories = Array.from(
                  new Set(
                    bill.items
                      .map((it) => it.categoryName)
                      .filter((name): name is string => Boolean(name && name.trim() !== ""))
                  )
                );
                const uniqueGroups = Array.from(
                  new Set(
                    bill.items
                      .map((it) => it.expenseType)
                      .filter((grp): grp is "PRODUCTION" | "OPERATIONAL" => Boolean(grp))
                  )
                );

                const fallbackDesc =
                  bill.items.length > 0
                    ? bill.items.map((it) => it.description).filter(Boolean).join(", ")
                    : "-";
                const displayDesc = bill.description || fallbackDesc || "-";

                return (
                  <TableRow
                    key={bill.id}
                    className={
                      isVoid
                        ? "opacity-60 line-through decoration-muted-foreground/50"
                        : ""
                    }
                  >
                    <TableCell className="font-medium text-center text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(bill.createdAt, bill.date)}
                    </TableCell>
                    <TableCell className="font-semibold text-xs whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onDetail(bill)}
                        className="font-mono font-bold text-xs bg-muted/60 text-foreground hover:bg-primary/20 hover:text-primary hover:border-primary/50 px-2 py-0.5 rounded-lg border border-border/50 inline-block text-left cursor-pointer transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
                        title="Klik untuk melihat Detail Rincian"
                      >
                        {bill.billNumber}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground text-xs whitespace-nowrap">
                      <span className="font-semibold text-foreground text-xs">
                        {bill.supplierName || "-"}
                      </span>
                    </TableCell>
                    <TableCell
                      className="cursor-pointer group hover:bg-primary/5 transition-colors"
                      onClick={() => onDetail(bill)}
                      title="Klik untuk melihat Detail Rincian"
                    >
                      <div className="flex flex-col gap-1 max-w-xs">
                        <span className="text-xs text-foreground font-semibold line-clamp-1 group-hover:text-primary transition-colors flex items-center gap-1">
                          {displayDesc}
                          <LuExternalLink
                            size={12}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0"
                          />
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Group Badges */}
                          {uniqueGroups.map((group) => (
                            <span
                              key={group}
                              className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                group === "PRODUCTION"
                                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              {group === "PRODUCTION" ? "Produksi" : "Operasional"}
                            </span>
                          ))}

                          {/* Category Badges */}
                          {uniqueCategories.slice(0, 2).map((catName) => (
                            <span
                              key={catName}
                              className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded w-max border border-violet-500/20"
                            >
                              {catName}
                            </span>
                          ))}
                          {uniqueCategories.length > 2 && (
                            <span
                              title={uniqueCategories.slice(2).join(", ")}
                              className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/30"
                            >
                              +{uniqueCategories.length - 2}
                            </span>
                          )}

                          {/* Reference Badges */}
                          {bill.expenseNumber && bill.expenseNumber !== bill.billNumber && (
                            <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded w-max border border-blue-500/20 font-bold">
                              Ref: {bill.expenseNumber}
                            </span>
                          )}
                          {bill.id && (
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded w-max border border-border/30">
                              Ref ID: {bill.id.substring(0, 8)}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground text-xs whitespace-nowrap">
                      {formatCurrency(bill.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600 text-xs whitespace-nowrap">
                      {formatCurrency(bill.paidAmount)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-rose-600 text-xs whitespace-nowrap">
                      {formatCurrency(isVoid ? 0 : remainingDebt)}
                    </TableCell>
                    <TableCell className="text-center text-xs whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold tracking-wide ${getStatusBadgeClass(
                          bill.paymentStatus,
                        )}`}
                      >
                        {getStatusLabel(bill.paymentStatus)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end">
                        <Dropdown>
                          <DropdownTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted active:scale-90 transition-all"
                            >
                              <FiMoreVertical size={16} />
                            </Button>
                          </DropdownTrigger>
                          <DropdownContent className="w-44 z-[50]">
                            <DropdownItem onClick={() => onDetail(bill)}>
                              <LuEye
                                size={14}
                                className="text-muted-foreground"
                              />
                              Detail Rincian
                            </DropdownItem>

                            {!isVoid && bill.paymentStatus !== "PAID" && (
                              <DropdownItem onClick={() => onPay(bill)}>
                                <LuReceipt size={14} className="text-primary" />
                                Bayar Cicilan
                              </DropdownItem>
                            )}

                            {hasCancelPermission && !isVoid && (
                              <DropdownItem
                                variant="danger"
                                onClick={() => onCancel(bill)}
                              >
                                <LuBan size={14} className="text-rose-500" />
                                Batalkan Nota
                              </DropdownItem>
                            )}
                          </DropdownContent>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-12 px-5 text-center space-y-3"
                >
                  <LuInfo
                    size={36}
                    className="text-muted-foreground/60 mx-auto animate-pulse"
                  />
                  <h3 className="font-bold text-foreground text-sm">
                    Tidak Ada Data Pengeluaran
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Tidak ada transaksi pengeluaran yang cocok dengan kriteria
                    filter pencarian atau tanggal saat ini.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={page}
        totalPages={Math.max(1, Math.ceil(totalEntries / pageSize))}
        pageSize={pageSize}
        totalEntries={totalEntries}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
