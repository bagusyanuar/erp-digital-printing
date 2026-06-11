import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Card, CardHeader, CardContent } from "@erp-digital-printing/ui/Card";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { toast } from "@erp-digital-printing/ui/Toast";
import { DateRangePicker, type DateRange } from "@erp-digital-printing/ui/DateRangePicker";
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
  LuDollarSign,
  LuTrendingUp,
  LuTrendingDown,
  LuCalendar,
  LuSearch,
  LuPlus,
  LuDownload,
  LuFilter,
  LuArrowUpRight,
  LuArrowDownRight,
  LuFileSpreadsheet,
  LuFileText,
  LuWallet,
  LuRefreshCw,
  LuInfo,
} from "@erp-digital-printing/ui/icons";

// Type definitions
interface CashFlowTransaction {
  id: string;
  date: string;
  category: string;
  description: string;
  reference: string;
  type: "masuk" | "keluar";
  method: "Cash" | "Transfer BCA" | "Transfer Mandiri";
  amount: number;
}

// Backend category mappings
const CATEGORY_LABELS: Record<string, string> = {
  ORDER_PAYMENT: "Pembayaran Pesanan",
  CAPITAL_INJECTION: "Setoran Modal",
  EXPENSE: "Pengeluaran / Biaya",
  REFUND: "Pengembalian Dana (Refund)",
  ADJUSTMENT: "Penyesuaian Kas",
  CAPITAL_WITHDRAWAL: "Penarikan Owner (Prive)",
};

// Initial Mock Data
const INITIAL_TRANSACTIONS: CashFlowTransaction[] = [
  {
    id: "TX-001",
    date: "2026-06-11 14:30",
    category: "ORDER_PAYMENT",
    description: "Pembayaran Invoice #INV-2026-0045",
    reference: "INV-2026-0045",
    type: "masuk",
    method: "Cash",
    amount: 1750000,
  },
  {
    id: "TX-002",
    date: "2026-06-11 11:15",
    category: "EXPENSE",
    description: "Pembelian Kertas Art Paper 260gr 10 Rim",
    reference: "PO-2026-0012",
    type: "keluar",
    method: "Transfer BCA",
    amount: 3200000,
  },
  {
    id: "TX-003",
    date: "2026-06-10 16:45",
    category: "ORDER_PAYMENT",
    description: "Pelunasan Invoice #INV-2026-0040 - Biro Mulia",
    reference: "INV-2026-0040",
    type: "masuk",
    method: "Transfer Mandiri",
    amount: 12500000,
  },
  {
    id: "TX-004",
    date: "2026-06-10 09:00",
    category: "EXPENSE",
    description: "Biaya Listrik Kantor & Workshop Mei 2026",
    reference: "OP-2026-0008",
    type: "keluar",
    method: "Transfer BCA",
    amount: 4500000,
  },
  {
    id: "TX-005",
    date: "2026-06-09 15:20",
    category: "ORDER_PAYMENT",
    description: "DP Pesanan Cetak Spanduk Flexi #INV-2026-0049",
    reference: "INV-2026-0049",
    type: "masuk",
    method: "Cash",
    amount: 850000,
  },
  {
    id: "TX-006",
    date: "2026-06-09 10:30",
    category: "EXPENSE",
    description: "Pembayaran Gaji Operator Cetak A3+ & Finishing",
    reference: "PAY-2026-0005",
    type: "keluar",
    method: "Transfer Mandiri",
    amount: 15400000,
  },
  {
    id: "TX-007",
    date: "2026-06-08 17:00",
    category: "ORDER_PAYMENT",
    description: "Pembayaran Invoice #INV-2026-0038 - CV Lancar",
    reference: "INV-2026-0038",
    type: "masuk",
    method: "Transfer BCA",
    amount: 8900000,
  },
  {
    id: "TX-008",
    date: "2026-06-08 13:00",
    category: "EXPENSE",
    description: "Service & Kalibrasi Mesin Konica Minolta C6085",
    reference: "MNT-2026-0002",
    type: "keluar",
    method: "Cash",
    amount: 2500000,
  },
  {
    id: "TX-009",
    date: "2026-06-07 11:00",
    category: "ADJUSTMENT",
    description: "Selisih lebih kas saat tutup laci kasir",
    reference: "ADJ-2026-0001",
    type: "masuk",
    method: "Cash",
    amount: 650000,
  },
  {
    id: "TX-010",
    date: "2026-06-06 14:00",
    category: "EXPENSE",
    description: "Tinta Inkjet Mimaki Eco-Solvent Cyan & Magenta",
    reference: "PO-2026-0010",
    type: "keluar",
    method: "Transfer BCA",
    amount: 5800000,
  },
];

