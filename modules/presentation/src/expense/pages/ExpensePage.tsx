import React, { useState, useMemo } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Card, CardHeader, CardContent } from "@erp-digital-printing/ui/Card";
import { LuPlus, LuSearch, LuCreditCard } from "@erp-digital-printing/ui/icons";
import { DateRangePicker, type DateRange } from "@erp-digital-printing/ui/DateRangePicker";
import { toast } from "@erp-digital-printing/ui/Toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useExpenseDI } from "../hooks/useExpenseDI";
import { expenseKeys } from "@infrastructure/expense/keys";
import { useDebounce } from "../../shared/hooks/useDebounce";

import { ExpenseSummaryCards } from "../components/ExpenseSummaryCards";
import { ExpenseBillTable } from "../components/ExpenseBillTable";
import { ExpenseFormDialog } from "../components/ExpenseFormDialog";
import { ExpensePaymentDialog } from "../components/ExpensePaymentDialog";
import { ExpenseBill, MOCK_EXPENSE_BILLS } from "../types/expenseTypes";

let idCounter = 0;
const generateUniqueId = (prefix: string): string => {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
};

const ExpensePage = () => {
  const queryClient = useQueryClient();
  const { getExpensesUseCase } = useExpenseDI();

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 750);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of month
    to: new Date(),
  });

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<ExpenseBill | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const toLocalDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const queryParams = useMemo(() => ({
    page,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
    startDate: dateRange?.from ? toLocalDateString(dateRange.from) : undefined,
    endDate: dateRange?.to ? toLocalDateString(dateRange.to) : undefined,
  }), [page, pageSize, debouncedSearch, dateRange]);

  const { data: response, isLoading } = useQuery({
    queryKey: expenseKeys.list(queryParams),
    queryFn: () => getExpensesUseCase.execute(queryParams),
    staleTime: 30_000,
  });

  const bills = useMemo((): ExpenseBill[] => {
    if (!response?.data) return [];
    return response.data.map((item) => ({
      id: item.id,
      billNumber: item.invoiceNumber,
      date: (item.createdAt ? item.createdAt.split("T")[0] : null) ?? toLocalDateString(new Date()),
      supplierName: item.vendorName,
      discount: item.discount,
      ...(item.supplierId ? { supplierId: item.supplierId } : {}),
      totalAmount: item.totalAmount,
      paidAmount: item.paidAmount,
      paymentStatus: item.paymentStatus,
      description: item.description,
      items: item.items.map((it) => ({
        id: it.id,
        description: it.description,
        amount: it.amount,
        categoryId: it.expenseCategoryId,
        categoryName: "Kategori",
        expenseType: "OPERATIONAL",
      })),
      payments: item.payments.map((p) => ({
        id: p.id,
        expenseBillId: item.id,
        paymentDate: (p.paymentDate ? p.paymentDate.split("T")[0] : null) ?? toLocalDateString(new Date()),
        paymentAccount: p.paymentMethod === "cash" ? "Cash" : "Transfer",
        amountPaid: p.amount,
      })),
    }));
  }, [response]);

  const totalEntries = response?.total ?? 0;

  // Calculate Summary Metrics
  const summaryMetrics = useMemo(() => {
    let totalExpense = 0;
    let totalPaid = 0;
    let totalDebt = 0;

    bills.forEach((bill) => {
      if (bill.paymentStatus !== "VOID") {
        totalExpense += bill.totalAmount;
        totalPaid += bill.paidAmount;
        totalDebt += bill.totalAmount - bill.paidAmount;
      }
    });

    return { totalExpense, totalPaid, totalDebt };
  }, [bills]);

  // Actions
  const handleOpenCreate = () => {
    setSelectedBill(null);
    setIsReadOnly(false);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (bill: ExpenseBill) => {
    setSelectedBill(bill);
    setIsReadOnly(true);
    setIsFormOpen(true);
  };

  const handleOpenPay = (bill: ExpenseBill) => {
    setSelectedBill(bill);
    setIsPaymentOpen(true);
  };

  const handleCancelBill = (bill: ExpenseBill) => {
    toast.info("Info", `Fitur pembatalan untuk nota ${bill.billNumber} sedang disiapkan.`);
  };

  const handleSaveBill = () => {
    queryClient.invalidateQueries({ queryKey: expenseKeys.all });
  };

  const handleSavePayment = () => {
    queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    toast.success("Berhasil", "Pembayaran cicilan berhasil dicatat.");
  };

  // Removed client-side filteredBills logic since filtering is now handled server-side via React Query

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuCreditCard className="text-primary" size={32} />
            Pencatatan Pengeluaran
          </h1>
          <p className="text-muted-foreground font-medium">
            Kelola faktur, nota belanja, dan pencatatan utang/cicilan pengeluaran secara terpadu.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <ExpenseSummaryCards
        totalExpense={summaryMetrics.totalExpense}
        totalPaid={summaryMetrics.totalPaid}
        totalDebt={summaryMetrics.totalDebt}
      />

      {/* Action Bar (Search & Button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-sm font-semibold text-muted-foreground bg-muted px-4 py-2 rounded-2xl border border-border/40">
          Daftar Transaksi Nota Belanja
        </div>

        <Button
          className="h-10 px-5 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0 self-end sm:self-auto"
          onClick={handleOpenCreate}
        >
          <LuPlus size={18} />
          Catat Nota Baru
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="rounded-3xl overflow-hidden shadow-sm border-border/50">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/30 p-6 bg-card">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md w-full">
            <TextField
              placeholder="Cari nomor nota, supplier, atau deskripsi item..."
              prefixIcon={LuSearch}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full h-10"
            />
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              isClearable
              className="w-full sm:w-[260px] h-10 rounded-xl"
            />
          </div>
        </CardHeader>

        {/* Dynamic Table Content */}
        <CardContent className="p-0">
          <ExpenseBillTable
            bills={bills}
            page={page}
            pageSize={pageSize}
            totalEntries={totalEntries}
            isLoading={isLoading}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onDetail={handleOpenDetail}
            onPay={handleOpenPay}
            onCancel={handleCancelBill}
          />
        </CardContent>
      </Card>

      {/* Expense Form Dialog */}
      <ExpenseFormDialog
        key={isFormOpen ? (selectedBill ? `edit-${selectedBill.id}` : "new-bill") : "closed-form"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        bill={selectedBill}
        readOnly={isReadOnly}
        onSave={handleSaveBill}
      />

      {/* Expense Payment Dialog */}
      <ExpensePaymentDialog
        key={isPaymentOpen ? `pay-${selectedBill?.id}` : "closed-payment"}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        bill={selectedBill}
        onSavePayment={handleSavePayment}
      />
    </div>
  );
};

export default ExpensePage;
