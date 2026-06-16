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
import { FiMoreVertical, LuEye, LuBan, LuReceipt } from "@erp-digital-printing/ui/icons";
import { ExpenseBill, MOCK_EXPENSE_BILLS } from "../types/expenseTypes";

interface ExpenseBillTableProps {
  bills: ExpenseBill[];
  onDetail: (bill: ExpenseBill) => void;
  onPay: (bill: ExpenseBill) => void;
  onCancel: (bill: ExpenseBill) => void;
}

export const ExpenseBillTable: React.FC<ExpenseBillTableProps> = ({
  bills,
  onDetail,
  onPay,
  onCancel,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
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
              <TableHead className="font-bold text-sm">Tanggal</TableHead>
              <TableHead className="font-bold text-sm">No. Nota</TableHead>
              <TableHead className="font-bold text-sm">Supplier / Vendor</TableHead>
              <TableHead className="font-bold text-sm text-right">Total Tagihan</TableHead>
              <TableHead className="font-bold text-sm text-right">Sudah Dibayar</TableHead>
              <TableHead className="font-bold text-sm text-right">Sisa Hutang</TableHead>
              <TableHead className="font-bold text-sm text-center">Status</TableHead>
              <TableHead className="text-right font-bold text-sm pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => {
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
            })}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={page}
        totalPages={1}
        pageSize={pageSize}
        totalEntries={bills.length}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(size) => setPageSize(size)}
      />
    </div>
  );
};
