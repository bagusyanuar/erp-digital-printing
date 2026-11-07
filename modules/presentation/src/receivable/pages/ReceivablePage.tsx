import React, { useState, useMemo } from "react";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Card, CardHeader, CardContent } from "@erp-digital-printing/ui/Card";
import {
  DateRangePicker,
  type DateRange,
} from "@erp-digital-printing/ui/DateRangePicker";
import {
  LuSearch,
  LuClock,
  LuHistory,
  LuFileSpreadsheet,
} from "@erp-digital-printing/ui/icons";
import { Button } from "@erp-digital-printing/ui/Button";
import { useDebounce } from "../../shared/hooks/useDebounce";
import {
  useCustomerReceivablesList,
  useSettledReceivablesList,
  useCustomerReceivableSummary,
  usePayCustomerInvoice,
} from "../hooks/useReceivables";
import { ReceivableSummaryWidgets } from "../components/ReceivableSummaryWidgets";
import { CustomerReceivableTable } from "../components/CustomerReceivableTable";
import { SettledReceivableTable } from "../components/SettledReceivableTable";
import { CustomerInvoicesDetailDialog } from "../components/CustomerInvoicesDetailDialog";
import { ReceivablePaymentDialog } from "../components/ReceivablePaymentDialog";
import { SettledInvoiceDetailDialog } from "../components/SettledInvoiceDetailDialog";
import type {
  ReceivableTabType,
  CustomerReceivableStatusFilter,
  PayCustomerInvoiceInput,
} from "@core/receivable/applications/inputs/receivable.input";
import type {
  CustomerReceivableModel,
  ReceivableInvoiceItemModel,
  SettledInvoiceReceivableModel,
} from "@core/receivable/domains/models/receivable.model";

const toLocalDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ReceivablePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReceivableTabType>("ACTIVE");
  const [activePage, setActivePage] = useState<number>(1);
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Active Tab Search & Filters
  const [activeSearch, setActiveSearch] = useState<string>("");
  const debouncedActiveSearch = useDebounce(activeSearch, 600);
  const [statusFilter, setStatusFilter] = useState<CustomerReceivableStatusFilter>("ALL");
  const [activeDateRange, setActiveDateRange] = useState<DateRange | undefined>(undefined);

  // History Tab Search & Filters (Default: Hari Ini)
  const [historySearch, setHistorySearch] = useState<string>("");
  const debouncedHistorySearch = useDebounce(historySearch, 600);
  const [historyDateRange, setHistoryDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: today, to: today };
  });

  // Active Tab Dialog states
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerReceivableModel | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const [payingCustomer, setPayingCustomer] = useState<CustomerReceivableModel | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<ReceivableInvoiceItemModel | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);

  // History Tab Dialog states
  const [selectedSettledInvoice, setSelectedSettledInvoice] = useState<SettledInvoiceReceivableModel | null>(null);
  const [isSettledDetailOpen, setIsSettledDetailOpen] = useState<boolean>(false);

  // Active Tab Query Params (Order Date filter)
  const activeQueryParams = useMemo(
    () => ({
      tab: "ACTIVE" as const,
      page: activePage,
      limit: pageSize,
      search: debouncedActiveSearch.trim() || undefined,
      status: statusFilter,
      startDate: activeDateRange?.from ? toLocalDateString(activeDateRange.from) : undefined,
      endDate: activeDateRange?.to ? toLocalDateString(activeDateRange.to) : undefined,
    }),
    [activePage, pageSize, debouncedActiveSearch, statusFilter, activeDateRange],
  );

  // History Tab Query Params (Settled Date filter, default Hari Ini)
  const historyQueryParams = useMemo(
    () => ({
      page: historyPage,
      limit: pageSize,
      search: debouncedHistorySearch.trim() || undefined,
      startDate: historyDateRange?.from ? toLocalDateString(historyDateRange.from) : undefined,
      endDate: historyDateRange?.to ? toLocalDateString(historyDateRange.to) : undefined,
    }),
    [historyPage, pageSize, debouncedHistorySearch, historyDateRange],
  );

  // Queries
  const { data: customerListResponse, isLoading: isCustomerListLoading } = useCustomerReceivablesList(activeQueryParams);
  const { data: settledListResponse, isLoading: isSettledListLoading } = useSettledReceivablesList(historyQueryParams);
  const { data: summary, isLoading: isSummaryLoading } = useCustomerReceivableSummary();

  // Mutations
  const payMutation = usePayCustomerInvoice();

  const handleSelectCustomer = (customer: CustomerReceivableModel) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleOpenPayInvoice = (
    customer: CustomerReceivableModel,
    invoice: ReceivableInvoiceItemModel,
  ) => {
    setPayingCustomer(customer);
    setPayingInvoice(invoice);
    setIsPaymentOpen(true);
  };

  const handleSavePayment = (input: PayCustomerInvoiceInput) => {
    payMutation.mutate(input, {
      onSuccess: (result) => {
        setIsPaymentOpen(false);
        setPayingCustomer(null);
        setPayingInvoice(null);
        // Refresh selected customer if still open in detail dialog
        if (selectedCustomer) {
          setSelectedCustomer((prev) => {
            if (!prev) return null;
            const updatedInvoices = prev.invoices.map((inv) => {
              if (inv.id !== result.invoice.id) return inv;

              const mergedPayments =
                result.invoice.payments.length >= inv.payments.length
                  ? result.invoice.payments
                  : [...inv.payments, ...result.invoice.payments];

              return {
                ...inv,
                ...result.invoice,
                payments: mergedPayments,
              };
            });
            const unpaidCount = updatedInvoices.filter((i) => i.remainingAmount > 0).length;
            const remaining = updatedInvoices.reduce((sum, i) => sum + i.remainingAmount, 0);
            const paid = updatedInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
            return {
              ...prev,
              unpaidInvoicesCount: unpaidCount,
              totalPaid: paid,
              totalRemaining: remaining,
              invoices: updatedInvoices,
            };
          });
        }
      },
    });
  };

  const handleOpenSettledDetail = (inv: SettledInvoiceReceivableModel) => {
    setSelectedSettledInvoice(inv);
    setIsSettledDetailOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
              Keuangan
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">
            Daftar Piutang Customer
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitoring piutang aktif per pelanggan serta riwayat pelunasan nota percetakan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Fitur Export Excel segera hadir di update berikutnya, Bosku!")}
            className="rounded-xl font-bold text-xs flex items-center gap-1.5 h-10 border-border/60 hover:bg-muted"
          >
            <LuFileSpreadsheet size={16} />
            Export Rekapitulasi
          </Button>
        </div>
      </div>

      {/* KPI / Summary Cards */}
      <ReceivableSummaryWidgets summary={summary} isLoading={isSummaryLoading} />

      {/* Tabs Navigation */}
      <div className="flex border-b border-border/50 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("ACTIVE")}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "ACTIVE"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <LuClock size={16} />
          <span>Piutang Aktif (Per Pelanggan)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("HISTORY")}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "HISTORY"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <LuHistory size={16} />
          <span>Riwayat Piutang (Per Nota Lunas)</span>
        </button>
      </div>

      {/* Main Content Table Card */}
      <Card className="rounded-3xl overflow-hidden shadow-sm border-border/50">
        <CardHeader className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-border/30 p-5 bg-card">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md w-full">
            <TextField
              placeholder={
                activeTab === "ACTIVE"
                  ? "Cari nama customer, no. HP, atau nota gantung..."
                  : "Cari nomor nota, SPK, atau nama pelanggan lunas..."
              }
              prefixIcon={LuSearch}
              value={activeTab === "ACTIVE" ? activeSearch : historySearch}
              onChange={(e) => {
                if (activeTab === "ACTIVE") {
                  setActiveSearch(e.target.value);
                  setActivePage(1);
                } else {
                  setHistorySearch(e.target.value);
                  setHistoryPage(1);
                }
              }}
              className="w-full h-10 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter ONLY for Active Tab */}
            {activeTab === "ACTIVE" && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setActivePage(1);
                  }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                    statusFilter === "ALL"
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("PARTIAL");
                    setActivePage(1);
                  }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                    statusFilter === "PARTIAL"
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                      : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  Ada Cicilan (DP)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("UNPAID");
                    setActivePage(1);
                  }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                    statusFilter === "UNPAID"
                      ? "bg-foreground text-background border-foreground shadow-sm"
                      : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  Belum Bayar
                </button>
              </div>
            )}

            {/* Date Range Picker (Active: Filter Tgl Order | History: Filter Tgl Pelunasan, Default: Hari Ini) */}
            <DateRangePicker
              value={activeTab === "ACTIVE" ? activeDateRange : historyDateRange}
              onChange={(range) => {
                if (activeTab === "ACTIVE") {
                  setActiveDateRange(range);
                  setActivePage(1);
                } else {
                  setHistoryDateRange(range);
                  setHistoryPage(1);
                }
              }}
              isClearable
              className="w-full sm:w-[240px] h-10 rounded-xl"
            />
          </div>
        </CardHeader>

        {/* Dynamic Table Content */}
        <CardContent className="p-0">
          {activeTab === "ACTIVE" ? (
            <CustomerReceivableTable
              customers={customerListResponse?.data || []}
              page={activePage}
              pageSize={pageSize}
              totalEntries={customerListResponse?.total || 0}
              isLoading={isCustomerListLoading}
              onPageChange={setActivePage}
              onPageSizeChange={setPageSize}
              onSelectCustomer={handleSelectCustomer}
            />
          ) : (
            <SettledReceivableTable
              invoices={settledListResponse?.data || []}
              page={historyPage}
              pageSize={pageSize}
              totalEntries={settledListResponse?.total || 0}
              isLoading={isSettledListLoading}
              onPageChange={setHistoryPage}
              onPageSizeChange={setPageSize}
              onDetail={handleOpenSettledDetail}
            />
          )}
        </CardContent>
      </Card>

      {/* Customer Invoices Breakdown Dialog (For Active Tab) */}
      <CustomerInvoicesDetailDialog
        key={selectedCustomer && isDetailOpen ? `detail-${selectedCustomer.id}` : "detail-closed"}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        onPayInvoice={handleOpenPayInvoice}
      />

      {/* Specific Invoice Payment Dialog */}
      <ReceivablePaymentDialog
        key={payingInvoice && isPaymentOpen ? `pay-${payingInvoice.id}` : "pay-closed"}
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setPayingCustomer(null);
          setPayingInvoice(null);
        }}
        customer={payingCustomer}
        invoice={payingInvoice}
        onSubmit={handleSavePayment}
        isLoading={payMutation.isPending}
      />

      {/* Settled Invoice Receipt & Audit Detail Dialog (For History Tab) */}
      <SettledInvoiceDetailDialog
        key={selectedSettledInvoice && isSettledDetailOpen ? `settled-${selectedSettledInvoice.id}` : "settled-closed"}
        isOpen={isSettledDetailOpen}
        onClose={() => {
          setIsSettledDetailOpen(false);
          setSelectedSettledInvoice(null);
        }}
        invoice={selectedSettledInvoice}
      />
    </div>
  );
};

export default ReceivablePage;
