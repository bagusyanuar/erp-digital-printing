import React from "react";
import { Card, CardContent } from "@erp-digital-printing/ui/Card";
import { LuCreditCard, LuReceipt, LuTrendingDown } from "@erp-digital-printing/ui/icons";

interface ExpenseSummaryCardsProps {
  totalExpense?: number;
  totalProduction?: number;
  totalOperational?: number;
}

export const ExpenseSummaryCards: React.FC<ExpenseSummaryCardsProps> = ({
  totalExpense = 45750000,
  totalProduction = 28500000,
  totalOperational = 17250000,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Pengeluaran */}
      <Card className="rounded-3xl border-border/50 overflow-hidden relative shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card via-card to-primary/5">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Total Pengeluaran Bulan Ini
            </span>
            <h3 className="text-2xl font-black text-foreground tracking-tight">
              {formatCurrency(totalExpense)}
            </h3>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
              <span className="text-emerald-500 font-bold">12%</span> dibanding bulan lalu
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <LuCreditCard size={24} />
          </div>
        </CardContent>
      </Card>

      {/* Pengeluaran Produksi */}
      <Card className="rounded-3xl border-border/50 overflow-hidden relative shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card via-card to-sky-500/5">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Total Biaya Produksi
            </span>
            <h3 className="text-2xl font-black text-foreground tracking-tight">
              {formatCurrency(totalProduction)}
            </h3>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
              Bahan baku & pengerjaan cetak
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 shadow-sm">
            <LuReceipt size={24} />
          </div>
        </CardContent>
      </Card>

      {/* Pengeluaran Operasional */}
      <Card className="rounded-3xl border-border/50 overflow-hidden relative shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card via-card to-emerald-500/5">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Total Biaya Operasional
            </span>
            <h3 className="text-2xl font-black text-foreground tracking-tight">
              {formatCurrency(totalOperational)}
            </h3>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
              Sewa, listrik, gaji, & operasional kantor
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-sm">
            <LuTrendingDown size={24} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
