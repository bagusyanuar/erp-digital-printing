import React, { useState } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Card, CardHeader, CardContent } from "@erp-digital-printing/ui/Card";
import { LuPlus, LuSearch, LuCreditCard } from "@erp-digital-printing/ui/icons";
import { DateRangePicker, type DateRange } from "@erp-digital-printing/ui/DateRangePicker";

import { ExpenseSummaryCards } from "../components/ExpenseSummaryCards";
import { ProductionTable } from "../components/ProductionTable";
import { OperationalTable } from "../components/OperationalTable";
import { ProductionFormDialog, type ProductionExpenseMock } from "../components/ProductionFormDialog";
import { OperationalFormDialog, type OperationalExpenseMock } from "../components/OperationalFormDialog";

const ExpensePage = () => {
  // Tabs & Filters State
  const [activeTab, setActiveTab] = useState<"PRODUCTION" | "OPERATIONAL">("PRODUCTION");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  // Dialog States
  const [isProductionFormOpen, setIsProductionFormOpen] = useState(false);
  const [isOperationalFormOpen, setIsOperationalFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ProductionExpenseMock | OperationalExpenseMock | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const handleOpenCreate = () => {
    setSelectedExpense(null);
    setIsReadOnly(false);
    if (activeTab === "PRODUCTION") {
      setIsProductionFormOpen(true);
    } else {
      setIsOperationalFormOpen(true);
    }
  };

  const handleOpenDetail = (expense: ProductionExpenseMock | OperationalExpenseMock) => {
    setSelectedExpense(expense);
    setIsReadOnly(true);
    if (activeTab === "PRODUCTION") {
      setIsProductionFormOpen(true);
    } else {
      setIsOperationalFormOpen(true);
    }
  };

  const handleCancel = (expense: ProductionExpenseMock | OperationalExpenseMock) => {
    const confirm = window.confirm(
      `Apakah Anda yakin ingin membatalkan transaksi pengeluaran dengan nominal Rp ${expense.amount.toLocaleString("id-ID")} ini? Status akan diubah menjadi Dibatalkan.`
    );
    if (confirm) {
      alert(`Transaksi ${expense.id} telah dibatalkan (void).`);
    }
  };

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
            Kelola pengeluaran biaya langsung produksi dan operasional kantor secara global.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <ExpenseSummaryCards />

      {/* Tabs Selector & Action Button (Outside Card) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-muted p-1 rounded-2xl border border-border/50 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("PRODUCTION")}
            className={`px-6 py-2.5 text-sm font-extrabold rounded-xl transition-all ${
              activeTab === "PRODUCTION"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Biaya Produksi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("OPERATIONAL")}
            className={`px-6 py-2.5 text-sm font-extrabold rounded-xl transition-all ${
              activeTab === "OPERATIONAL"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Biaya Operasional
          </button>
        </div>

        <Button
          className="h-10 px-5 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0 self-end sm:self-auto"
          onClick={handleOpenCreate}
        >
          <LuPlus size={18} />
          Catat Pengeluaran
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="rounded-3xl overflow-hidden shadow-sm border-border/50">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/30 p-6 bg-card">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md w-full">
            <TextField
              placeholder={`Cari pengeluaran ${activeTab === "PRODUCTION" ? "produksi" : "operasional"}...`}
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
          {activeTab === "PRODUCTION" ? (
            <ProductionTable onDetail={handleOpenDetail} onCancel={handleCancel} />
          ) : (
            <OperationalTable onDetail={handleOpenDetail} onCancel={handleCancel} />
          )}
        </CardContent>
      </Card>

      {/* Forms Dialogs */}
      <ProductionFormDialog
        key={isProductionFormOpen ? (selectedExpense ? `edit-${(selectedExpense as ProductionExpenseMock).id}` : "new") : "closed-prod"}
        isOpen={isProductionFormOpen}
        onClose={() => setIsProductionFormOpen(false)}
        expense={activeTab === "PRODUCTION" ? (selectedExpense as ProductionExpenseMock) : null}
        readOnly={isReadOnly}
      />

      <OperationalFormDialog
        key={isOperationalFormOpen ? (selectedExpense ? `edit-${(selectedExpense as OperationalExpenseMock).id}` : "new") : "closed-op"}
        isOpen={isOperationalFormOpen}
        onClose={() => setIsOperationalFormOpen(false)}
        expense={activeTab === "OPERATIONAL" ? (selectedExpense as OperationalExpenseMock) : null}
        readOnly={isReadOnly}
      />
    </div>
  );
};

export default ExpensePage;
