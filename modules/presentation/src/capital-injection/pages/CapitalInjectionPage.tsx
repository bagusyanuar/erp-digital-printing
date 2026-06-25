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
  LuArrowUpRight,
} from "@erp-digital-printing/ui/icons";
import { CapitalInjectionFormDialog } from "../components/CapitalInjectionFormDialog";

// Simple mock data for slicing
interface CapitalInjection {
  id: string;
  date: string;
  investorName: string;
  amount: number;
  paymentMethod: string;
  description: string;
}

const MOCK_CAPITALS: CapitalInjection[] = [
  {
    id: "CAP-001",
    date: "2026-06-25",
    investorName: "Hendra Wijaya",
    amount: 150000000,
    paymentMethod: "Bank BCA",
    description: "Setoran modal awal ekspansi cabang baru",
  },
  {
    id: "CAP-002",
    date: "2026-06-20",
    investorName: "Bagus Yanuar",
    amount: 75000000,
    paymentMethod: "Bank Mandiri",
    description: "Tambahan modal kerja untuk stok kertas",
  },
  {
    id: "CAP-003",
    date: "2026-06-15",
    investorName: "Hendra Wijaya",
    amount: 50000000,
    paymentMethod: "Kas Besar",
    description: "Suntikan dana tunai operasional cetak",
  },
];

export default function CapitalInjectionPage() {
  const [data, setData] = useState<CapitalInjection[]>(MOCK_CAPITALS);
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
  const [selectedCapital, setSelectedCapital] = useState<CapitalInjection | null>(null);

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

  const handleCreate = (newData: Omit<CapitalInjection, "id">) => {
    const newRecord: CapitalInjection = {
      ...newData,
      id: `CAP-00${data.length + 1}`,
    };
    setData([newRecord, ...data]);
    toast.success(
      "Sukses",
      "Setoran modal berhasil ditambahkan (Mock State)"
    );
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data setoran modal ini?")) {
      setData(data.filter((item) => item.id !== id));
      toast.success(
        "Sukses",
        "Setoran modal berhasil dihapus (Mock State)"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Setoran Modal
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola dan catat transaksi penyetoran modal dari investor atau owner.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedCapital(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <LuPlus className="h-4 w-4" />
          Tambah Setoran Modal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-border/50 overflow-hidden relative shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card via-card to-primary/5">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Total Setoran Modal
              </span>
              <h3 className="text-2xl font-black text-foreground tracking-tight">
                {formatCurrency(totalAmount)}
              </h3>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                Akumulasi modal terdaftar periode ini
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <LuBanknote size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/50 overflow-hidden relative shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card via-card to-emerald-500/5">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Transaksi Aktif
              </span>
              <h3 className="text-2xl font-black text-foreground tracking-tight">
                {filteredData.length} Transaksi
              </h3>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                Jumlah pencatatan transaksi modal
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-sm">
              <LuArrowUpRight size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/50 overflow-hidden relative shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card via-card to-amber-500/5">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Sumber Kas Terbanyak
              </span>
              <h3 className="text-xl font-bold text-foreground tracking-tight mt-1">
                Bank BCA
              </h3>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                Metode penyetoran paling sering digunakan
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-sm">
              <LuWallet size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card className="rounded-2xl border border-border/50 bg-card shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search and Date Filter */}
            <div className="flex flex-1 flex-col md:flex-row gap-3 w-full">
              <div className="relative flex-1">
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <TextField
                  placeholder="Cari investor, kas/bank atau keterangan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              <div className="w-full md:w-auto">
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Pilih rentang tanggal"
                />
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto justify-end">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSearchQuery("");
                  setDateRange(undefined);
                }}
                title="Reset Filter"
              >
                <LuRefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-border/50 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead className="w-[120px]">Tanggal</TableHead>
                  <TableHead>Penyetor / Investor</TableHead>
                  <TableHead>Metode Setoran</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="w-[80px] text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      Tidak ada data setoran modal.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold text-primary">{item.id}</TableCell>
                      <TableCell className="text-muted-foreground">{item.date}</TableCell>
                      <TableCell className="font-medium text-foreground">{item.investorName}</TableCell>
                      <TableCell className="text-foreground">{item.paymentMethod}</TableCell>
                      <TableCell className="text-right font-bold text-emerald-600">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs max-w-xs truncate">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <LuTrash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              currentPage={page}
              pageSize={pageSize}
              totalEntries={filteredData.length}
              totalPages={Math.max(1, Math.ceil(filteredData.length / pageSize))}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>

      <CapitalInjectionFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
