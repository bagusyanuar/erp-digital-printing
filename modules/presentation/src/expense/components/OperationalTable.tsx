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
import { FiMoreVertical, LuEye, LuBan } from "@erp-digital-printing/ui/icons";

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

const MOCK_OPERATIONAL_EXPENSES: OperationalExpenseMock[] = [
  {
    id: "oe-1",
    date: "2026-06-15",
    categoryName: "Gaji Karyawan",
    recipientName: "Staff Produksi & Kasir",
    paymentAccount: "Transfer",
    amount: 12500000,
    description: "Gaji bulanan Juni untuk 4 staff",
    status: "Lunas",
  },
  {
    id: "oe-2",
    date: "2026-06-14",
    categoryName: "Biaya Listrik (PLN)",
    recipientName: "PLN Kantor Utama",
    paymentAccount: "Transfer",
    amount: 2800000,
    description: "Token & pascabayar listrik 3 phase",
    status: "Lunas",
  },
  {
    id: "oe-3",
    date: "2026-06-10",
    categoryName: "Biaya Internet (Indihome)",
    recipientName: "Telkom Indonesia",
    paymentAccount: "Cash",
    amount: 750000,
    description: "Tagihan wifi internet 100Mbps",
    status: "Dibatalkan",
  },
  {
    id: "oe-4",
    date: "2026-06-05",
    categoryName: "Air Minum Galon",
    recipientName: "Toko Kelontong Berkah",
    paymentAccount: "Cash",
    amount: 120000,
    description: "Pembelian 6 galon air minum staff",
    status: "Lunas",
  },
];

interface OperationalTableProps {
  onDetail: (expense: OperationalExpenseMock) => void;
  onCancel: (expense: OperationalExpenseMock) => void;
}

export const OperationalTable: React.FC<OperationalTableProps> = ({ onDetail, onCancel }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-sm">Tanggal</TableHead>
              <TableHead className="font-bold text-sm">Kategori Pengeluaran</TableHead>
              <TableHead className="font-bold text-sm">Penerima / Karyawan</TableHead>
              <TableHead className="font-bold text-sm">Sumber Dana</TableHead>
              <TableHead className="font-bold text-sm text-right">Nominal</TableHead>
              <TableHead className="font-bold text-sm text-center">Status</TableHead>
              <TableHead className="text-right font-bold text-sm pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_OPERATIONAL_EXPENSES.map((row) => {
              const isVoid = row.status === "Dibatalkan";
              return (
                <TableRow key={row.id} className={isVoid ? "opacity-60 line-through decoration-muted-foreground/50" : ""}>
                  <TableCell className="font-medium">
                    {new Date(row.date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{row.categoryName}</span>
                      <span className="text-xs text-muted-foreground">{row.description}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {row.recipientName}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-muted border border-border/80 text-foreground">
                      {row.paymentAccount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground">
                    {formatCurrency(row.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold tracking-wide ${
                        isVoid
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      }`}
                    >
                      {row.status}
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
                          <DropdownItem onClick={() => onDetail(row)}>
                            <LuEye size={14} className="text-muted-foreground" />
                            Detail Rincian
                          </DropdownItem>
                          {!isVoid && (
                            <DropdownItem variant="danger" onClick={() => onCancel(row)}>
                              <LuBan size={14} className="text-rose-500" />
                              Batalkan Transaksi
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
        totalEntries={MOCK_OPERATIONAL_EXPENSES.length}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(size) => setPageSize(size)}
      />
    </div>
  );
};