const CashFlowPage = () => {
  // States
  const [transactions, setTransactions] = useState<CashFlowTransaction[]>(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"semua" | "masuk" | "keluar">("semua");
  const [categoryFilter, setCategoryFilter] = useState<string>("semua");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(undefined);

  // Pagination States
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  
  // Add Transaction Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formType, setFormType] = useState<"masuk" | "keluar">("masuk");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formMethod, setFormMethod] = useState<"Cash" | "Transfer BCA" | "Transfer Mandiri">("Cash");
  const [formReference, setFormReference] = useState("");

  // Categories list based on type (Backend specific)
  const incomeCategories = ["ORDER_PAYMENT", "CAPITAL_INJECTION", "ADJUSTMENT"];
  const expenseCategories = ["EXPENSE", "REFUND", "ADJUSTMENT", "CAPITAL_WITHDRAWAL"];

  // Unique categories helper for filter dropdown
  const allCategories = useMemo(() => {
    return Array.from(new Set(transactions.map((tx) => tx.category)));
  }, [transactions]);

  // Handle manual transaction submit
  const handleAddTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategory || !formDescription || !formAmount) {
      toast.error("Form Belum Lengkap", "Silakan isi kategori, deskripsi, dan nominal.");
      return;
    }

    const amountNum = parseFloat(formAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Nominal Tidak Valid", "Nominal transaksi harus lebih besar dari 0.");
      return;
    }

    const newTx: CashFlowTransaction = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      category: formCategory,
      description: formDescription,
      reference: formReference || `MAN-${Date.now().toString().slice(-4)}`,
      type: formType,
      method: formMethod,
      amount: amountNum,
    };

    setTransactions([newTx, ...transactions]);
    setIsAddModalOpen(false);
    toast.success(
      "Transaksi Ditambahkan",
      `Berhasil mencatat kas ${formType === "masuk" ? "masuk" : "keluar"} senilai Rp ${amountNum.toLocaleString("id-ID")}`
    );

    // Reset Form
    setFormCategory("");
    setFormDescription("");
    setFormAmount("");
    setFormMethod("Cash");
    setFormReference("");
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type Filter
      if (typeFilter !== "semua" && tx.type !== typeFilter) return false;

      // Category Filter
      if (categoryFilter !== "semua" && tx.category !== categoryFilter) return false;

      // Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchSearch =
          tx.category.toLowerCase().includes(query) ||
          tx.description.toLowerCase().includes(query) ||
          tx.reference.toLowerCase().includes(query);
        if (!matchSearch) return false;
      }

      // Date Range Filter
      if (selectedDateRange?.from) {
        const txDate = new Date(tx.date);
        const fromDate = new Date(selectedDateRange.from);
        fromDate.setHours(0, 0, 0, 0);

        const toDate = selectedDateRange.to ? new Date(selectedDateRange.to) : new Date(selectedDateRange.from);
        toDate.setHours(23, 59, 59, 999);

        if (txDate < fromDate || txDate > toDate) return false;
      }

      return true;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter, selectedDateRange]);

  // Paginated transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [filteredTransactions, page, pageSize]);

  // Financial Summary Computations
  const summary = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    filteredTransactions.forEach((tx) => {
      if (tx.type === "masuk") {
        totalIn += tx.amount;
      } else {
        totalOut += tx.amount;
      }
    });

    // Calculate absolute running balance from all transactions (unfiltered)
    let absoluteNet = 0;
    transactions.forEach((tx) => {
      if (tx.type === "masuk") {
        absoluteNet += tx.amount;
      } else {
        absoluteNet -= tx.amount;
      }
    });

    return {
      totalIn,
      totalOut,
      net: totalIn - totalOut,
      absoluteNet,
    };
  }, [filteredTransactions, transactions]);

  // Category breakdown calculation
  const categoryChartData = useMemo(() => {
    const data: Record<string, { in: number; out: number }> = {};
    filteredTransactions.forEach((tx) => {
      const catData = data[tx.category] || { in: 0, out: 0 };
      if (tx.type === "masuk") {
        catData.in += tx.amount;
      } else {
        catData.out += tx.amount;
      }
      data[tx.category] = catData;
    });

    return Object.entries(data).map(([name, val]) => ({
      name,
      masuk: val.in,
      keluar: val.out,
      total: val.in + val.out,
    })).sort((a, b) => b.total - a.total);
  }, [filteredTransactions]);

  // Simulate Export Trigger
  const handleExport = (format: "pdf" | "excel") => {
    toast.success(
      "Mengekspor Laporan...",
      `Sedang menyiapkan laporan Cash Flow dalam format ${format.toUpperCase()}.`
    );
  };

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border/10 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuWallet className="text-primary" size={32} />
            Laporan Arus Kas (Cash Flow)
          </h1>
          <p className="text-muted-foreground font-medium">
            Pemantauan langsung kas masuk, kas keluar, dan profitabilitas operasional toko digital printing.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-row items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("pdf")}
            className="h-9 px-3 rounded-xl font-bold border-border hover:bg-muted/70 flex items-center gap-1.5 text-xs"
          >
            <LuFileText size={14} className="text-rose-500" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("excel")}
            className="h-9 px-3 rounded-xl font-bold border-border hover:bg-muted/70 flex items-center gap-1.5 text-xs"
          >
            <LuFileSpreadsheet size={14} className="text-emerald-600" />
            Export Excel
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 px-4 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 text-xs"
          >
            <LuPlus size={16} />
            Penyesuaian Kas
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Net Cash */}
        <Card className="rounded-3xl border border-border/50 bg-gradient-to-br from-card to-muted/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total Saldo Kas Aktual
              </span>
              <div className="p-2 bg-primary/10 rounded-xl">
                <LuDollarSign size={20} className="text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black tracking-tight text-foreground">
                Rp {summary.absoluteNet.toLocaleString("id-ID")}
              </h3>
              <p className="text-[10px] text-muted-foreground font-semibold">
                Akumulasi seluruh mutasi kas berjalan
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card Period Balance */}
        <Card className="rounded-3xl border border-border/50 bg-gradient-to-br from-card to-blue-50/5 dark:to-blue-950/5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Saldo Kas Periode
              </span>
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <LuRefreshCw size={20} className="text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className={`text-2xl font-black tracking-tight ${summary.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                Rp {summary.net.toLocaleString("id-ID")}
              </h3>
              <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                <span className={`font-bold ${summary.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {summary.net >= 0 ? "Surplus" : "Defisit"}
                </span>
                selisih arus kas periode ini
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card Inflow */}
        <Card className="rounded-3xl border border-border/50 bg-gradient-to-br from-card to-emerald-50/5 dark:to-emerald-950/5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Kas Masuk (Inflow)
              </span>
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <LuTrendingUp size={20} className="text-emerald-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black tracking-tight text-foreground">
                Rp {summary.totalIn.toLocaleString("id-ID")}
              </h3>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <LuArrowUpRight size={14} />
                Dari retail & invoice biro
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card Outflow */}
        <Card className="rounded-3xl border border-border/50 bg-gradient-to-br from-card to-rose-50/5 dark:to-rose-950/5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Kas Keluar (Outflow)
              </span>
              <div className="p-2 bg-rose-500/10 rounded-xl">
                <LuTrendingDown size={20} className="text-rose-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black tracking-tight text-foreground">
                Rp {summary.totalOut.toLocaleString("id-ID")}
              </h3>
              <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                <LuArrowDownRight size={14} />
                Bahan baku, gaji, & operasional
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Data & Filters */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Table & Filtering */}
        <div className="space-y-6">
          <Card className="rounded-3xl border border-border/50 shadow-sm overflow-hidden bg-card">
            
            {/* Filter Controls Header */}
            <CardHeader className="p-6 border-b border-border/30 bg-card space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Search */}
                <div className="w-full md:max-w-xs">
                  <TextField
                    placeholder="Cari deskripsi, no. referensi..."
                    prefixIcon={LuSearch}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full"
                  />
                </div>

                {/* Filter Controls & Dates */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                  <div className="w-full md:w-64">
                    <DateRangePicker
                      value={selectedDateRange}
                      onChange={(range) => {
                        setSelectedDateRange(range);
                        setPage(1);
                      }}
                      isClearable
                      placeholder="Filter tanggal..."
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="semua">Semua Kategori</option>
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat] || cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Type Filter Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant={typeFilter === "semua" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setTypeFilter("semua");
                    setPage(1);
                  }}
                  className={`h-8 rounded-lg text-xs font-bold ${
                    typeFilter === "semua" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  Semua Arus Kas
                </Button>
                <Button
                  variant={typeFilter === "masuk" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setTypeFilter("masuk");
                    setPage(1);
                  }}
                  className={`h-8 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    typeFilter === "masuk"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "hover:bg-muted text-muted-foreground border-emerald-200/50"
                  }`}
                >
                  <LuArrowUpRight size={14} />
                  Kas Masuk
                </Button>
                <Button
                  variant={typeFilter === "keluar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setTypeFilter("keluar");
                    setPage(1);
                  }}
                  className={`h-8 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    typeFilter === "keluar"
                      ? "bg-rose-600 text-white hover:bg-rose-700"
                      : "hover:bg-muted text-muted-foreground border-rose-200/50"
                  }`}
                >
                  <LuArrowDownRight size={14} />
                  Kas Keluar
                </Button>
              </div>
            </CardHeader>

            {/* Table Content */}
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu / Tanggal</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Deskripsi & Ref</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Jumlah (Rp)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map((tx) => {
                      const isMasuk = tx.type === "masuk";
                      return (
                        <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <LuCalendar size={13} className="text-primary/70" />
                              {tx.date}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className="text-sm font-bold text-foreground">{CATEGORY_LABELS[tx.category] || tx.category}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5 max-w-xs">
                              <span className="text-xs text-foreground font-semibold line-clamp-1">
                                {tx.description}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded w-max border border-border/30">
                                Ref: {tx.reference}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className="text-xs font-semibold px-2 py-0.5 bg-muted rounded-md text-foreground/80 border border-border/50">
                              {tx.method}
                            </span>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <span
                              className={`text-sm font-extrabold flex items-center justify-end gap-1.5 ${
                                isMasuk ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {isMasuk ? (
                                <LuArrowUpRight size={14} className="stroke-[3]" />
                              ) : (
                                <LuArrowDownRight size={14} className="stroke-[3]" />
                              )}
                              Rp {tx.amount.toLocaleString("id-ID")}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-semibold">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <LuInfo size={24} className="text-muted-foreground/60" />
                          <span>Tidak ada transaksi arus kas ditemukan.</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>

            {/* Table Pagination */}
            <TablePagination
              currentPage={page}
              totalPages={Math.ceil(filteredTransactions.length / pageSize) || 1}
              pageSize={pageSize}
              totalEntries={filteredTransactions.length}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setPage(1);
              }}
            />
          </Card>
        </div>

        {/* Right Sidebar Breakdown (Right Column 1x wide) - Commented out for now
        <div className="space-y-6">
          <Card className="rounded-3xl border border-border/50 shadow-sm bg-card overflow-hidden">
            <CardHeader className="p-6 border-b border-border/30">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <LuTrendingUp className="text-primary" size={18} />
                Distribusi Kategori Kas
              </h3>
              <p className="text-xs text-muted-foreground">Volume transaksi terbesar berdasarkan alokasi kategori.</p>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {categoryChartData.length > 0 ? (
                categoryChartData.slice(0, 5).map((data, idx) => {
                  const maxTotal = Math.max(...categoryChartData.map((d) => d.total));
                  const percentage = maxTotal > 0 ? (data.total / maxTotal) * 100 : 0;
                  
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">{data.name}</span>
                        <span className="font-extrabold text-foreground/80">
                          Rp {data.total.toLocaleString("id-ID")}
                        </span>
                      </div>
                      
                      <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                        {data.masuk > 0 && (
                          <div
                            style={{ width: `${(data.masuk / data.total) * percentage}%` }}
                            className="h-full bg-emerald-500 transition-all duration-500"
                            title={`Masuk: Rp ${data.masuk.toLocaleString("id-ID")}`}
                          />
                        )}
                        {data.keluar > 0 && (
                          <div
                            style={{ width: `${(data.keluar / data.total) * percentage}%` }}
                            className="h-full bg-rose-500 transition-all duration-500"
                            title={`Keluar: Rp ${data.keluar.toLocaleString("id-ID")}`}
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                        <span className="flex items-center gap-0.5 text-emerald-600">
                          In: Rp {data.masuk.toLocaleString("id-ID")}
                        </span>
                        <span className="flex items-center gap-0.5 text-rose-600">
                          Out: Rp {data.keluar.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-xs text-muted-foreground py-8 font-semibold">
                  Data visualisasi belum tersedia
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <h4 className="text-sm font-black text-primary flex items-center gap-2">
                <LuInfo size={16} />
                Analisis Kas Cepat
              </h4>
              <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
                Cash Flow saat ini berada dalam kondisi{" "}
                <span className={`font-black ${summary.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {summary.net >= 0 ? "SURPLUS (Positif)" : "DEFISIT (Negatif)"}
                </span>.
                Total kas masuk mengover kebutuhan belanja operasional dengan sisa margin bersih{" "}
                <span className="font-extrabold text-foreground">
                  Rp {Math.abs(summary.net).toLocaleString("id-ID")}
                </span>.
              </p>
              <div className="text-[11px] text-muted-foreground border-t border-primary/10 pt-2 flex items-center justify-between">
                <span>Rasio Arus Kas:</span>
                <span className="font-bold text-foreground">
                  {(summary.totalOut > 0 ? (summary.totalIn / summary.totalOut).toFixed(2) : summary.totalIn > 0 ? "Surplus" : "0")}x (In vs Out)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        */}
      </div>

      {/* Catat Kas Manual Modal */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        size="md"
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        <form onSubmit={handleAddTransactionSubmit} className="space-y-5 flex flex-col overflow-hidden">
          
          {/* Modal Header */}
          <div className="flex flex-col gap-1 border-b border-border/30 pb-4 pr-10">
            <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
              <LuPlus className="text-primary" size={22} />
              Penyesuaian Kas Manual
            </h2>
            <p className="text-xs text-muted-foreground font-semibold">
              Gunakan form ini untuk mencatat mutasi penyesuaian kas (debit/kredit) secara manual.
            </p>
          </div>

          {/* Form Content (Scrollable if needed) */}
          <div className="space-y-4 overflow-y-auto pr-1">
            
            {/* Cash Flow Type Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Tipe Mutasi
              </label>
              <div className="grid grid-cols-2 gap-3 bg-muted p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setFormType("masuk");
                    setFormCategory(incomeCategories[0] ?? "");
                  }}
                  className={`py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    formType === "masuk"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LuArrowUpRight size={14} />
                  Kas Masuk (Inflow)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormType("keluar");
                    setFormCategory(expenseCategories[0] ?? "");
                  }}
                  className={`py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    formType === "keluar"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LuArrowDownRight size={14} />
                  Kas Keluar (Outflow)
                </button>
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Kategori
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="">Pilih Kategori...</option>
                {formType === "masuk"
                  ? incomeCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat] || cat}
                      </option>
                    ))
                  : expenseCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat] || cat}
                      </option>
                    ))}
              </select>
            </div>

            {/* Description / Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Catatan / Keterangan
              </label>
              <TextField
                placeholder="Misal: Pembayaran listrik bulanan, beli lem..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Nominal / Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Nominal Transaksi (Rp)
              </label>
              <TextField
                type="number"
                placeholder="Masukkan nominal Rp..."
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="w-full font-bold"
                required
              />
            </div>

            {/* Payment / Transmit Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["Cash", "Transfer BCA", "Transfer Mandiri"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormMethod(method)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                      formMethod === method
                        ? "border-primary bg-primary/5 text-primary font-black"
                        : "border-border/60 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                No. Referensi / Nota (Opsional)
              </label>
              <TextField
                placeholder="Misal: INV-2026-X, PO-X, dll..."
                value={formReference}
                onChange={(e) => setFormReference(e.target.value)}
                className="w-full"
              />
            </div>

          </div>

          {/* Dialog Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="h-10 px-5 rounded-xl font-bold border-border hover:bg-muted/50 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="h-10 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 text-xs transition-all active:scale-95"
            >
              Simpan Mutasi
            </Button>
          </div>

        </form>
      </Dialog>

    </div>
  );
};

export default CashFlowPage;

