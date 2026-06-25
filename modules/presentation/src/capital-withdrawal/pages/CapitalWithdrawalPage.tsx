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
  LuArrowDownLeft,
} from "@erp-digital-printing/ui/icons";
import { CapitalWithdrawalFormDialog } from "../components/CapitalWithdrawalFormDialog";

interface CapitalWithdrawal {
  id: string;
  date: string;
  investorName: string;
  amount: number;
  paymentMethod: string;
  description: string;
}

const MOCK_WITHDRAWALS: CapitalWithdrawal[] = [
  {
    id: "PRV-001",
    date: "2026-06-25",
    investorName: "Hendra Wijaya",
    amount: 25000000,
    paymentMethod: "Bank BCA",
    description: "Kebutuhan mendesak pribadi",
  },
  {
    id: "PRV-002",
    date: "2026-06-18",
    investorName: "Bagus Yanuar",
    amount: 15000000,
    paymentMethod: "Bank Mandiri",
    description: "Prive bulanan rutin",
  },
];

export default function CapitalWithdrawalPage() {
  const [data, setData] = useState<CapitalWithdrawal[]>(MOCK_WITHDRAWALS);
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
        item.investorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleCreate = (newData: Omit<CapitalWithdrawal, "id">) => {
    const newRecord: CapitalWithdrawal = {
      ...newData,
      id: `PRV-00${data.length + 1}`,
    };
    setData([newRecord, ...data]);
    toast.success(
      "Sukses",
      "Penarikan modal (Prive) berhasil ditambahkan (Mock State)"
    );
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data prive ini?")) {
      setData(data.filter((item) => item.id !== id));
      toast.success(
        "Sukses",
        "Penarikan modal berhasil dihapus (Mock State)"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Penarikan Modal (Prive)
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola dan catat transaksi penarikan modal oleh owner atau investor.
          </p>
        </div>
        <Button
          onClick={() => {
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <LuPlus className="h-4 w-4" />
          Tambah Penarikan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <LuArrowDownLeft className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Penarikan Modal
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {formatCurrency(totalAmount)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <LuWallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Jumlah Transaksi
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {filteredData.length} Transaksi
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
                Metode Sumber Terbanyak
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                Bank BCA
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
                placeholder="Cari investor, keterangan, atau bank..."
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
                  <TableHead className="w-[120px] font-semibold text-xs uppercase tracking-wider">ID Transaksi</TableHead>
                  <TableHead className="w-[120px] font-semibold text-xs uppercase tracking-wider">Tanggal</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Pemilik / Investor</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Kas / Bank Sumber</TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">Nominal</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">Keterangan</TableHead>
                  <TableHead className="w-[80px] text-center font-semibold text-xs uppercase tracking-wider">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      Tidak ada data penarikan modal ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-mono font-bold text-xs text-foreground/80">{item.id}</TableCell>
                      <TableCell className="text-sm">{item.date}</TableCell>
                      <TableCell className="font-semibold text-sm">{item.investorName}</TableCell>
                      <TableCell className="text-sm">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                          <LuBanknote className="h-3 w-3" />
                          {item.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm text-amber-600">
                        {formatCurrency(item.amount)}
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
      <CapitalWithdrawalFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
