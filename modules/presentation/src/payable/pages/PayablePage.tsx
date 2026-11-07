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
  useVendorPayablesList,
  useSettledPayablesList,
  useVendorPayableSummary,
  usePayVendorExpense,
} from "../hooks/usePayables";
import { PayableSummaryWidgets } from "../components/PayableSummaryWidgets";
import { VendorPayableTable } from "../components/VendorPayableTable";
import { SettledPayableTable } from "../components/SettledPayableTable";
import { VendorExpensesDetailDialog } from "../components/VendorExpensesDetailDialog";
import { PayablePaymentDialog } from "../components/PayablePaymentDialog";
import { SettledExpenseDetailDialog } from "../components/SettledExpenseDetailDialog";
import type {
  PayableTabType,
  VendorPayableStatusFilter,
  PayVendorExpenseInput,
} from "@core/payable/applications/inputs/payable.input";
import type {
  VendorPayableModel,
  PayableExpenseItemModel,
  SettledExpensePayableModel,
} from "@core/payable/domains/models/payable.model";

const toLocalDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const PayablePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PayableTabType>("ACTIVE");
  const [activePage, setActivePage] = useState<number>(1);
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Active Tab Search & Filters
  const [activeSearch, setActiveSearch] = useState<string>("");
  const debouncedActiveSearch = useDebounce(activeSearch, 500);
  const [statusFilter, setStatusFilter] = useState<VendorPayableStatusFilter>("ALL");
  const [activeDateRange, setActiveDateRange] = useState<DateRange | undefined>(undefined);

  // History Tab Search & Filters
  const [historySearch, setHistorySearch] = useState<string>("");
  const debouncedHistorySearch = useDebounce(historySearch, 500);
  const [historyDateRange, setHistoryDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: today, to: today };
  });

  // Active Tab Dialog states
  const [selectedVendor, setSelectedVendor] = useState<VendorPayableModel | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const [payingVendor, setPayingVendor] = useState<VendorPayableModel | null>(null);
  const [payingExpense, setPayingExpense] = useState<PayableExpenseItemModel | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);

  // History Tab Dialog states
  const [selectedSettledItem, setSelectedSettledItem] = useState<SettledExpensePayableModel | null>(null);
  const [isSettledDetailOpen, setIsSettledDetailOpen] = useState<boolean>(false);

  // Active Tab Query Params
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

  // History Tab Query Params
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
  const { data: vendorListResponse, isLoading: isVendorListLoading } = useVendorPayablesList(activeQueryParams);
  const { data: settledListResponse, isLoading: isSettledListLoading } = useSettledPayablesList(historyQueryParams);
  const { data: summary, isLoading: isSummaryLoading } = useVendorPayableSummary();

  // Mutations
  const payMutation = usePayVendorExpense();

  const handleSelectVendor = (vendor: VendorPayableModel) => {
    setSelectedVendor(vendor);
    setIsDetailOpen(true);
  };

  const handleOpenPayExpense = (
    vendor: VendorPayableModel,
    expense: PayableExpenseItemModel,
  ) => {
    setPayingVendor(vendor);
    setPayingExpense(expense);
    setIsPaymentOpen(true);
  };

  const handleSavePayment = (input: PayVendorExpenseInput) => {
    payMutation.mutate(input, {
      onSuccess: (result) => {
        setIsPaymentOpen(false);
        setPayingVendor(null);
        setPayingExpense(null);

        // Refresh selected vendor if still open in detail dialog
        if (selectedVendor) {
          setSelectedVendor((prev) => {
            if (!prev) return null;
            const updatedExpenses = prev.expenses.map((exp) => {
              if (exp.id !== result.expense.id) return exp;

              const mergedPayments =
                result.expense.payments.length >= exp.payments.length
                  ? result.expense.payments
                  : [...exp.payments, ...result.expense.payments];

              return {
                ...exp,
                ...result.expense,
                payments: mergedPayments,
              };
            });
            const unpaidCount = updatedExpenses.filter((e) => e.remainingAmount > 0).length;
            const totalRemaining = updatedExpenses.reduce((sum, e) => sum + e.remainingAmount, 0);
            const totalPaid = updatedExpenses.reduce((sum, e) => sum + e.amountPaid, 0);

            return {
              ...prev,
              expenses: updatedExpenses,
              unpaidExpensesCount: unpaidCount,
              totalRemaining,
              totalPaid,
              hasOverdue: updatedExpenses.some((e) => e.isOverdue && e.remainingAmount > 0),
            };
          });
        }
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Hutang Pengeluaran & Vendor
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola tagihan tempo pembelian bahan, subkontrak, serta operasional percetakan.
          </p>
        </div>
      </div>

      {/* Summary Widgets */}
      <PayableSummaryWidgets summary={summary} isLoading={isSummaryLoading} />

      {/* Main Content Card with Tabs */}
      <Card className="rounded-2xl border-border/50 shadow-xs bg-card">
        {/* Navigation Tabs */}
        <div className="border-b border-border/40 px-6 pt-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("ACTIVE")}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-bold transition-all -mb-[1px] ${
                activeTab === "ACTIVE"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <LuClock size={16} />
              <span>Hutang Berjalan</span>
              {summary && summary.activeVendorCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {summary.activeVendorCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("HISTORY")}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-bold transition-all -mb-[1px] ${
                activeTab === "HISTORY"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <LuHistory size={16} />
              <span>Riwayat Pelunasan</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Hutang Berjalan (Active) */}
        {activeTab === "ACTIVE" && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="p-6 pb-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-3 flex-wrap">
                <div className="w-full sm:w-72">
                  <TextField
                    placeholder="Cari vendor, no. nota, ref..."
                    value={activeSearch}
                    onChange={(e) => {
                      setActiveSearch(e.target.value);
                      setActivePage(1);
                    }}
                    prefixIcon={LuSearch}
                    className="h-9 text-xs"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/40 text-xs">
                  {(
                    [
                      { id: "ALL", label: "Semua" },
                      { id: "OVERDUE", label: "Overdue" },
                      { id: "PARTIAL", label: "Sebagian" },
                      { id: "UNPAID", label: "Belum Bayar" },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setStatusFilter(st.id);
                        setActivePage(1);
                      }}
                      className={`px-3 py-1 rounded-md font-semibold transition-all ${
                        statusFilter === st.id
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <DateRangePicker
                  value={activeDateRange}
                  onChange={(range) => {
                    setActiveDateRange(range);
                    setActivePage(1);
                  }}
                  placeholder="Filter Jatuh Tempo"
                  className="h-9 text-xs w-full sm:w-auto"
                />
                {activeDateRange && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-2 text-xs text-muted-foreground"
                    onClick={() => setActiveDateRange(undefined)}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Table */}
            <VendorPayableTable
              vendors={vendorListResponse?.data ?? []}
              page={activePage}
              pageSize={pageSize}
              totalEntries={vendorListResponse?.total ?? 0}
              isLoading={isVendorListLoading}
              onPageChange={setActivePage}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setActivePage(1);
              }}
              onSelectVendor={handleSelectVendor}
            />
          </div>
        )}

        {/* Tab 2: Riwayat Pelunasan (Settled History) */}
        {activeTab === "HISTORY" && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="p-6 pb-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="w-full sm:w-72">
                <TextField
                  placeholder="Cari no nota, vendor, ref..."
                  value={historySearch}
                  onChange={(e) => {
                    setHistorySearch(e.target.value);
                    setHistoryPage(1);
                  }}
                  prefixIcon={LuSearch}
                  className="h-9 text-xs"
                />
              </div>

              {/* Date Filter (Default: Hari Ini) */}
              <div className="flex items-center gap-2">
                <DateRangePicker
                  value={historyDateRange}
                  onChange={(range) => {
                    setHistoryDateRange(range);
                    setHistoryPage(1);
                  }}
                  placeholder="Filter Tanggal Lunas"
                  className="h-9 text-xs w-full sm:w-auto"
                />
                {historyDateRange && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-2 text-xs text-muted-foreground"
                    onClick={() => setHistoryDateRange(undefined)}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Table Settled */}
            <SettledPayableTable
              items={settledListResponse?.data ?? []}
              page={historyPage}
              pageSize={pageSize}
              totalEntries={settledListResponse?.total ?? 0}
              isLoading={isSettledListLoading}
              onPageChange={setHistoryPage}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setHistoryPage(1);
              }}
              onSelectSettledItem={(item) => {
                setSelectedSettledItem(item);
                setIsSettledDetailOpen(true);
              }}
            />
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <VendorExpensesDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        vendor={selectedVendor}
        onPayExpense={handleOpenPayExpense}
      />

      <PayablePaymentDialog
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        vendor={payingVendor}
        expense={payingExpense}
        onSubmit={handleSavePayment}
        isLoading={payMutation.isPending}
      />

      <SettledExpenseDetailDialog
        isOpen={isSettledDetailOpen}
        onClose={() => setIsSettledDetailOpen(false)}
        item={selectedSettledItem}
      />
    </div>
  );
};

export default PayablePage;
