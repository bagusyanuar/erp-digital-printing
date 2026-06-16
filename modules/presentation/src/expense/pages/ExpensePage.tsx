import React, { useState, useMemo } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Card, CardHeader, CardContent } from "@erp-digital-printing/ui/Card";
import { LuPlus, LuSearch, LuCreditCard } from "@erp-digital-printing/ui/icons";
import { DateRangePicker, type DateRange } from "@erp-digital-printing/ui/DateRangePicker";

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
  // Bills List State
  const [bills, setBills] = useState<ExpenseBill[]>(MOCK_EXPENSE_BILLS);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of month
    to: new Date(),
  });

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<ExpenseBill | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

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
    const confirm = window.confirm(
      `Apakah Anda yakin ingin membatalkan nota pengeluaran ${bill.billNumber} dari ${
        bill.supplierName
      } senilai Rp ${bill.totalAmount.toLocaleString("id-ID")}? Status akan diubah menjadi Dibatalkan.`
    );
    if (confirm) {
      setBills((prev) =>
        prev.map((b) => (b.id === bill.id ? { ...b, paymentStatus: "VOID" } : b))
      );
      alert(`Nota ${bill.billNumber} telah berhasil dibatalkan.`);
    }
  };

  const handleSaveBill = (savedBill: ExpenseBill) => {
    setBills((prev) => {
      const exists = prev.some((b) => b.id === savedBill.id);
      if (exists) {
        return prev.map((b) => (b.id === savedBill.id ? savedBill : b));
      } else {
        return [savedBill, ...prev];
      }
    });
  };

  const handleSavePayment = (
    billId: string,
    paymentDetails: { paymentDate: string; paymentAccount: string; amountPaid: number }
  ) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          const newPaidAmount = b.paidAmount + paymentDetails.amountPaid;
          const newStatus: ExpenseBill["paymentStatus"] =
            newPaidAmount >= b.totalAmount ? "PAID" : "PARTIAL_PAID";

          const newPaymentRecord = {
            id: generateUniqueId("pay"),
            expenseBillId: billId,
            ...paymentDetails,
          };

          return {
            ...b,
            paidAmount: newPaidAmount,
            paymentStatus: newStatus,
            payments: [...b.payments, newPaymentRecord],
          };
        }
        return b;
      })
    );
    alert("Pembayaran cicilan berhasil dicatat.");
  };

  // Filter bills list based on search and date range
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      // 1. Search Query filter (matches bill number, supplier name or item description)
      const matchesSearch =
        bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.items.some((item) =>
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // 2. Date filter
      if (!matchesSearch) return false;

      if (dateRange?.from || dateRange?.to) {
        const billDate = new Date(bill.date);
        billDate.setHours(0, 0, 0, 0);

        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          if (billDate < fromDate) return false;
        }

        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (billDate > toDate) return false;
        }
      }

      return true;
    });
  }, [bills, searchQuery, dateRange]);

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
              onChange={(e) => setSearchQuery(e.target.value)}
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
            bills={filteredBills}
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
