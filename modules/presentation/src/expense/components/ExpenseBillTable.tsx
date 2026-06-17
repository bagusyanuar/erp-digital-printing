import React, { useState } from "react";
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
import { FiMoreVertical, LuEye, LuBan, LuReceipt, LuInfo } from "@erp-digital-printing/ui/icons";
import { ExpenseBill, MOCK_EXPENSE_BILLS } from "../types/expenseTypes";

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
}) => {
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
        return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
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
        return "Dicicil";
      case "UNPAID":
        return "Hutang";
      case "VOID":
        return "Dibatalkan";
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>No. Nota</TableHead>
              <TableHead>Supplier / Vendor</TableHead>
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
                <TableCell colSpan={8} className="py-12 text-center space-y-3">
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

                return (
                  <TableRow
                    key={bill.id}
                    className={isVoid ? "opacity-60 line-through decoration-muted-foreground/50" : ""}
                  >
                    <TableCell className="font-medium">
                      {new Date(bill.date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-semibold">{bill.billNumber}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{bill.supplierName}</span>
                        {bill.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {bill.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {formatCurrency(bill.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600">
                      {formatCurrency(bill.paidAmount)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-rose-600">
                      {formatCurrency(isVoid ? 0 : remainingDebt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold tracking-wide ${getStatusBadgeClass(
                          bill.paymentStatus
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
                              <LuEye size={14} className="text-muted-foreground" />
                              Detail Rincian
                            </DropdownItem>

                            {!isVoid && bill.paymentStatus !== "PAID" && (
                              <DropdownItem onClick={() => onPay(bill)}>
                                <LuReceipt size={14} className="text-primary" />
                                Bayar Cicilan
                              </DropdownItem>
                            )}

                            {!isVoid && (
                              <DropdownItem variant="danger" onClick={() => onCancel(bill)}>
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
                <TableCell colSpan={8} className="py-12 px-5 text-center space-y-3">
                  <LuInfo
                    size={36}
                    className="text-muted-foreground/60 mx-auto animate-pulse"
                  />
                  <h3 className="font-bold text-foreground text-sm">
                    Tidak Ada Data Pengeluaran
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Tidak ada transaksi pengeluaran yang cocok dengan kriteria filter pencarian atau tanggal saat ini.
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
