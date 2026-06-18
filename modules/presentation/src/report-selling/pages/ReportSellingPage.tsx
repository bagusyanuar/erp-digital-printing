import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardContent } from "@erp-digital-printing/ui/Card";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
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
  LuTrendingUp,
  LuSearch,
  LuFileSpreadsheet,
  LuReceipt,
  LuDollarSign,
  LuPercent,
  LuUsers,
  LuShoppingBag,
} from "@erp-digital-printing/ui/icons";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  Legend,
  PieChart,
  Pie,
} from "recharts";

interface SalesTransaction {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerType: "retail" | "reseller" | "corporate";
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  status: "PAID" | "DOWN_PAYMENT" | "UNPAID";
  productCategory: string;
  createdAt: string;
}

const MOCK_SALES: SalesTransaction[] = [
  {
    id: "1",
    invoiceNumber: "INV/2026/06/001",
    customerName: "Budi Santoso",
    customerType: "retail",
    totalAmount: 150000,
    paidAmount: 150000,
    paymentMethod: "QRIS",
    status: "PAID",
    productCategory: "Banner/Spanduk",
    createdAt: "2026-06-12",
  },
  {
    id: "2",
    invoiceNumber: "INV/2026/06/002",
    customerName: "CV. Makmur Jaya",
    customerType: "corporate",
    totalAmount: 4500000,
    paidAmount: 2000000,
    paymentMethod: "Transfer Bank",
    status: "DOWN_PAYMENT",
    productCategory: "Brochure/Flyer",
    createdAt: "2026-06-13",
  },
  {
    id: "3",
    invoiceNumber: "INV/2026/06/003",
    customerName: "Rian Printing (Reseller)",
    customerType: "reseller",
    totalAmount: 850000,
    paidAmount: 850000,
    paymentMethod: "Cash",
    status: "PAID",
    productCategory: "Sticker Vinyl",
    createdAt: "2026-06-14",
  },
  {
    id: "4",
    invoiceNumber: "INV/2026/06/004",
    customerName: "Siti Rahma",
    customerType: "retail",
    totalAmount: 75000,
    paidAmount: 75000,
    paymentMethod: "QRIS",
    status: "PAID",
    productCategory: "Dokumen A4",
    createdAt: "2026-06-15",
  },
  {
    id: "5",
    invoiceNumber: "INV/2026/06/005",
    customerName: "Anto Wijaya",
    customerType: "retail",
    totalAmount: 320000,
    paidAmount: 0,
    paymentMethod: "Cash",
    status: "UNPAID",
    productCategory: "Merchandise",
    createdAt: "2026-06-16",
  },
  {
    id: "6",
    invoiceNumber: "INV/2026/06/006",
    customerName: "Indo Media Perkasa",
    customerType: "corporate",
    totalAmount: 12500000,
    paidAmount: 12500000,
    paymentMethod: "Transfer Bank",
    status: "PAID",
    productCategory: "Banner/Spanduk",
    createdAt: "2026-06-16",
  },
  {
    id: "7",
    invoiceNumber: "INV/2026/06/007",
    customerName: "Dewi Lestari",
    customerType: "reseller",
    totalAmount: 1200000,
    paidAmount: 600000,
    paymentMethod: "QRIS",
    status: "DOWN_PAYMENT",
    productCategory: "Sticker Vinyl",
    createdAt: "2026-06-17",
  },
  {
    id: "8",
    invoiceNumber: "INV/2026/06/008",
    customerName: "Rahmat Hidayat",
    customerType: "retail",
    totalAmount: 45000,
    paidAmount: 45000,
    paymentMethod: "Cash",
    status: "PAID",
    productCategory: "Kartu Nama",
    createdAt: "2026-06-18",
  },
];

// Mock data for trends
const MOCK_REVENUE_TRENDS = [
  { name: "12 Jun", omset: 150000, cashflow: 150000 },
  { name: "13 Jun", omset: 4500000, cashflow: 2000000 },
  { name: "14 Jun", omset: 850000, cashflow: 850000 },
  { name: "15 Jun", omset: 75000, cashflow: 75000 },
  { name: "16 Jun", omset: 12820000, cashflow: 12500000 },
  { name: "17 Jun", omset: 1200000, cashflow: 600000 },
  { name: "18 Jun", omset: 45000, cashflow: 45000 },
];

