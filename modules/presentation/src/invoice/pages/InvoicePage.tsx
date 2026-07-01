import React from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Card, CardContent } from "@erp-digital-printing/ui/Card";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { TablePagination } from "@erp-digital-printing/ui/Table";
import { Checkbox } from "@erp-digital-printing/ui/Checkbox";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@erp-digital-printing/ui/Dropdown";
import { DateRangePicker } from "@erp-digital-printing/ui/DateRangePicker";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@erp-digital-printing/ui/Toast";
import {
  LuSearch,
  LuUser,
  LuShoppingBag,
  LuCreditCard,
  LuReceipt,
  LuCheck,
  LuPrinter,
  LuClock,
  LuInfo,
  LuCoins,
  LuDollarSign,
  LuEllipsisVertical,
  LuScissors,
  LuQrCode,
  LuFilter,
  LuRotateCcw,
  LuCircleCheck,
  LuCircleX,
  LuCalendar,
} from "@erp-digital-printing/ui/icons";
import { useInvoice } from "../hooks/useInvoice";

const InvoicePage = () => {
  const {
    // Search & Filters
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    statusFilter,
    setStatusFilter,
    customerTypeFilter,
    setCustomerTypeFilter,
    orderStatusFilter,
    setOrderStatusFilter,
    paymentMethodsFilter,
    setPaymentMethodsFilter,
    tempStatusFilter,
    setTempStatusFilter,
    tempCustomerTypeFilter,
    setTempCustomerTypeFilter,
    tempOrderStatusFilter,
    setTempOrderStatusFilter,
    tempPaymentMethodsFilter,
    setTempPaymentMethodsFilter,
    isFilterOpen,
    setIsFilterOpen,
    activeFiltersCount,

    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,

    // Selection / Dialog flags
    selectedInvoice,
    setSelectedInvoice,
    isDetailOpen,
    setIsDetailOpen,
    isRefundOpen,
    setIsRefundOpen,
    isPayOpen,
    setIsPayOpen,
    isSpkOpen,
    setIsSpkOpen,
    selectedSpkCategory,
    isSpkPreviewOpen,
    setIsSpkPreviewOpen,
    isReceiptOpen,
    setIsReceiptOpen,
    isPrinting,
    setIsPrinting,

    // Payment Form state
    payAmount,
    setPayAmount,
    payMethod,
    setPayMethod,
    isSplitPayment,
    setIsSplitPayment,
    splitAmounts,
    setSplitAmounts,

    // Refund Form state
    refundAmount,
    setRefundAmount,
    refundMethod,
    setRefundMethod,
    refundReason,
    setRefundReason,

    // Computed / Query responses
    invoices: filteredInvoices,
    isLoading,
    spkResponse,
    isLoadingSpk,
    activeSpkCategoryItems,
    isLoadingPayments,
    groupedPayments,
    isLoadingWidgets,
    stats,
    outstandingAmount,
    totalSplitInput,
    remainingOutstanding,
    response,

    // Actions / Handlers
    handleOpenPay,
    handleProcessPayment,
    handleProcessRefund,
    handlePrintInvoice,
    handlePrintSpk,
    processPaymentMutation,
    processRefundMutation,

    // Helpers
    formatCurrency,
  } = useInvoice();

  return (
    <div className="p-6 space-y-6 font-sans bg-background min-h-screen animate-in fade-in duration-500">
      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/30 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuReceipt className="text-primary animate-pulse" size={32} />
            Kelola Invoice
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Pantau pembayaran nota lunas/tempo, kelola pelunasan cicilan, dan
            cetak ulang nota kasir.
          </p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat Total Sales (Lunas + Piutang) */}
        <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
              <LuShoppingBag size={22} />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                Total Penjualan (Periode)
              </span>
              {isLoadingWidgets ? (
                <div className="h-7 w-32 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-lg mt-1" />
              ) : (
                <span className="text-xl font-black text-foreground">
                  {formatCurrency(stats.totalSales)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stat Receivables */}
        <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl">
              <LuCoins size={22} />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                Total Piutang (Periode)
              </span>
              {isLoadingWidgets ? (
                <div className="h-7 w-32 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-lg mt-1" />
              ) : (
                <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                  {formatCurrency(stats.totalReceivable)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stat Unpaid Total */}
        <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl">
              <LuClock size={22} />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                Invoice Belum Lunas
              </span>
              {isLoadingWidgets ? (
                <div className="h-7 w-32 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-lg mt-1" />
              ) : (
                <span className="text-xl font-black text-red-600">
                  {stats.unpaidCount} Transaksi
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border/40 p-4 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Quick Search */}
          <div className="w-full lg:w-96">
            <TextField
              placeholder="Cari No. Invoice, Job, atau Pelanggan..."
              prefixIcon={LuSearch}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full"
            />
          </div>

          {/* Date Range Picker & Filter Popover */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <DateRangePicker
              value={dateRange}
              onChange={(range) => {
                setDateRange(range);
                setPage(1);
              }}
              isClearable
              className="w-full sm:w-[260px] h-10 rounded-xl"
            />

            {/* Popover Filter Dropdown */}
            <div className="relative">
              <Button
                variant={activeFiltersCount > 0 ? "default" : "outline"}
                onClick={() => {
                  if (!isFilterOpen) {
                    // Sync temporary states with currently applied filter states on open
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
                      {/* Status Pembayaran */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                          Status Pembayaran
                        </label>
                        <select
                          value={tempStatusFilter}
                          onChange={(e) => {
                            setTempStatusFilter(
                              e.target.value as "ALL" | "PAID" | "UNPAID",
                            );
                          }}
                          className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="ALL">Semua Status</option>
                          <option value="PAID">Lunas</option>
                          <option value="UNPAID">Belum Lunas</option>
                        </select>
                      </div>

                      {/* Tipe Pelanggan */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                          Tipe Pelanggan
                        </label>
                        <select
                          value={tempCustomerTypeFilter}
                          onChange={(e) => {
                            setTempCustomerTypeFilter(
                              e.target.value as "ALL" | "RESELLER" | "END_USER",
                            );
                          }}
                          className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="ALL">Semua Tipe</option>
                          <option value="END_USER">End User</option>
                          <option value="RESELLER">Biro / Reseller</option>
                        </select>
                      </div>

                      {/* Status Pesanan */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                          Status Pesanan
                        </label>
                        <select
                          value={tempOrderStatusFilter}
                          onChange={(e) => {
                            setTempOrderStatusFilter(
                              e.target.value as "ALL" | "SUCCESS" | "REFUND",
                            );
                          }}
                          className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="ALL">Semua Pesanan</option>
                          <option value="SUCCESS">Selesai</option>
                          <option value="REFUND">Refund</option>
                        </select>
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
                            const isChecked = tempPaymentMethodsFilter.includes(
                              method.id,
                            );
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
                                        : prev.filter((p) => p !== method.id),
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
                            setTempStatusFilter("ALL");
                            setTempCustomerTypeFilter("ALL");
                            setTempOrderStatusFilter("SUCCESS");
                            setTempPaymentMethodsFilter([]);

                            setStatusFilter("ALL");
                            setCustomerTypeFilter("ALL");
                            setOrderStatusFilter("SUCCESS");
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
                            setStatusFilter(tempStatusFilter);
                            setCustomerTypeFilter(tempCustomerTypeFilter);
                            setOrderStatusFilter(tempOrderStatusFilter);
                            setPaymentMethodsFilter(tempPaymentMethodsFilter);
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
      </div>

      {/* Main Table / Grid */}
      <Card className="border border-border/40 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="py-4 px-5 min-w-[120px] text-center">Tanggal</th>
                <th className="py-4 px-5 min-w-[160px]">No. Nota</th>
                <th className="py-4 px-5 min-w-[180px]">Pelanggan</th>
                <th className="py-4 px-5 text-right">Total Tagihan</th>
                <th className="py-4 px-5 text-right">Telah Dibayar</th>
                <th className="py-4 px-5 text-right">Sisa Piutang</th>
                <th className="py-4 px-5 text-center">Metode</th>
                <th className="py-4 px-5 text-center min-w-[160px]">
                  Status Pembayaran
                </th>
                <th className="py-4 px-5 text-center min-w-[140px]">
                  Status Pesanan
                </th>
                <th className="py-4 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs font-semibold text-foreground">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center space-y-3">
                    <div className="relative w-8 h-8 mx-auto">
                      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground block">
                      Memuat Data Invoice...
                    </span>
                  </td>
                </tr>
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const outstanding = inv.totalAmount - inv.amountPaid;

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-muted/20 transition-colors duration-150"
                    >
                      {/* Date */}
                      <td className="py-4 px-5 text-center">
                        <div className="text-muted-foreground">
                          {inv.createdAt}
                        </div>
                      </td>

                      {/* Invoice & Job No */}
                      <td className="py-4 px-5 space-y-1">
                        <div className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded-lg border border-border/50 inline-block">
                          {inv.invoiceNo}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-semibold block">
                          No. Tiket : {inv.jobNumber}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-5 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <LuUser size={13} className="text-primary/70" />
                          {inv.customerName}
                        </div>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border leading-none ${
                            inv.isReseller
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50"
                              : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/50"
                          }`}
                        >
                          {inv.isReseller ? "Biro / Reseller" : "Retail"}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-5 text-right font-black text-foreground">
                        {formatCurrency(inv.totalAmount)}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-4 px-5 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(inv.amountPaid)}
                      </td>

                      {/* Sisa Piutang */}
                      <td className="py-4 px-5 text-right font-black">
                        {outstanding > 0 ? (
                          <span className="text-rose-500">
                            {formatCurrency(outstanding)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            -
                          </span>
                        )}
                      </td>

                      {/* Metode Pembayaran */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {inv.paymentMethods.length > 0 ? (
                            inv.paymentMethods.map((method) => {
                              let badgeColor =
                                "bg-muted text-muted-foreground border-border/50";
                              const normalized = method.toLowerCase();
                              if (normalized === "qris") {
                                badgeColor =
                                  "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/50";
                              } else if (
                                normalized === "cash" ||
                                normalized === "tunai"
                              ) {
                                badgeColor =
                                  "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50";
                              } else if (
                                normalized === "transfer" ||
                                normalized === "bank"
                              ) {
                                badgeColor =
                                  "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50";
                              }
                              return (
                                <span
                                  key={method}
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border leading-none ${badgeColor}`}
                                >
                                  {method}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-muted-foreground text-[10px]">
                              -
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-4 px-5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none ${
                            inv.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                          }`}
                        >
                          {inv.status === "PAID" ? "Lunas" : "Belum Lunas"}
                        </span>
                      </td>

                      {/* Order Status Badge */}
                      <td className="py-4 px-5 text-center">
                        {inv.orderStatus === "CANCELLED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50">
                            <LuCircleX className="h-3 w-3" />
                            Dibatalkan
                          </span>
                        ) : inv.orderStatus === "REFUND" ? (
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
                      </td>

                      {/* Dropdown Popover Actions */}
                      <td className="py-4 px-5 text-center">
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
                                  setSelectedInvoice(inv);
                                  setIsDetailOpen(true);
                                }}
                              >
                                <LuReceipt className="h-3.5 w-3.5 text-primary" />
                                <span>Detail Rincian</span>
                              </DropdownItem>
                              {inv.orderStatus !== "REFUND" && (
                                <>
                                  <DropdownItem
                                    onClick={() => handlePrintInvoice(inv)}
                                  >
                                    <LuPrinter className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>Cetak Ulang Struk</span>
                                  </DropdownItem>
                                  <DropdownItem
                                    onClick={() => {
                                      setSelectedInvoice(inv);
                                      setIsSpkOpen(true);
                                    }}
                                  >
                                    <LuScissors className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                    <span>Cetak SPK (Kerja)</span>
                                  </DropdownItem>
                                  {inv.status !== "PAID" && (
                                    <DropdownItem
                                      onClick={() => handleOpenPay(inv)}
                                    >
                                      <LuCoins className="h-3.5 w-3.5 text-emerald-600" />
                                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                        Bayar Pelunasan
                                      </span>
                                    </DropdownItem>
                                  )}
                                  {inv.amountPaid > 0 && (
                                    <DropdownItem
                                      onClick={() => {
                                        setSelectedInvoice(inv);
                                        setRefundAmount(inv.amountPaid);
                                        setRefundMethod("cash");
                                        setRefundReason("");
                                        setIsRefundOpen(true);
                                      }}
                                    >
                                      <LuRotateCcw className="h-3.5 w-3.5 text-rose-600" />
                                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                                        Ajukan Refund
                                      </span>
                                    </DropdownItem>
                                  )}
                                </>
                              )}
                            </DropdownContent>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 px-5 text-center space-y-3">
                    <LuInfo
                      size={36}
                      className="text-muted-foreground/60 mx-auto"
                    />
                    <h3 className="font-bold text-foreground text-sm">
                      Tidak Ada Data Invoice
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Tidak ada invoice yang cocok dengan kriteria filter
                      pencarian atau status saat ini.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Server Pagination UI */}
        <TablePagination
          currentPage={page}
          totalPages={Math.ceil((response?.total ?? 0) / pageSize)}
          pageSize={pageSize}
          totalEntries={response?.total ?? 0}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setPage(1);
          }}
        />
      </Card>

      <Dialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        size="xl"
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        {selectedInvoice && (
          <div className="space-y-5 flex flex-col overflow-hidden h-[75vh] max-h-[75vh]">
            {/* Dialog Header */}
            <div className="flex flex-col gap-1 border-b border-border/30 pb-4 shrink-0">
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <LuReceipt size={20} className="text-primary" />
                Detail Rincian Belanja
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Invoice:{" "}
                <span className="font-mono text-foreground font-bold">
                  {selectedInvoice.invoiceNo}
                </span>
              </p>
            </div>

            {/* Two-Column Layout */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0">
              {/* LEFT COLUMN: Dokumen, Produk & Desain (Scrollable) */}
              <div className="flex flex-col h-full overflow-y-auto pr-1 scrollbar-thin space-y-5">
                {/* Utama & Pelanggan Box */}
                <div className="bg-muted/30 p-4 rounded-2xl border border-border/40 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                        Pelanggan
                      </span>
                      <span className="font-bold text-foreground text-xs block">
                        {selectedInvoice.customerName}
                      </span>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border leading-none ${
                          selectedInvoice.isReseller
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50"
                            : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/50"
                        }`}
                      >
                        {selectedInvoice.isReseller
                          ? "Biro / Reseller"
                          : "Retail"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                        Staff Kasir
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                          <LuUser size={10} className="text-primary" />
                        </div>
                        <span className="font-bold text-foreground text-xs">
                          {groupedPayments[0]?.cashier_name || "Sistem"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Tiket Kerja (Desain) */}
                  <div className="border-t border-border/30 pt-3 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                        Nomor Tiket Pesanan
                      </span>
                      <span className="font-mono font-black text-foreground text-xs bg-muted px-2 py-0.5 rounded border border-border inline-block">
                        {selectedInvoice.jobNumber}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                        Tanggal Transaksi
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-bold mt-1">
                        <LuCalendar size={13} className="text-primary/70" />
                        {selectedInvoice.createdAt}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Item List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                    Daftar Item Cetak
                  </span>
                  <div className="border border-border/40 rounded-xl overflow-hidden divide-y divide-border/20">
                    {selectedInvoice.items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-card flex justify-between gap-4 text-xs font-semibold hover:bg-muted/10 transition-colors"
                      >
                        <div>
                          <span className="text-foreground block font-bold">
                            {idx + 1}. {item.productName}
                          </span>
                          {item.notes && item.notes !== "-" && (
                            <span className="text-[10px] text-muted-foreground block font-medium mt-1">
                              Spesifikasi: {item.notes}
                            </span>
                          )}
                          <span className="text-[10px] text-primary font-bold block mt-1">
                            {formatCurrency(item.pricePerUnit)} x {item.qty} Qty
                          </span>
                        </div>
                        <span className="font-black text-foreground shrink-0 self-center">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Finansial & Riwayat Pembayaran */}
              <div className="flex flex-col h-full overflow-hidden space-y-5 justify-between">
                {/* Timeline Pembayaran */}
                <div className="flex flex-col flex-1 min-h-0 space-y-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block shrink-0">
                    Riwayat Transaksi Masuk
                  </span>
                  <div className="flex-1 bg-muted/15 border border-border/40 rounded-2xl p-4 overflow-y-auto scrollbar-thin">
                    {isLoadingPayments ? (
                      <div className="flex flex-col items-center justify-center h-full space-y-2">
                        <div className="relative w-8 h-8">
                          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">
                          Memuat riwayat pembayaran...
                        </span>
                      </div>
                    ) : groupedPayments.length > 0 ? (
                      <div className="relative border-l border-border pl-4 space-y-4">
                        {(() => {
                          const standardPayments = groupedPayments.filter(
                            (p) => p.payment_type !== "REFUND"
                          );
                          return groupedPayments.map((pay) => {
                            const isRefund = pay.payment_type === "REFUND";
                            return (
                              <div
                                key={pay.id}
                                className="relative flex flex-col gap-1.5"
                              >
                                {/* Circle Indicator */}
                                <div
                                  className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ${
                                    isRefund
                                      ? "bg-rose-500 ring-rose-100 dark:ring-rose-950/40"
                                      : "bg-emerald-500 ring-emerald-100 dark:ring-emerald-950/40"
                                  }`}
                                />
                                <div className="flex justify-between items-start gap-4 text-xs font-semibold">
                                  <div>
                                    <span className="text-foreground font-black block">
                                      {isRefund ? (
                                        <span className="text-rose-600 dark:text-rose-400">
                                          Refund / Pengembalian Dana
                                        </span>
                                      ) : pay.payment_type === "DOWN_PAYMENT" ? (
                                        "Pembayaran Awal (DP)"
                                      ) : pay.payment_type === "FULL_PAYMENT" ? (
                                        "Lunas / Pembayaran Langsung"
                                      ) : (
                                        `Pelunasan #${
                                          standardPayments.indexOf(pay) + 1
                                        }`
                                      )}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
                                      {pay.created_at} • Kasir: {pay.cashier_name}
                                    </span>
                                  </div>
                                  <span
                                    className={`font-black shrink-0 ${
                                      isRefund
                                        ? "text-rose-600 dark:text-rose-400"
                                        : "text-emerald-600 dark:text-emerald-400"
                                    }`}
                                  >
                                    {isRefund ? "-" : "+"} {formatCurrency(pay.totalAmount)}
                                  </span>
                                </div>
                                {/* Detail Rincian Metode Pembayaran */}
                                <div className="ml-0 mt-1 pl-3 border-l-2 border-border/40 space-y-1.5">
                                  {pay.details.map((detail) => (
                                    <div
                                      key={detail.id}
                                      className="flex justify-between items-center text-[10px] font-semibold"
                                    >
                                      <span className="text-muted-foreground uppercase tracking-wider">
                                        {detail.payment_method}
                                      </span>
                                      <span className="text-foreground">
                                        {formatCurrency(detail.amount)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          });
                        })()}

                        {/* Sisa Piutang Info in Timeline */}
                        {selectedInvoice.totalAmount -
                          selectedInvoice.amountPaid >
                          0 && (
                          <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950/40 animate-pulse" />
                            <div className="flex justify-between items-start gap-4 text-xs font-semibold">
                              <div>
                                <span className="text-amber-600 dark:text-amber-400 font-black block">
                                  Sisa Tagihan (Piutang)
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
                                  Menunggu pelunasan
                                </span>
                              </div>
                              <span className="font-black text-rose-500 shrink-0">
                                {formatCurrency(
                                  selectedInvoice.totalAmount -
                                    selectedInvoice.amountPaid,
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 space-y-1.5">
                        <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto text-rose-500">
                          <LuClock size={16} />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground block">
                          Belum ada riwayat pembayaran
                        </span>
                        <span className="text-[9px] text-muted-foreground block font-medium max-w-[200px] mx-auto">
                          Transaksi ini berstatus piutang belum dibayar (UNPAID)
                          atau baru di-input.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary Box (Fixed at the Bottom) */}
                <div className="border-t border-border/30 pt-4 space-y-2.5 text-xs font-semibold shrink-0">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Total Belanja</span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(selectedInvoice.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                    <span>Terbayar</span>
                    <span className="font-black">
                      {formatCurrency(selectedInvoice.amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-dashed border-border/30 pt-2 font-black">
                    <span className="text-primary uppercase tracking-wider text-[10px]">
                      Sisa Tagihan
                    </span>
                    <span className="text-sm text-rose-500">
                      {selectedInvoice.totalAmount -
                        selectedInvoice.amountPaid >
                      0
                        ? formatCurrency(
                            selectedInvoice.totalAmount -
                              selectedInvoice.amountPaid,
                          )
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons / Actions */}
            <div className="flex justify-end gap-2.5 border-t border-border/20 pt-4 shrink-0">
              <Button
                variant="outline"
                className="rounded-xl text-xs font-bold px-4 border-border/50 h-10 hover:bg-muted"
                onClick={() => setIsDetailOpen(false)}
              >
                Tutup
              </Button>
              <Button
                className="rounded-xl text-xs font-black px-4 bg-primary text-primary-foreground flex items-center gap-1.5 h-10 shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                onClick={() => {
                  setIsDetailOpen(false);
                  handlePrintInvoice(selectedInvoice);
                }}
              >
                <LuPrinter size={13} />
                Cetak Struk
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* DIALOG 2: Quick Collect Payment Dialog */}
      <Dialog
        isOpen={isPayOpen}
        onClose={() => setIsPayOpen(false)}
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        {selectedInvoice && (
          <div className="space-y-5 flex flex-col overflow-hidden">
            {/* Dialog Header */}
            <div className="flex flex-col gap-1 border-b border-border/30 pb-4">
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <LuCoins size={20} className="text-primary" />
                Input Pelunasan Tagihan / Piutang
              </h2>
            </div>

            {/* Short info */}
            <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/15 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-muted-foreground">
                  Nomor Nota
                </span>
                <span className="font-mono font-black text-xs text-foreground">
                  {selectedInvoice.invoiceNo}
                </span>
              </div>
              <div className="flex justify-between items-center font-bold text-xs">
                <span className="text-muted-foreground">Pelanggan:</span>
                <span className="text-foreground">
                  {selectedInvoice.customerName}
                </span>
              </div>
              <div className="flex justify-between items-center font-black text-xs pt-1.5 border-t border-primary/10">
                <span className="text-rose-600 dark:text-rose-400">
                  Sisa Tagihan (Piutang):
                </span>
                <span className="text-rose-600 dark:text-rose-400">
                  {formatCurrency(
                    selectedInvoice.totalAmount - selectedInvoice.amountPaid,
                  )}
                </span>
              </div>
            </div>

            {/* Toggle Split Payment */}
            <div className="flex items-center justify-between bg-muted/20 border border-border/50 p-3.5 rounded-2xl shadow-sm animate-in fade-in duration-200">
              <div className="flex flex-col">
                <span className="text-xs font-black text-foreground">
                  Split Pembayaran
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  Bayar menggunakan beberapa metode sekaligus
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSplitPayment(!isSplitPayment);
                  setPayAmount(
                    selectedInvoice.totalAmount - selectedInvoice.amountPaid,
                  );
                  setSplitAmounts({ cash: 0, transfer: 0, qris: 0 });
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isSplitPayment ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isSplitPayment ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {!isSplitPayment ? (
              <>
                {/* Input field */}
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                    Jumlah Pembayaran (Pelunasan)
                  </span>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="1"
                      max={
                        selectedInvoice.totalAmount - selectedInvoice.amountPaid
                      }
                      value={payAmount || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        const outstanding =
                          selectedInvoice.totalAmount -
                          selectedInvoice.amountPaid;
                        setPayAmount(Math.min(val, outstanding));
                      }}
                      placeholder="Masukkan nominal bayar..."
                      className="w-full h-11 pl-9 pr-3 text-sm font-mono font-bold bg-muted/30 border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    />
                  </div>
                  <div className="flex justify-end gap-1 px-1">
                    <button
                      type="button"
                      onClick={() =>
                        setPayAmount(
                          selectedInvoice.totalAmount -
                            selectedInvoice.amountPaid,
                        )
                      }
                      className="text-[10px] font-black text-primary hover:underline"
                    >
                      Bayar Lunas Semua
                    </button>
                  </div>
                </div>

                {/* Payment Method chips */}
                <div className="space-y-2 animate-in fade-in duration-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                    Metode Pembayaran
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {["CASH", "TRANSFER", "QRIS"].map((method) => {
                      const isSelected = payMethod === method;
                      return (
                        <Button
                          key={method}
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => setPayMethod(method)}
                          className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "hover:bg-muted text-muted-foreground border-border/60"
                          }`}
                        >
                          {method === "CASH" ? (
                            <LuDollarSign size={13} />
                          ) : method === "TRANSFER" ? (
                            <LuCreditCard size={13} />
                          ) : (
                            <LuQrCode size={13} />
                          )}
                          {method}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Split Payment Mode inputs */}
                <div className="space-y-3.5 max-h-[35vh] overflow-y-auto pr-1 scrollbar-thin animate-in fade-in duration-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                    Nominal Pembayaran Terbagi
                  </span>

                  {/* Cash Input */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <LuDollarSign size={13} className="text-primary/70" />
                        Tunai (Cash)
                      </span>
                      {outstandingAmount -
                        (splitAmounts.transfer + splitAmounts.qris) >
                        0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const sisa = Math.max(
                              0,
                              outstandingAmount -
                                (splitAmounts.transfer + splitAmounts.qris),
                            );
                            setSplitAmounts((prev) => ({
                              ...prev,
                              cash: sisa,
                            }));
                          }}
                          className="text-[9px] font-black text-primary hover:underline"
                        >
                          Gunakan Sisa (
                          {formatCurrency(
                            Math.max(
                              0,
                              outstandingAmount -
                                (splitAmounts.transfer + splitAmounts.qris),
                            ),
                          )}
                          )
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                        Rp
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={splitAmounts.cash || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSplitAmounts((prev) => ({ ...prev, cash: val }));
                        }}
                        placeholder="0"
                        className="w-full h-11 pl-9 pr-3 text-sm font-mono font-bold bg-muted/30 border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                      />
                    </div>
                  </div>

                  {/* Transfer Input */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <LuCreditCard size={13} className="text-primary/70" />
                        Transfer Bank
                      </span>
                      {outstandingAmount -
                        (splitAmounts.cash + splitAmounts.qris) >
                        0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const sisa = Math.max(
                              0,
                              outstandingAmount -
                                (splitAmounts.cash + splitAmounts.qris),
                            );
                            setSplitAmounts((prev) => ({
                              ...prev,
                              transfer: sisa,
                            }));
                          }}
                          className="text-[9px] font-black text-primary hover:underline"
                        >
                          Gunakan Sisa (
                          {formatCurrency(
                            Math.max(
                              0,
                              outstandingAmount -
                                (splitAmounts.cash + splitAmounts.qris),
                            ),
                          )}
                          )
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                        Rp
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={splitAmounts.transfer || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSplitAmounts((prev) => ({
                            ...prev,
                            transfer: val,
                          }));
                        }}
                        placeholder="0"
                        className="w-full h-11 pl-9 pr-3 text-sm font-mono font-bold bg-muted/30 border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                      />
                    </div>
                  </div>

                  {/* QRIS Input */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <LuQrCode size={13} className="text-primary/70" />
                        QRIS
                      </span>
                      {outstandingAmount -
                        (splitAmounts.cash + splitAmounts.transfer) >
                        0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const sisa = Math.max(
                              0,
                              outstandingAmount -
                                (splitAmounts.cash + splitAmounts.transfer),
                            );
                            setSplitAmounts((prev) => ({
                              ...prev,
                              qris: sisa,
                            }));
                          }}
                          className="text-[9px] font-black text-primary hover:underline"
                        >
                          Gunakan Sisa (
                          {formatCurrency(
                            Math.max(
                              0,
                              outstandingAmount -
                                (splitAmounts.cash + splitAmounts.transfer),
                            ),
                          )}
                          )
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                        Rp
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={splitAmounts.qris || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSplitAmounts((prev) => ({ ...prev, qris: val }));
                        }}
                        placeholder="0"
                        className="w-full h-11 pl-9 pr-3 text-sm font-mono font-bold bg-muted/30 border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                      />
                    </div>
                  </div>

                  {/* Split Summary */}
                  <div className="bg-primary/[0.02] border border-border/40 p-3.5 rounded-2xl text-[11px] font-semibold space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Sisa Piutang:
                      </span>
                      <span className="text-foreground font-bold">
                        {formatCurrency(outstandingAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Diinput:
                      </span>
                      <span className="text-foreground font-bold">
                        {formatCurrency(totalSplitInput)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Sisa Belum Terbayar:
                      </span>
                      <span
                        className={`font-black ${
                          remainingOutstanding > 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {remainingOutstanding > 0
                          ? formatCurrency(remainingOutstanding)
                          : "PAS / LUNAS"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Actions button */}
            <div className="flex justify-end gap-2.5 border-t border-border/20 pt-4">
              <Button
                variant="outline"
                className="rounded-xl text-xs font-bold px-4 border-border/50"
                onClick={() => setIsPayOpen(false)}
                disabled={processPaymentMutation.isPending}
              >
                Batal
              </Button>
              <Button
                className="rounded-xl text-xs font-black px-5 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md disabled:opacity-50"
                onClick={handleProcessPayment}
                disabled={
                  processPaymentMutation.isPending ||
                  (isSplitPayment
                    ? totalSplitInput <= 0 ||
                      totalSplitInput > outstandingAmount
                    : payAmount <= 0 || payAmount > outstandingAmount)
                }
              >
                {processPaymentMutation.isPending ? (
                  <>
                    <div className="h-3 w-3 rounded-full border border-white border-t-transparent animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LuCheck size={14} />
                    Bayar Pelunasan
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* DIALOG 3: Category-Grouped SPK (Surat Perintah Kerja) Release Dialog */}
      <Dialog
        isOpen={isSpkOpen}
        onClose={() => setIsSpkOpen(false)}
        size="lg"
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        {selectedInvoice && (
          <div className="space-y-5 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-col gap-1 border-b border-border/30 pb-4 pr-10">
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <LuScissors className="text-primary animate-pulse" size={22} />
                Rilis Surat Perintah Kerja (SPK)
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Sistem mengelompokkan item cetakan secara otomatis berdasarkan
                divisi mesin untuk didistribusikan ke workshop.
              </p>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-3.5 rounded-2xl border border-border/20 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">
                  No. Nota
                </span>
                <span className="font-mono font-black text-foreground">
                  {selectedInvoice.invoiceNo}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">
                  Pelanggan
                </span>
                <span className="font-black text-foreground">
                  {selectedInvoice.customerName}
                </span>
              </div>
            </div>

            {/* Category Groups Container */}
            <div className="overflow-y-auto space-y-3 pr-1.5 flex-1 max-h-[45vh] scrollbar-thin">
              {isLoadingSpk ? (
                <div className="py-12 text-center space-y-3">
                  <div className="relative w-8 h-8 mx-auto">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground block">
                    Mengambil data divisi SPK...
                  </span>
                </div>
              ) : spkResponse && spkResponse.spk_by_category.length > 0 ? (
                spkResponse.spk_by_category.map((category) => (
                  <div
                    key={category.category_id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-card hover:bg-muted/30 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <LuScissors size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-foreground block">
                          {category.category_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold block mt-0.5">
                          {category.items.length || 0} item cetakan terdeteksi
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handlePrintSpk(category.category_name)}
                      className="h-9 px-4 rounded-xl text-xs font-black bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-0 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <LuPrinter size={13} />
                      Cetak SPK
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                  <LuInfo size={28} className="text-muted-foreground/60" />
                  <span className="text-xs font-bold text-muted-foreground">
                    Tidak ada item cetakan terdeteksi.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* DIALOG 4: SPK Print Preview Dialog */}
      <Dialog
        isOpen={isSpkPreviewOpen}
        onClose={() => setIsSpkPreviewOpen(false)}
        size="md"
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        {selectedInvoice && selectedSpkCategory && (
          <div className="space-y-5 flex flex-col overflow-hidden">
            {/* Header info */}
            <div className="flex flex-col gap-1 border-b border-border/30 pb-4 pr-10">
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <LuPrinter size={20} className="text-primary animate-pulse" />
                Preview SPK Kerja ({selectedSpkCategory})
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Simulasi hasil cetakan Surat Perintah Kerja (SPK) divisi
                workshop produksi.
              </p>
            </div>

            {/* Simulated Printed Paper Container */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 overflow-y-auto max-h-[50vh] shadow-inner">
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
                <span className="font-black text-sm block tracking-widest">
                  SURAT PERINTAH KERJA (SPK)
                </span>
                <span className="font-bold text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full inline-block mt-1">
                  DIVISI: {selectedSpkCategory.toUpperCase()}
                </span>
              </div>

              {/* Meta information */}
              <div className="py-3 space-y-1 border-b border-dashed border-slate-300 dark:border-slate-700">
                <div className="flex justify-between">
                  <span>No. Nota:</span>
                  <span className="font-bold">{selectedInvoice.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>No. Tiket / Job:</span>
                  <span>{selectedInvoice.jobNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="font-bold uppercase">
                    {selectedInvoice.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{selectedInvoice.createdAt}</span>
                </div>
              </div>

              {/* Items in this category */}
              <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                <span className="font-bold block text-[10px] text-muted-foreground uppercase tracking-wider">
                  Daftar Item Produksi:
                </span>
                {activeSpkCategoryItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="space-y-1 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900"
                  >
                    <div className="flex justify-between font-bold text-foreground">
                      <span>
                        {idx + 1}.{" "}
                        {item.variant_name
                          ? `${item.product_name} (${item.variant_name})`
                          : item.product_name}
                      </span>
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px]">
                        {item.quantity} Qty
                      </span>
                    </div>
                    {(item.uom === "m2" || item.uom === "m_lari") &&
                      item.length_cm &&
                      item.width_cm && (
                        <div className="text-[10px] text-primary font-black mt-0.5">
                          Ukuran: {item.length_cm} x {item.width_cm} cm (
                          {item.uom})
                        </div>
                      )}
                    {item.production_notes &&
                      item.production_notes !== "-" &&
                      item.production_notes !== "" && (
                        <div className="text-[10px] text-rose-500 font-bold border-l-2 border-rose-500 pl-2 mt-1">
                          Catatan: {item.production_notes}
                        </div>
                      )}
                  </div>
                ))}
              </div>

              <div className="text-center pt-5 text-[10px] text-muted-foreground space-y-0.5 font-bold">
                <span className="block">
                  --- HARAP DIKERJAKAN SESUAI SPESIFIKASI ---
                </span>
                <span className="block text-[9px] font-medium">
                  Sistem ERP Digital Printing
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4 mt-2">
              <Button
                variant="outline"
                onClick={() => setIsSpkPreviewOpen(false)}
                className="h-10 px-5 rounded-xl font-bold border-border/60 hover:bg-muted/50"
              >
                Tutup
              </Button>
              <Button
                onClick={() => {
                  toast.success(
                    "Mencetak SPK...",
                    `SPK Divisi ${selectedSpkCategory} berhasil dikirim ke printer workshop produksi.`,
                  );
                  setIsSpkPreviewOpen(false);
                }}
                className="h-10 px-6 rounded-xl font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 flex items-center gap-2 transition-all active:scale-95"
              >
                <LuPrinter size={16} />
                Cetak SPK
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* DIALOG 5: Simulated Thermal Receipt Dialog */}
      <Dialog
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        size="md"
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        {selectedInvoice && (
          <div className="space-y-5 flex flex-col overflow-hidden">
            {/* Header info */}
            <div className="flex flex-col gap-1 border-b border-border/30 pb-4 pr-10">
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <LuPrinter size={20} className="text-primary" />
                Preview Struk Kasir
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Simulasi hasil cetakan thermal struk digital printing 80mm.
              </p>
            </div>

            {/* Simulated Receipt Paper container */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 overflow-y-auto max-h-[50vh] shadow-inner">
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
                <span className="font-bold text-sm block">
                  DIGITAL PRINTING ERP
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  Jl. Percetakan Keren No. 88, Jakarta
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  Telp: 021-555-9081
                </span>
              </div>

              {/* Receipt metadata */}
              <div className="py-3 space-y-1 border-b border-dashed border-slate-300 dark:border-slate-700">
                <div className="flex justify-between">
                  <span>No. Nota:</span>
                  <span className="font-bold">{selectedInvoice.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>No. Tiket / Job:</span>
                  <span className="font-bold">{selectedInvoice.jobNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{selectedInvoice.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold uppercase">
                    {selectedInvoice.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>Sistem Kasir Utama</span>
                </div>
              </div>

              {/* Items listing */}
              <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-2.5">
                {selectedInvoice.items.map((item) => (
                  <div key={item.id} className="space-y-0.5">
                    <span className="font-bold block text-foreground">
                      {item.productName}
                    </span>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>
                        {item.uom === "m2" && item.lengthCm && item.widthCm ? (
                          `${item.lengthCm / 100}x${item.widthCm / 100} x ${item.qty} x ${formatCurrency(item.pricePerUnit)}`
                        ) : item.uom === "m_lari" && item.lengthCm ? (
                          `${item.lengthCm / 100} x ${item.qty} x ${formatCurrency(item.pricePerUnit)}`
                        ) : (
                          `${item.qty} x ${formatCurrency(item.pricePerUnit)}`
                        )}
                        {item.notes && item.notes !== "-" && ` [Notes: ${item.notes}]`}
                      </span>
                      <span className="font-bold text-foreground">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grand summary */}
              <div className="py-3 space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    {formatCurrency(
                      selectedInvoice.items.reduce((s, i) => s + i.subtotal, 0),
                    )}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-xs border-t border-dotted border-slate-300 dark:border-slate-700 pt-2 text-foreground">
                  <span>TOTAL BELANJA:</span>
                  <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Jumlah Bayar:</span>
                  <span>{formatCurrency(selectedInvoice.amountPaid)}</span>
                </div>

                {selectedInvoice.totalAmount - selectedInvoice.amountPaid >
                  0 && (
                  <div className="flex justify-between font-bold text-rose-600 dark:text-rose-400">
                    <span>SISA TAGIHAN (UTANG):</span>
                    <span>
                      {formatCurrency(
                        selectedInvoice.totalAmount -
                          selectedInvoice.amountPaid,
                      )}
                    </span>
                  </div>
                )}

                {selectedInvoice.totalAmount - selectedInvoice.amountPaid ===
                  0 && (
                  <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Status:</span>
                    <span>LUNAS</span>
                  </div>
                )}
              </div>

              <div className="text-center pt-5 border-t border-dashed border-slate-300 dark:border-slate-700 text-[10px] text-muted-foreground space-y-0.5">
                <span className="block font-bold">--- TERIMA KASIH ---</span>
                <span className="block">
                  Barang yang sudah dibeli tidak dapat ditukar
                </span>
                <span className="block">atau dikembalikan. Sukses Selalu!</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4 mt-2">
              <Button
                variant="outline"
                onClick={() => setIsReceiptOpen(false)}
                className="h-10 px-5 rounded-xl font-bold border-border/60 hover:bg-muted/50"
              >
                Tutup Preview
              </Button>
              <Button
                onClick={async () => {
                  if (!selectedInvoice) return;
                  setIsPrinting(true);

                  const printFormatCurrency = (val: number): string => {
                    const formattedNumber = new Intl.NumberFormat("id-ID", {
                      maximumFractionDigits: 0,
                    }).format(val);
                    return `Rp ${formattedNumber}`;
                  };

                  const formatLine = (
                    left: string,
                    right: string,
                    charWidth = 48,
                  ): string => {
                    const spacesNeeded = charWidth - left.length - right.length;
                    if (spacesNeeded > 0) {
                      return left + " ".repeat(spacesNeeded) + right + "\n";
                    }
                    return (
                      left +
                      "\n" +
                      " ".repeat(charWidth - right.length) +
                      right +
                      "\n"
                    );
                  };

                  // ESC/POS Command: Center Align
                  let rawData = "\x1b\x61\x01";
                  
                  // ESC/POS Command: Print NV Bit Image #1 (normal mode)
                  rawData += "\x1c\x70\x01\x00\n";
                  
                  rawData += "            MADE DIGITAL PRINTING           \n";
                  rawData += " INDOOR - OUTDOOR - A3+ - DTF - SPANDUK KAIN \n";
                  rawData += "   Jl. Kali Sindang, Jagalan, Jebres - Solo  \n";
                  rawData += "     Buka : 08.00 (Pagi) - 01.00 (Malam)     \n";
                  rawData += "               WA. 082134305050              \n";
                  
                  // ESC/POS Command: Left Align
                  rawData += "\x1b\x61\x00";
                  rawData += "------------------------------------------------\n";
                  
                  rawData += formatLine("Tanggal", selectedInvoice.createdAt);
                  rawData += formatLine("No. Transaksi", selectedInvoice.invoiceNo);
                  rawData += formatLine("Pelanggan", selectedInvoice.customerName.toUpperCase());
                  rawData += formatLine("Kasir", "Kasir Utama");
                  
                  rawData += "------------------------------------------------\n";

                  selectedInvoice.items.forEach((item) => {
                    rawData += `${item.productName}\n`;
                    if (item.notes && item.notes !== "-") {
                      rawData += `* ${item.notes}\n`;
                    }
                    const leftDetail = (item.uom === "m2" && item.lengthCm && item.widthCm)
                      ? `${item.lengthCm / 100}x${item.widthCm / 100} x ${item.qty} x ${printFormatCurrency(item.pricePerUnit)}`
                      : (item.uom === "m_lari" && item.lengthCm)
                      ? `${item.lengthCm / 100} x ${item.qty} x ${printFormatCurrency(item.pricePerUnit)}`
                      : `${item.qty} x ${printFormatCurrency(item.pricePerUnit)}`;
                    const rightDetail = printFormatCurrency(item.subtotal);
                    rawData += formatLine(leftDetail, rightDetail);
                    rawData += "\n";
                  });

                  rawData += "------------------------------------------------\n";
                  
                  const totalItemsText = `${selectedInvoice.items.length} item`;
                  rawData += formatLine("Total Item", totalItemsText);
                  rawData += formatLine("Subtotal", printFormatCurrency(selectedInvoice.totalAmount));
                  
                  rawData += "================================================\n";
                  rawData += formatLine("TOTAL", printFormatCurrency(selectedInvoice.totalAmount));
                  rawData += "------------------------------------------------\n";
                  
                  const remaining = selectedInvoice.totalAmount - selectedInvoice.amountPaid;
                  const paymentMethod = remaining <= 0 ? "Lunas" : "Piutang";
                  rawData += formatLine("Metode Bayar", paymentMethod);
                  rawData += formatLine("Bayar", printFormatCurrency(selectedInvoice.amountPaid));
                  
                  rawData += "------------------------------------------------\n";
                  
                  // ESC/POS Command: Center Align
                  rawData += "\x1b\x61\x01";
                  rawData += "Terima kasih atas kunjungan Anda\n\n\n\n\n\n\n";

                  // ESC/POS Command: Auto Cut
                  rawData += "\x1d\x56\x00";

                  try {
                    const response = await fetch(
                      "http://localhost:9876/print",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          printer_name: "PRINTER-POS",
                          raw_data: rawData,
                        }),
                      },
                    );

                    if (!response.ok) {
                      throw new Error(
                        "Gagal memproses struk melalui Print Agent lokal.",
                      );
                    }

                    toast.success(
                      "Mencetak Struk...",
                      "Dokumen struk dikirim ke mesin thermal printer lokal.",
                    );
                    setIsReceiptOpen(false);
                  } catch (error) {
                    console.error("Error printing:", error);
                    toast.error(
                      "Gagal Cetak",
                      "Pastikan Print Agent lokal (localhost:9876) sudah berjalan.",
                    );
                  } finally {
                    setIsPrinting(false);
                  }
                }}
                disabled={isPrinting}
                className="h-10 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPrinting ? (
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 rounded-full border-2 border-primary-foreground/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  </div>
                ) : (
                  <LuPrinter size={16} />
                )}
                {isPrinting ? "Mencetak..." : "Cetak ke Thermal Printer"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        isOpen={isRefundOpen}
        onClose={() => setIsRefundOpen(false)}
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground max-w-md w-full"
        showCloseButton={true}
      >
        {selectedInvoice && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-1 border-b border-border/30 pb-4">
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <LuRotateCcw className="text-rose-500" size={20} />
                Ajukan Refund Invoice
              </h2>
            </div>

            {/* Info Box */}
            <div className="bg-rose-500/5 dark:bg-rose-500/10 p-4 rounded-2xl border border-rose-500/10 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-muted-foreground">
                  Nomor Nota
                </span>
                <span className="font-mono font-black text-xs text-foreground">
                  {selectedInvoice.invoiceNo}
                </span>
              </div>
              <div className="flex justify-between items-center font-bold text-xs">
                <span className="text-muted-foreground">Pelanggan:</span>
                <span className="text-foreground">
                  {selectedInvoice.customerName}
                </span>
              </div>
              <div className="flex justify-between items-center font-black text-xs pt-1.5 border-t border-rose-500/10">
                <span className="text-rose-600 dark:text-rose-400">
                  Total Terbayar:
                </span>
                <span className="text-rose-600 dark:text-rose-400">
                  {formatCurrency(selectedInvoice.amountPaid)}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Metode Refund */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                  Metode Refund
                </label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="w-full h-11 px-3 rounded-2xl border border-border/80 bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                >
                  <option value="cash">Tunai / Cash</option>
                  <option value="transfer">Transfer Bank</option>
                  <option value="qris">QRIS</option>
                </select>
              </div>

              {/* Jumlah Refund */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                  Jumlah Refund
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={selectedInvoice.amountPaid}
                    value={refundAmount || ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setRefundAmount(
                        Math.min(val, selectedInvoice.amountPaid),
                      );
                    }}
                    placeholder="Masukkan nominal refund..."
                    className="w-full h-11 pl-9 pr-3 text-sm font-mono font-bold bg-muted/30 border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  />
                </div>
                <div className="flex justify-end gap-1 px-1">
                  <button
                    type="button"
                    onClick={() => setRefundAmount(selectedInvoice.amountPaid)}
                    className="text-[10px] font-black text-rose-600 hover:underline"
                  >
                    Refund Semua ({formatCurrency(selectedInvoice.amountPaid)})
                  </button>
                </div>
              </div>

              {/* Alasan Refund */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                  Alasan Refund
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Tulis alasan refund..."
                  rows={3}
                  className="w-full p-3 text-sm bg-muted/30 border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
              <Button
                variant="outline"
                onClick={() => setIsRefundOpen(false)}
                className="rounded-xl font-bold"
                disabled={processRefundMutation.isPending}
              >
                Batal
              </Button>
              <Button
                onClick={handleProcessRefund}
                className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white"
                disabled={processRefundMutation.isPending}
              >
                {processRefundMutation.isPending
                  ? "Memproses..."
                  : "Ya, Proses Refund"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default InvoicePage;
