import React, { useState, useMemo } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Card, CardContent } from "@erp-digital-printing/ui/Card";
import { DateRangePicker, type DateRange } from "@erp-digital-printing/ui/DateRangePicker";
import { toast } from "@erp-digital-printing/ui/Toast";
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
  LuPlus,
  LuSearch,
  LuBanknote,
  LuCalendar,
  LuWallet,
  LuTrash2,
  LuRefreshCw,
  LuFilter,
  LuArrowRightLeft,
} from "@erp-digital-printing/ui/icons";
import { FundTransferFormDialog } from "../components/FundTransferFormDialog";

interface FundTransfer {
  id: string;
  date: string;
  sourceAccount: string;
  destinationAccount: string;
  amount: number;
  transferFee: number;
  description: string;
}

const MOCK_TRANSFERS: FundTransfer[] = [
  {
    id: "TRF-001",
    date: "2026-06-25",
    sourceAccount: "Kas Besar",
    destinationAccount: "Bank BCA",
    amount: 10000000,
    transferFee: 0,
    description: "Setor tunai ke rekening BCA",
  },
  {
    id: "TRF-002",
    date: "2026-06-23",
    sourceAccount: "Bank BCA",
    destinationAccount: "Bank Mandiri",
    amount: 25000000,
    transferFee: 6500,
    description: "Transfer saldo antar bank untuk operasional",
  },
];

export default function FundTransferPage() {
  const [data, setData] = useState<FundTransfer[]>(MOCK_TRANSFERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return {
      from: today,
      to: today,
    };
  });
  const [isFormOpen, setIsFormOpen] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.sourceAccount.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.destinationAccount.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [data, searchQuery]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, page, pageSize]);

  const totalAmount = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredData]);

  const totalFees = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.transferFee, 0);
  }, [filteredData]);

  const handleCreate = (newData: Omit<FundTransfer, "id">) => {
    const newRecord: FundTransfer = {
      ...newData,
      id: `TRF-00${data.length + 1}`,
    };
    setData([newRecord, ...data]);
    toast.success(
      "Sukses",
      "Pemindahan dana berhasil ditambahkan (Mock State)"
    );
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data pemindahan dana ini?")) {
      setData(data.filter((item) => item.id !== id));
      toast.success(
        "Sukses",
        "Pemindahan dana berhasil dihapus (Mock State)"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Pemindahan Dana
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola dan catat transaksi mutasi dana antar rekening kas atau bank internal.
          </p>
        </div>
        <Button
          onClick={() => {
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <LuPlus className="h-4 w-4" />
          Tambah Pemindahan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <LuArrowRightLeft className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Pemindahan Dana
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {formatCurrency(totalAmount)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <LuWallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Biaya Admin
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {formatCurrency(totalFees)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <LuCalendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Jumlah Transaksi Mutasi
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {filteredData.length} Mutasi
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Table */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <TextField
                placeholder="Cari kas asal, tujuan, atau keterangan..."
                className="pl-10 h-10 border-border/50 bg-muted/20 focus:bg-background transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Date Range & Refresh */}
            <div className="flex flex-wrap items-center gap-3">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
              <Button variant="outline" size="icon" className="h-10 w-10 border-border/50">
                <LuFilter className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 border-border/50">
                <LuRefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border border-border/50 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[120px] font-semibold text-xs uppercase tracking-wider">ID Mutasi</TableHead>
                  <TableHead className="w-[120px] font-semibold text-xs uppercase tracking-wider">Tanggal</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Kas/Bank Asal</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Kas/Bank Tujuan</TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">Nominal</TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">Biaya Transfer</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Keterangan</TableHead>
                  <TableHead className="w-[80px] text-center font-semibold text-xs uppercase tracking-wider">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      Tidak ada data pemindahan dana ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-mono font-bold text-xs text-foreground/80">{item.id}</TableCell>
                      <TableCell className="text-sm">{item.date}</TableCell>
                      <TableCell className="font-semibold text-sm text-rose-600">
                        {item.sourceAccount}
                      </TableCell>
                      <TableCell className="font-semibold text-sm text-emerald-600">
                        {item.destinationAccount}
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm text-foreground">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {item.transferFee > 0 ? formatCurrency(item.transferFee) : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {item.description || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                          onClick={() => handleDelete(item.id)}
                        >
                          <LuTrash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <TablePagination
            currentPage={page}
            pageSize={pageSize}
            totalEntries={filteredData.length}
            totalPages={Math.max(1, Math.ceil(filteredData.length / pageSize))}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <FundTransferFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