const MOCK_CATEGORIES = [
  { name: "Banner/Spanduk", value: 12650000, count: 2 },
  { name: "Brochure/Flyer", value: 4500000, count: 1 },
  { name: "Sticker Vinyl", value: 2050000, count: 2 },
  { name: "Merchandise", value: 320000, count: 1 },
  { name: "Dokumen A4", value: 75000, count: 1 },
  { name: "Kartu Nama", value: 45000, count: 1 },
];

const MOCK_PAYMENTS = [
  { name: "Transfer Bank", value: 14500000 },
  { name: "QRIS", value: 1425000 },
  { name: "Cash", value: 970000 },
];

const MOCK_CUSTOMER_TYPES = [
  { name: "Corporate", value: 17000000 },
  { name: "Reseller", value: 2050000 },
  { name: "Retail / Walk-in", value: 590000 },
];

const COLORS = ["var(--color-primary, #3b82f6)", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const ReportSellingPage = () => {
  const [activeTab, setActiveTab] = useState<"data" | "analytic">("data");
  const [searchQuery, setSearchQuery] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date("2026-06-01"),
    to: new Date("2026-06-30"),
  });

  // Filtering Logic
  const filteredSales = useMemo(() => {
    return MOCK_SALES.filter((sale) => {
      const matchesSearch =
        sale.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.productCategory.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType =
        customerTypeFilter === "all" || sale.customerType === customerTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [searchQuery, customerTypeFilter]);

  // Statistics calculation based on filtered data
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalReceivables = 0;

    filteredSales.forEach((sale) => {
      totalRevenue += sale.totalAmount;
      totalPaid += sale.paidAmount;
      totalReceivables += sale.totalAmount - sale.paidAmount;
    });

    const completionRate = filteredSales.length > 0 
      ? Math.round((filteredSales.filter((s) => s.status === "PAID").length / filteredSales.length) * 100) 
      : 0;

    return {
      totalRevenue,
      totalPaid,
      totalReceivables,
      completionRate,
      transactionCount: filteredSales.length,
    };
  }, [filteredSales]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuTrendingUp className="text-primary" size={32} />
            Laporan Penjualan
          </h1>
          <p className="text-muted-foreground font-medium">
            Pantau performa penjualan cetakan, statistik omset, dan analisis produk terlaris secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl flex items-center gap-2 font-bold h-10 border-border/40 hover:bg-muted"
          >
            <LuFileSpreadsheet size={16} />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <Card className="rounded-3xl border-border/50 shadow-sm">
        <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-[320px]">
              <TextField
                placeholder="Cari invoice, pelanggan..."
                prefixIcon={LuSearch}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10"
              />
            </div>

            <div className="w-full sm:w-auto">
              <select
                value={customerTypeFilter}
                onChange={(e) => setCustomerTypeFilter(e.target.value)}
                className="w-full sm:w-[160px] h-10 px-3 rounded-xl border border-border/50 bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Semua Tipe</option>
                <option value="retail">Retail / Walk-in</option>
                <option value="reseller">Reseller</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              isClearable
              className="w-full sm:w-[260px] h-10 rounded-xl"
            />
          </div>
        </div>
      </Card>

      {/* Main Tabs Segmented Control */}
      <div className="flex border-b border-border/40 pb-px">
        <div className="flex gap-2 bg-muted/50 p-1 rounded-xl border border-border/30">
          <button
            onClick={() => setActiveTab("data")}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "data"
                ? "bg-background shadow-md text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Daftar Transaksi
          </button>
          <button
            onClick={() => setActiveTab("analytic")}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "analytic"
                ? "bg-background shadow-md text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Analitik & Grafik
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "data" ? (
        <div className="space-y-6">
          {/* KPI Statistics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Omset Penjualan</span>
                  <div className="text-2xl font-black tracking-tight text-foreground">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <LuDollarSign size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kas Masuk (Cash In)</span>
                  <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-500">
                    {formatCurrency(stats.totalPaid)}
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-500">
                  <LuReceipt size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Piutang</span>
                  <div className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-500">
                    {formatCurrency(stats.totalReceivables)}
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-500">
                  <LuUsers size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pelunasan Invoice</span>
                  <div className="text-2xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
                    {stats.completionRate}%
                  </div>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <LuPercent size={24} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table Card */}
          <Card className="rounded-3xl overflow-hidden border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Kategori Cetak</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead className="text-right">Total Transaksi</TableHead>
                      <TableHead className="text-right">Jumlah Dibayar</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id} className="hover:bg-muted/30">
                        <TableCell className="font-bold text-foreground">{sale.invoiceNumber}</TableCell>
                        <TableCell className="font-medium text-foreground">{sale.customerName}</TableCell>
                        <TableCell>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            sale.customerType === "corporate"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                              : sale.customerType === "reseller"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}>
                            {sale.customerType.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{sale.productCategory}</TableCell>
                        <TableCell className="font-medium">{sale.paymentMethod}</TableCell>
                        <TableCell className="text-right font-bold text-foreground">
                          {formatCurrency(sale.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-muted-foreground">
                          {formatCurrency(sale.paidAmount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                            sale.status === "PAID"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : sale.status === "DOWN_PAYMENT"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
                          }`}>
                            {sale.status === "PAID"
                              ? "LUNAS"
                              : sale.status === "DOWN_PAYMENT"
                              ? "DOWN PAYMENT"
                              : "BELUM BAYAR"}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm font-medium">{sale.createdAt}</TableCell>
                      </TableRow>
                    ))}
                    {filteredSales.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                          Tidak ada transaksi penjualan ditemukan.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <TablePagination
                currentPage={page}
                totalPages={Math.ceil(filteredSales.length / pageSize) || 1}
                pageSize={pageSize}
                totalEntries={filteredSales.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
          {/* Revenue and Cash Flow Trend Chart */}
          <Card className="rounded-3xl border-border/50 shadow-sm p-6 bg-card">
            <div className="space-y-1 mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <LuTrendingUp className="text-primary" />
                Tren Pendapatan & Kas Masuk
              </h3>
              <p className="text-xs text-muted-foreground">
                Perbandingan total nilai pesanan (omset) dengan uang kas yang diterima harian.
              </p>
            </div>
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_REVENUE_TRENDS}>
                  <defs>
                    <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156,163,175,0.15)" />
                  <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} />
                  <YAxis
                    stroke="currentColor"
                    className="text-muted-foreground text-xs"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card, #fff)",
                      borderColor: "rgba(156,163,175,0.2)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: unknown) => [formatCurrency(Number(value || 0)), ""]}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area
                    type="monotone"
                    name="Omset Penjualan"
                    dataKey="omset"
                    stroke="var(--color-primary, #3b82f6)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOmset)"
                  />
                  <Area
                    type="monotone"
                    name="Kas Masuk"
                    dataKey="cashflow"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCash)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Grid for product distribution and demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Products Category Performance */}
            <Card className="rounded-3xl border-border/50 shadow-sm p-6 bg-card">
              <div className="space-y-1 mb-6">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <LuShoppingBag className="text-indigo-500" />
                  Kategori Cetakan Terlaris (Rp)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Kontribusi omset penjualan berdasarkan kategori produk cetak.
                </p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_CATEGORIES} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(156,163,175,0.15)" />
                    <XAxis
                      type="number"
                      stroke="currentColor"
                      className="text-muted-foreground text-xs"
                      tickLine={false}
                      tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(1)}M`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="currentColor"
                      className="text-foreground text-xs font-medium"
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card, #fff)",
                        borderColor: "rgba(156,163,175,0.2)",
                        borderRadius: "12px",
                      }}
                      formatter={(value: unknown) => [formatCurrency(Number(value || 0)), "Omset"]}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {MOCK_CATEGORIES.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Demographics & Payments Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Payment Methods Chart */}
              <Card className="rounded-3xl border-border/50 shadow-sm p-6 bg-card flex flex-col justify-between">
                <div className="space-y-1 mb-4">
                  <h3 className="text-md font-bold text-foreground">Metode Pembayaran</h3>
                  <p className="text-xs text-muted-foreground">Rasio penggunaan channel pembayaran.</p>
                </div>
                <div className="h-[200px] w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MOCK_PAYMENTS}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {MOCK_PAYMENTS.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: unknown) => [formatCurrency(Number(value || 0)), "Total"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {MOCK_PAYMENTS.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-foreground">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Customer Types Chart */}
              <Card className="rounded-3xl border-border/50 shadow-sm p-6 bg-card flex flex-col justify-between">
                <div className="space-y-1 mb-4">
                  <h3 className="text-md font-bold text-foreground">Segmentasi Pelanggan</h3>
                  <p className="text-xs text-muted-foreground">Proporsi kontribusi omset dari tiap tipe pelanggan.</p>
                </div>
                <div className="h-[200px] w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MOCK_CUSTOMER_TYPES}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {MOCK_CUSTOMER_TYPES.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: unknown) => [formatCurrency(Number(value || 0)), "Total"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {MOCK_CUSTOMER_TYPES.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[(idx + 3) % COLORS.length] }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-foreground">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportSellingPage;
