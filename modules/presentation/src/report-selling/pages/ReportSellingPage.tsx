import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@erp-digital-printing/ui/Card";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { DateRangePicker } from "@erp-digital-printing/ui/DateRangePicker";
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
import { Checkbox } from "@erp-digital-printing/ui/Checkbox";
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@erp-digital-printing/ui/Combobox";
import {
  LuTrendingUp,
  LuSearch,
  LuFileSpreadsheet,
  LuReceipt,
  LuDollarSign,
  LuPercent,
  LuShoppingBag,
  LuUser,
  LuEllipsisVertical,
  LuPrinter,
  LuFilter,
  LuCircleCheck,
  LuCircleX,
  LuRotateCcw,
} from "@erp-digital-printing/ui/icons";
import DetailReportSelling from "../components/DetailReportSelling";
import AnalyticReportSelling from "../components/AnalyticReportSelling";
import { useReportSelling } from "../hooks/useReportSelling";

const COLORS = [
  "var(--color-primary, #3b82f6)",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const ReportSellingPage = () => {
  const {
    activeTab,
    setActiveTab,
    trendPeriod,
    setTrendPeriod,
    searchQuery,
    setSearchQuery,
    customerTypeFilter,
    setCustomerTypeFilter,
    operatorFilter,
    setOperatorFilter,
    statusFilter,
    setStatusFilter,
    orderStatusFilter,
    setOrderStatusFilter,
    tempCustomerTypeFilter,
    setTempCustomerTypeFilter,
    tempOperatorFilter,
    setTempOperatorFilter,
    tempStatusFilter,
    setTempStatusFilter,
    tempOrderStatusFilter,
    setTempOrderStatusFilter,
    paymentMethodsFilter,
    setPaymentMethodsFilter,
    tempPaymentMethodsFilter,
    setTempPaymentMethodsFilter,
    isFilterOpen,
    setIsFilterOpen,
    page,
    setPage,
    pageSize,
    setPageSize,
    dateRange,
    setDateRange,
    selectedSale,
    setSelectedSale,
    isDetailOpen,
    setIsDetailOpen,
    activeFiltersCount,
    usersData,
    filteredSales,
    stats,
    categoriesData,
    paymentsData,
    customerTypesData,
    trendData,
    formatCurrency,
    isLoading,
    response,
  } = useReportSelling();

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
            Pantau performa penjualan cetakan, statistik omset, dan analisis
            produk terlaris secara real-time.
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
            Analisis & Grafik
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
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Omset Penjualan
                  </span>
                  <div className="text-base font-black tracking-tight text-foreground">
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
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Volume Transaksi
                  </span>
                  <div className="text-base font-black tracking-tight text-foreground">
                    {stats.transactionCount} Nota
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
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Produk Terjual
                  </span>
                  <div className="text-base font-black tracking-tight text-foreground">
                    {stats.totalProductsSold.toLocaleString("id-ID")} Items
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-500">
                  <LuShoppingBag size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status Nota
                  </span>
                  <div className="text-[11px] font-bold text-foreground mt-1 flex flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {stats.paidCount} Lunas
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      {stats.unpaidCount} Belum Lunas
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <LuPercent size={24} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Global Filter Bar (Now inside Data Tab) */}
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
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  isClearable
                  className="w-full sm:w-[260px] h-10 rounded-xl"
                />

                {/* Popover Filter Dropdown */}
                <div className="relative">
                  <Button
                    variant={activeFiltersCount > 0 ? "default" : "outline"}
                    onClick={() => {
                      if (!isFilterOpen) {
                        setTempOperatorFilter(operatorFilter);
                        setTempStatusFilter(statusFilter);
                        setTempCustomerTypeFilter(customerTypeFilter);
                        setTempOrderStatusFilter(orderStatusFilter);
                        setTempPaymentMethodsFilter(paymentMethodsFilter);
                      }
                      setIsFilterOpen(!isFilterOpen);
                    }}
                    className="h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <LuFilter size={14} />
                    Filter
                    {activeFiltersCount > 0 && (
                      <span className="ml-1 bg-primary-foreground text-primary text-[10px] px-1.5 py-0.5 rounded-full font-black leading-none">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>

                  <AnimatePresence>
                    {isFilterOpen && (
                      <>
                        {/* Overlay to close popover when clicked outside */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsFilterOpen(false)}
                        />

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-72 bg-card border border-border/80 shadow-2xl rounded-2xl p-4 space-y-4 z-50 animate-in fade-in duration-200"
                        >
                          {/* Admin */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                              Admin
                            </label>
                            <Combobox
                              value={tempOperatorFilter}
                              onValueChange={(val) => {
                                setTempOperatorFilter(val);
                              }}
                            >
                              <ComboboxTrigger className="w-full text-left font-semibold">
                                <span>
                                  {tempOperatorFilter === "all"
                                    ? "Semua Admin"
                                    : (usersData ?? []).find(
                                        (u) => u.id === tempOperatorFilter,
                                      )?.username || "Pilih Admin"}
                                </span>
                              </ComboboxTrigger>
                              <ComboboxContent
                                align="start"
                                className="w-[var(--radix-popover-trigger-width)]"
                              >
                                <ComboboxInput placeholder="Cari admin..." />
                                <ComboboxEmpty>
                                  Admin tidak ditemukan.
                                </ComboboxEmpty>
                                <ComboboxList>
                                  <ComboboxItem value="all">
                                    Semua Admin
                                  </ComboboxItem>
                                  {(usersData ?? []).map((u) => (
                                    <ComboboxItem key={u.id} value={u.id}>
                                      {u.username}
                                    </ComboboxItem>
                                  ))}
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                          </div>

                          {/* Status Penjualan */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                              Status Pembayaran
                            </label>
                            <Combobox
                              value={tempStatusFilter}
                              onValueChange={(val) => {
                                setTempStatusFilter(
                                  val as "all" | "PAID" | "UNPAID",
                                );
                              }}
                            >
                              <ComboboxTrigger className="w-full text-left font-semibold">
                                <span>
                                  {tempStatusFilter === "all"
                                    ? "Semua Status"
                                    : tempStatusFilter === "PAID"
                                      ? "Lunas"
                                      : "Belum Lunas"}
                                </span>
                              </ComboboxTrigger>
                              <ComboboxContent
                                align="start"
                                className="w-[var(--radix-popover-trigger-width)]"
                              >
                                <ComboboxInput placeholder="Cari status..." />
                                <ComboboxEmpty>
                                  Status tidak ditemukan.
                                </ComboboxEmpty>
                                <ComboboxList>
                                  <ComboboxItem value="all">
                                    Semua Status
                                  </ComboboxItem>
                                  <ComboboxItem value="PAID">
                                    Lunas
                                  </ComboboxItem>
                                  <ComboboxItem value="UNPAID">
                                    Belum Lunas
                                  </ComboboxItem>
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                          </div>

                          {/* Status Pesanan */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                              Status Pesanan
                            </label>
                            <Combobox
                              value={tempOrderStatusFilter}
                              onValueChange={(val) => {
                                setTempOrderStatusFilter(
                                  val as "all" | "SUCCESS" | "REFUND",
                                );
                              }}
                            >
                              <ComboboxTrigger className="w-full text-left font-semibold">
                                <span>
                                  {tempOrderStatusFilter === "all"
                                    ? "Semua Pesanan"
                                    : tempOrderStatusFilter === "SUCCESS"
                                      ? "Selesai"
                                      : "Refund"}
                                </span>
                              </ComboboxTrigger>
                              <ComboboxContent
                                align="start"
                                className="w-[var(--radix-popover-trigger-width)]"
                              >
                                <ComboboxInput placeholder="Cari status pesanan..." />
                                <ComboboxEmpty>
                                  Status tidak ditemukan.
                                </ComboboxEmpty>
                                <ComboboxList>
                                  <ComboboxItem value="all">
                                    Semua Pesanan
                                  </ComboboxItem>
                                  <ComboboxItem value="SUCCESS">
                                    Selesai
                                  </ComboboxItem>
                                  <ComboboxItem value="REFUND">
                                    Refund
                                  </ComboboxItem>
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                          </div>

                          {/* Tipe Pelanggan */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                              Tipe Pelanggan
                            </label>
                            <Combobox
                              value={tempCustomerTypeFilter}
                              onValueChange={(val) => {
                                setTempCustomerTypeFilter(val);
                              }}
                            >
                              <ComboboxTrigger className="w-full text-left font-semibold">
                                <span>
                                  {tempCustomerTypeFilter === "all"
                                    ? "Semua Tipe"
                                    : tempCustomerTypeFilter === "retail"
                                      ? "Retail"
                                      : "Biro / Reseller"}
                                </span>
                              </ComboboxTrigger>
                              <ComboboxContent
                                align="start"
                                className="w-[var(--radix-popover-trigger-width)]"
                              >
                                <ComboboxInput placeholder="Cari tipe pelanggan..." />
                                <ComboboxEmpty>
                                  Tipe tidak ditemukan.
                                </ComboboxEmpty>
                                <ComboboxList>
                                  <ComboboxItem value="all">
                                    Semua Tipe
                                  </ComboboxItem>
                                  <ComboboxItem value="retail">
                                    Retail
                                  </ComboboxItem>
                                  <ComboboxItem value="reseller">
                                    Biro / Reseller
                                  </ComboboxItem>
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                          </div>

                          {/* Metode Pembayaran */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                              Metode Pembayaran
                            </label>
                            <div className="flex flex-col gap-2">
                              {(
                                [
                                  { id: "CASH", label: "Tunai / Cash" },
                                  { id: "TRANSFER", label: "Transfer Bank" },
                                  { id: "QRIS", label: "QRIS" },
                                ] as const
                              ).map((method) => {
                                const isChecked =
                                  tempPaymentMethodsFilter.includes(method.id);
                                return (
                                  <label
                                    key={method.id}
                                    className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none"
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        setTempPaymentMethodsFilter((prev) =>
                                          checked
                                            ? [...prev, method.id]
                                            : prev.filter(
                                                (p) => p !== method.id,
                                              ),
                                        );
                                      }}
                                    />
                                    <span className="text-foreground">
                                      {method.label}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-3 border-t border-border/40">
                            <button
                              type="button"
                              onClick={() => {
                                setTempOperatorFilter("all");
                                setTempStatusFilter("all");
                                setTempCustomerTypeFilter("all");
                                setTempOrderStatusFilter("all");
                                setTempPaymentMethodsFilter([]);

                                setOperatorFilter("all");
                                setStatusFilter("all");
                                setCustomerTypeFilter("all");
                                setOrderStatusFilter("all");
                                setPaymentMethodsFilter([]);
                                setPage(1);
                                setIsFilterOpen(false);
                              }}
                              className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Reset Filter
                            </button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setOperatorFilter(tempOperatorFilter);
                                setStatusFilter(tempStatusFilter);
                                setCustomerTypeFilter(tempCustomerTypeFilter);
                                setOrderStatusFilter(tempOrderStatusFilter);
                                setPaymentMethodsFilter(
                                  tempPaymentMethodsFilter,
                                );
                                setPage(1);
                                setIsFilterOpen(false);
                              }}
                              className="h-8 px-4 rounded-xl text-[10px] font-bold"
                            >
                              Terapkan
                            </Button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </Card>

          {/* Transactions Table Card */}
          <Card className="rounded-3xl overflow-hidden border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 border-b border-border/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <TableHead className="py-4 px-5 text-center min-w-[120px]">
                        Tanggal
                      </TableHead>
                      <TableHead className="py-4 px-5">No. Nota</TableHead>
                      <TableHead className="py-4 px-5">Pelanggan</TableHead>
                      <TableHead className="py-4 px-5 text-right">
                        Total Tagihan
                      </TableHead>
                      <TableHead className="py-4 px-5 text-right">
                        Telah Dibayar
                      </TableHead>
                      <TableHead className="py-4 px-5 text-right">
                        Sisa Piutang
                      </TableHead>
                      <TableHead className="py-4 px-5 text-center">
                        Metode Pembayaran
                      </TableHead>
                      <TableHead className="py-4 px-5 text-center min-w-[160px]">
                        Status Pembayaran
                      </TableHead>
                      <TableHead className="py-4 px-5 text-center min-w-[140px]">
                        Status Pesanan
                      </TableHead>
                      <TableHead className="py-4 px-5 w-[150px] min-w-[120px]">
                        Admin
                      </TableHead>
                      <TableHead className="py-4 px-5 text-center">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/20 text-xs font-semibold text-foreground">
                    {isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={11}
                          className="text-center py-12 text-muted-foreground"
                        >
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="relative w-8 h-8">
                              <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            </div>
                            <span>Memuat data laporan...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredSales.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={11}
                          className="text-center py-12 text-muted-foreground"
                        >
                          Tidak ada transaksi penjualan ditemukan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSales.map((sale) => {
                        const outstanding = sale.totalAmount - sale.paidAmount;

                        // Generate a mock job number from the invoice number
                        const mockJobNumber = sale.invoiceNumber.replace(
                          "INV",
                          "JOB",
                        );

                        return (
                          <TableRow
                            key={sale.id}
                            className="hover:bg-muted/20 transition-colors duration-150"
                          >
                            {/* Date */}
                            <TableCell className="py-4 px-5 text-center min-w-[120px]">
                              {sale.createdAt.includes(", ") ? (
                                <div className="text-muted-foreground font-semibold leading-normal">
                                  <div>{sale.createdAt.split(", ")[0]},</div>
                                  <div className="text-[10px]">
                                    {sale.createdAt.split(", ")[1]}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-muted-foreground font-semibold">
                                  {sale.createdAt}
                                </div>
                              )}
                            </TableCell>

                            {/* Invoice Number */}
                            <TableCell className="py-4 px-5 space-y-1">
                              <div className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded-lg border border-border/50 inline-block">
                                {sale.invoiceNumber}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-semibold block">
                                No. Tiket : {mockJobNumber}
                              </div>
                            </TableCell>

                            {/* Customer Info */}
                            <TableCell className="py-4 px-5 space-y-1">
                              <div className="font-bold flex items-center gap-1.5">
                                <LuUser size={13} className="text-primary/70" />
                                {sale.customerName}
                              </div>
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border leading-none ${
                                  sale.customerType === "corporate"
                                    ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50"
                                    : sale.customerType === "reseller"
                                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50"
                                      : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/50"
                                }`}
                              >
                                {sale.customerType === "reseller"
                                  ? "Biro / Reseller"
                                  : sale.customerType === "corporate"
                                    ? "Corporate"
                                    : "Retail"}
                              </span>
                            </TableCell>

                            {/* Total Transaction */}
                            <TableCell className="py-4 px-5 text-right font-black text-foreground">
                              {formatCurrency(sale.totalAmount)}
                            </TableCell>

                            {/* Paid Amount */}
                            <TableCell className="py-4 px-5 text-right font-black text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(sale.paidAmount)}
                            </TableCell>

                            {/* Sisa Piutang */}
                            <TableCell className="py-4 px-5 text-right font-black">
                              {outstanding > 0 ? (
                                <span className="text-rose-500">
                                  {formatCurrency(outstanding)}
                                </span>
                              ) : (
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  -
                                </span>
                              )}
                            </TableCell>

                            {/* Payment Method */}
                            <TableCell className="py-4 px-5 text-center">
                              <div className="flex flex-wrap gap-1 justify-center">
                                {sale.paymentMethod
                                  .split(", ")
                                  .map((method) => {
                                    let methodBadgeColor =
                                      "bg-muted text-muted-foreground border-border/50";
                                    const normalizedMethod =
                                      method.toLowerCase();
                                    if (normalizedMethod === "qris") {
                                      methodBadgeColor =
                                        "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/50";
                                    } else if (
                                      normalizedMethod === "cash" ||
                                      normalizedMethod === "tunai"
                                    ) {
                                      methodBadgeColor =
                                        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50";
                                    } else if (
                                      normalizedMethod === "transfer" ||
                                      normalizedMethod === "transfer bank"
                                    ) {
                                      methodBadgeColor =
                                        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50";
                                    }

                                    return (
                                      <span
                                        key={method}
                                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border leading-none ${methodBadgeColor}`}
                                      >
                                        {method}
                                      </span>
                                    );
                                  })}
                              </div>
                            </TableCell>

                            {/* Status Pembayaran */}
                            <TableCell className="py-4 px-5 text-center min-w-[160px]">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none ${
                                  sale.status === "PAID"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                                }`}
                              >
                                {sale.status === "PAID"
                                  ? "Lunas"
                                  : "Belum Lunas"}
                              </span>
                            </TableCell>

                            {/* Status Pesanan */}
                            <TableCell className="py-4 px-5 text-center min-w-[140px]">
                              {sale.orderStatus === "CANCELLED" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50">
                                  <LuCircleX className="h-3 w-3" />
                                  Dibatalkan
                                </span>
                              ) : sale.orderStatus === "REFUND" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/50">
                                  <LuRotateCcw className="h-3 w-3" />
                                  Refund
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
                                  <LuCircleCheck className="h-3 w-3" />
                                  Selesai
                                </span>
                              )}
                            </TableCell>

                            {/* Admin */}
                            <TableCell className="py-4 px-5">
                              <div className="font-semibold text-foreground">
                                {sale.operatorName}
                              </div>
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="py-4 px-5 text-center">
                              <div className="flex items-center justify-center">
                                <Dropdown>
                                  <DropdownTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-lg hover:bg-muted/70 active:scale-95 transition-all"
                                    >
                                      <LuEllipsisVertical className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </DropdownTrigger>
                                  <DropdownContent align="end" className="w-44">
                                    <DropdownItem
                                      onClick={() => {
                                        const rawOrder =
                                          (response?.data ?? []).find(
                                            (o) => o.id === sale.id,
                                          ) || null;
                                        setSelectedSale(rawOrder);
                                        setIsDetailOpen(true);
                                      }}
                                    >
                                      <LuReceipt className="h-3.5 w-3.5 text-primary" />
                                      <span>Detail Rincian</span>
                                    </DropdownItem>
                                    <DropdownItem
                                      onClick={() => {
                                        alert(
                                          `Mencetak ulang struk untuk nota ${sale.invoiceNumber}...`,
                                        );
                                      }}
                                    >
                                      <LuPrinter className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span>Cetak Ulang Struk</span>
                                    </DropdownItem>
                                  </DropdownContent>
                                </Dropdown>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              <TablePagination
                currentPage={page}
                totalPages={Math.ceil((response?.total ?? 0) / pageSize) || 1}
                pageSize={pageSize}
                totalEntries={response?.total ?? 0}
                onPageChange={(p) => setPage(p)}
                onPageSizeChange={(sz) => {
                  setPageSize(sz);
                  setPage(1);
                }}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <AnalyticReportSelling
          trendPeriod={trendPeriod}
          setTrendPeriod={setTrendPeriod}
          trendData={trendData}
          categoriesData={categoriesData}
          paymentsData={paymentsData}
          customerTypesData={customerTypesData}
          formatCurrency={formatCurrency}
          colors={COLORS}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      )}
      <DetailReportSelling
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        sale={selectedSale}
      />
    </div>
  );
};

export default ReportSellingPage;
