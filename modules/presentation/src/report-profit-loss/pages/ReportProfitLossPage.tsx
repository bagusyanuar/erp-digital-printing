import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardContent } from "@erp-digital-printing/ui/Card";
import { Button } from "@erp-digital-printing/ui/Button";
import {
  DateRangePicker,
  type DateRange,
} from "@erp-digital-printing/ui/DateRangePicker";
import {
  LuScale,
  LuFileSpreadsheet,
  LuDollarSign,
  LuTrendingUp,
  LuTrendingDown,
  LuBoxes,
  LuCoins,
  LuFileText,
  LuCircleCheck,
  LuCalendar,
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
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { reportKeys } from "@infrastructure/report/keys/report.key";
import { useReportProfitLossDI } from "../hooks/useReportProfitLossDI";
import type { ProfitLossModel } from "@core/report";

type PresetPeriod = "today" | "this_month" | "last_month" | "this_year" | "custom";

const PRESET_OPTIONS: { id: Exclude<PresetPeriod, "custom">; label: string }[] = [
  { id: "today", label: "Hari Ini" },
  { id: "this_month", label: "Bulan Ini" },
  { id: "last_month", label: "Bulan Lalu" },
  { id: "this_year", label: "Tahun Ini" },
];

const PIE_COLORS = [
  "#ef4444", // HPP (Rose / Red)
  "#f59e0b", // Operasional (Amber)
  "#10b981", // Laba Bersih (Emerald)
];

const EMPTY_PROFIT_LOSS: ProfitLossModel = {
  period: "-",
  startDate: "",
  endDate: "",
  revenue: { title: "I. Pendapatan Usaha (Revenue)", items: [], total: 0 },
  cogs: { title: "II. Beban Pokok Penjualan (HPP / Biaya Bahan Baku)", items: [], total: 0 },
  grossProfit: { amount: 0, marginPercentage: 0 },
  operationalExpenses: { title: "III. Beban Operasional (Operational Expenses)", items: [], total: 0 },
  netProfit: { amount: 0, marginPercentage: 0, isProfit: false },
};

export const ReportProfitLossPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"statement" | "analytic">(
    "statement",
  );

  const [selectedPreset, setSelectedPreset] = useState<PresetPeriod>("this_month");

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const now = new Date();
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  });

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const { getProfitLossUseCase, getProfitLossTrendUseCase } =
    useReportProfitLossDI();

  const toLocalDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const queryParams = useMemo(
    () => ({
      startDate: dateRange?.from ? toLocalDateString(dateRange.from) : undefined,
      endDate: dateRange?.to ? toLocalDateString(dateRange.to) : undefined,
    }),
    [dateRange],
  );

  const { data: reportData, isLoading: isLoadingReport } = useQuery({
    queryKey: reportKeys.profitLoss(queryParams),
    queryFn: () => getProfitLossUseCase.execute(queryParams),
  });

  const { data: trendData, isLoading: isLoadingTrend } = useQuery({
    queryKey: reportKeys.profitLossTrend({ months: 6 }),
    queryFn: () => getProfitLossTrendUseCase.execute({ months: 6 }),
  });

  const data = reportData ?? EMPTY_PROFIT_LOSS;
  const trendList = trendData ?? [];

  // Preset date filter helpers
  const handleSetPreset = (preset: Exclude<PresetPeriod, "custom">) => {
    setSelectedPreset(preset);
    const now = new Date();
    if (preset === "today") {
      setDateRange({ from: now, to: now });
    } else if (preset === "this_month") {
      setDateRange({
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      });
    } else if (preset === "last_month") {
      setDateRange({
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 0),
      });
    } else if (preset === "this_year") {
      setDateRange({
        from: new Date(now.getFullYear(), 0, 1),
        to: new Date(now.getFullYear(), 11, 31),
      });
    }
  };

  // Pie chart ratio data
  const pieChartData = useMemo(() => {
    if (!data.revenue.total && !data.cogs.total && !data.operationalExpenses.total) {
      return [];
    }
    const totalRev = data.revenue.total || 1;
    return [
      {
        name: "HPP Bahan Baku",
        value: data.cogs.total,
        percentage: ((data.cogs.total / totalRev) * 100).toFixed(1),
      },
      {
        name: "Beban Operasional",
        value: data.operationalExpenses.total,
        percentage: ((data.operationalExpenses.total / totalRev) * 100).toFixed(1),
      },
      {
        name: "Laba Bersih Usaha",
        value: Math.max(0, data.netProfit.amount),
        percentage: Math.max(0, (data.netProfit.amount / totalRev) * 100).toFixed(1),
      },
    ];
  }, [data]);

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuScale className="text-primary" size={32} />
            Laporan Laba Rugi
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Pantau performa profitabilitas, marjin laba kotor, struktur beban biaya, dan laba bersih percetakan secara transparan.
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

      {/* Date Range & Preset Filter Bar */}
      <Card className="rounded-3xl border-border/50 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mr-1">
              <LuCalendar size={14} /> Periode Cepat:
            </span>
            {PRESET_OPTIONS.map((preset) => {
              const isActive = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSetPreset(preset.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.02]"
                      : "border-border/50 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <DateRangePicker
              value={dateRange}
              onChange={(newRange) => {
                setDateRange(newRange);
                setSelectedPreset("custom");
              }}
              isClearable
              className="w-full sm:w-[280px] h-10"
            />
          </div>
        </div>
      </Card>

      {/* Executive KPI Cards Row (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Pendapatan Usaha */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Total Pendapatan
              </span>
              <div
                className={`text-base font-black tracking-tight text-foreground ${
                  isLoadingReport ? "opacity-40 animate-pulse" : ""
                }`}
              >
                {formatCurrency(data.revenue.total)}
              </div>
              <span className="text-[10px] font-bold text-muted-foreground block">
                Basis Penjualan (100%)
              </span>
            </div>
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <LuDollarSign size={22} />
            </div>
          </CardContent>
        </Card>

        {/* 2. Total HPP */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Total HPP Bahan
              </span>
              <div
                className={`text-base font-black tracking-tight text-destructive ${
                  isLoadingReport ? "opacity-40 animate-pulse" : ""
                }`}
              >
                {formatCurrency(data.cogs.total)}
              </div>
              <span className="text-[10px] font-bold text-rose-500 block">
                {data.revenue.total > 0
                  ? `${((data.cogs.total / data.revenue.total) * 100).toFixed(1)}% dari Omset`
                  : "-"}
              </span>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
              <LuBoxes size={22} />
            </div>
          </CardContent>
        </Card>

        {/* 3. Laba Kotor */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Laba Kotor (Gross)
              </span>
              <div
                className={`text-base font-black tracking-tight text-emerald-600 dark:text-emerald-400 ${
                  isLoadingReport ? "opacity-40 animate-pulse" : ""
                }`}
              >
                {formatCurrency(data.grossProfit.amount)}
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                Margin {data.grossProfit.marginPercentage}%
              </span>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <LuTrendingUp size={22} />
            </div>
          </CardContent>
        </Card>

        {/* 4. Beban Operasional */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Beban Operasional
              </span>
              <div
                className={`text-base font-black tracking-tight text-amber-600 dark:text-amber-400 ${
                  isLoadingReport ? "opacity-40 animate-pulse" : ""
                }`}
              >
                {formatCurrency(data.operationalExpenses.total)}
              </div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
                {data.revenue.total > 0
                  ? `${((data.operationalExpenses.total / data.revenue.total) * 100).toFixed(1)}% dari Omset`
                  : "-"}
              </span>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400">
              <LuTrendingDown size={22} />
            </div>
          </CardContent>
        </Card>

        {/* 5. Laba Bersih */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Laba Bersih (Net)
              </span>
              <div
                className={`text-base font-black tracking-tight text-emerald-600 dark:text-emerald-400 ${
                  isLoadingReport ? "opacity-40 animate-pulse" : ""
                }`}
              >
                {formatCurrency(data.netProfit.amount)}
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
                <LuCircleCheck size={11} /> Net Margin {data.netProfit.marginPercentage}%
              </span>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <LuCoins size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Segmented Control */}
      <div className="flex border-b border-border/40 pb-px">
        <div className="flex gap-2 bg-muted/50 p-1 rounded-xl border border-border/30">
          <button
            onClick={() => setActiveTab("statement")}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === "statement"
                ? "bg-background shadow-md text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LuFileText size={15} />
            <span>Format Laporan Keuangan</span>
          </button>
          <button
            onClick={() => setActiveTab("analytic")}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === "analytic"
                ? "bg-background shadow-md text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LuTrendingUp size={15} />
            <span>Grafik & Analisis Margin</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Financial Statement View */}
      {activeTab === "statement" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden bg-card">
            {/* Statement Header */}
            <div className="p-6 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-foreground">
                  Laporan Laba Rugi Komprehensif
                </h3>
                <p className="text-xs text-muted-foreground">
                  Format standar multi-step akuntansi percetakan digital printing
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    data.netProfit.isProfit
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      data.netProfit.isProfit ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  Kondisi Finansial: {data.netProfit.isProfit ? "Surplus (Untung)" : "Defisit (Rugi)"}
                </span>
              </div>
            </div>

            {/* Statement Content */}
            <div className="p-6 space-y-6">
              {isLoadingReport ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <div className="relative w-8.5 h-8.5 mx-auto">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground block animate-pulse">
                    Memuat Laporan Laba Rugi...
                  </span>
                </div>
              ) : (
                <>
                  {/* BAGIAN I: PENDAPATAN */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b-2 border-primary/30">
                      <h4 className="text-sm font-black text-foreground uppercase tracking-wider">
                        {data.revenue.title}
                      </h4>
                      <span className="text-xs font-bold text-muted-foreground">
                        % terhadap Omset
                      </span>
                    </div>
                    {data.revenue.items.length === 0 ? (
                      <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                        Tidak ada transaksi pendapatan pada periode ini.
                      </div>
                    ) : (
                      <div className="divide-y divide-border/20 text-xs">
                        {data.revenue.items.map((item) => {
                          const pct =
                            data.revenue.total > 0
                              ? ((item.amount / data.revenue.total) * 100).toFixed(1)
                              : "0.0";
                          return (
                            <div
                              key={item.id}
                              className="py-2.5 flex items-center justify-between hover:bg-muted/30 px-3 rounded-lg transition-colors"
                            >
                              <span className="font-semibold text-foreground">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-8">
                                <span className="font-mono font-bold text-foreground">
                                  {formatCurrency(item.amount)}
                                </span>
                                <span className="font-mono text-muted-foreground w-12 text-right">
                                  {pct}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* Subtotal Pendapatan */}
                    <div className="bg-muted/40 p-3.5 rounded-xl border border-border/40 flex items-center justify-between text-xs font-black">
                      <span className="text-foreground uppercase tracking-wide">
                        Total Pendapatan Usaha Bersih
                      </span>
                      <div className="flex items-center gap-8">
                        <span className="text-foreground text-sm">
                          {formatCurrency(data.revenue.total)}
                        </span>
                        <span className="w-12 text-right">100.0%</span>
                      </div>
                    </div>
                  </div>

                  {/* BAGIAN II: BEBAN POKOK PENJUALAN (HPP) */}
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-between pb-2 border-b-2 border-destructive/30">
                      <h4 className="text-sm font-black text-foreground uppercase tracking-wider">
                        {data.cogs.title}
                      </h4>
                      <span className="text-xs font-bold text-muted-foreground">
                        % terhadap Omset
                      </span>
                    </div>
                    {data.cogs.items.length === 0 ? (
                      <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                        Tidak ada beban HPP pada periode ini.
                      </div>
                    ) : (
                      <div className="divide-y divide-border/20 text-xs">
                        {data.cogs.items.map((item) => {
                          const pct =
                            data.revenue.total > 0
                              ? ((item.amount / data.revenue.total) * 100).toFixed(1)
                              : "0.0";
                          return (
                            <div
                              key={item.id}
                              className="py-2.5 flex items-center justify-between hover:bg-muted/30 px-3 rounded-lg transition-colors"
                            >
                              <span className="font-semibold text-foreground">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-8">
                                <span className="font-mono font-bold text-destructive">
                                  {formatCurrency(item.amount)}
                                </span>
                                <span className="font-mono text-muted-foreground w-12 text-right">
                                  {pct}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* Subtotal HPP */}
                    <div className="bg-destructive/5 p-3.5 rounded-xl border border-destructive/20 flex items-center justify-between text-xs font-black text-destructive">
                      <span className="uppercase tracking-wide">
                        Total Beban Pokok Penjualan (HPP)
                      </span>
                      <div className="flex items-center gap-8">
                        <span className="text-sm">
                          {formatCurrency(data.cogs.total)}
                        </span>
                        <span className="w-12 text-right">
                          {data.revenue.total > 0
                            ? `${((data.cogs.total / data.revenue.total) * 100).toFixed(1)}%`
                            : "0.0%"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* HIGHLIGHT: LABA KOTOR (GROSS PROFIT) */}
                  <div className="bg-primary/10 border-2 border-primary/20 p-4 rounded-2xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black uppercase tracking-wider text-primary">
                        Laba Kotor (Gross Profit)
                      </span>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        Pendapatan Usaha dikurangi Beban Pokok Penjualan
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <div className="text-lg font-black text-primary">
                          {formatCurrency(data.grossProfit.amount)}
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground">
                          Gross Margin: {data.grossProfit.marginPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BAGIAN III: BEBAN OPERASIONAL (OPEX) */}
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-between pb-2 border-b-2 border-amber-500/30">
                      <h4 className="text-sm font-black text-foreground uppercase tracking-wider">
                        {data.operationalExpenses.title}
                      </h4>
                      <span className="text-xs font-bold text-muted-foreground">
                        % terhadap Omset
                      </span>
                    </div>
                    {data.operationalExpenses.items.length === 0 ? (
                      <div className="py-4 text-center text-xs text-muted-foreground font-medium">
                        Tidak ada beban operasional pada periode ini.
                      </div>
                    ) : (
                      <div className="divide-y divide-border/20 text-xs">
                        {data.operationalExpenses.items.map((item) => {
                          const pct =
                            data.revenue.total > 0
                              ? ((item.amount / data.revenue.total) * 100).toFixed(1)
                              : "0.0";
                          return (
                            <div
                              key={item.id}
                              className="py-2.5 flex items-center justify-between hover:bg-muted/30 px-3 rounded-lg transition-colors"
                            >
                              <span className="font-semibold text-foreground">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-8">
                                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                  {formatCurrency(item.amount)}
                                </span>
                                <span className="font-mono text-muted-foreground w-12 text-right">
                                  {pct}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* Subtotal Operasional */}
                    <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 flex items-center justify-between text-xs font-black text-amber-600 dark:text-amber-400">
                      <span className="uppercase tracking-wide">
                        Total Beban Operasional (OPEX)
                      </span>
                      <div className="flex items-center gap-8">
                        <span className="text-sm">
                          {formatCurrency(data.operationalExpenses.total)}
                        </span>
                        <span className="w-12 text-right">
                          {data.revenue.total > 0
                            ? `${((data.operationalExpenses.total / data.revenue.total) * 100).toFixed(1)}%`
                            : "0.0%"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* GRAND SUMMARY: LABA BERSIH (NET PROFIT) */}
                  <div
                    className={`border-2 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 ${
                      data.netProfit.isProfit
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : "bg-rose-500/10 border-rose-500/40"
                    }`}
                  >
                    <div className="space-y-1 text-center sm:text-left">
                      <span
                        className={`text-xs font-black uppercase tracking-widest ${
                          data.netProfit.isProfit
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        Laba Bersih Operasional (Net Profit)
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black text-foreground">
                        {data.netProfit.isProfit ? "Surplus Keuntungan Bersih" : "Defisit Rugi Operasional"}
                      </h4>
                      <p className="text-xs text-muted-foreground font-medium">
                        Hasil akhir setelah seluruh biaya produksi bahan dan operasional workshop dibayarkan
                      </p>
                    </div>
                    <div className="text-center sm:text-right space-y-1">
                      <div
                        className={`text-2xl sm:text-3xl font-black tracking-tight ${
                          data.netProfit.isProfit
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {formatCurrency(data.netProfit.amount)}
                      </div>
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          data.netProfit.isProfit
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                        }`}
                      >
                        Net Margin: {data.netProfit.marginPercentage}%
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Analytics & Charts View */}
      {activeTab === "analytic" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tren Laba Bersih 6 Bulan Terakhir */}
            <Card className="rounded-3xl border-border/50 shadow-sm lg:col-span-2">
              <CardHeader className="p-6 pb-0">
                <h3 className="text-base font-black text-foreground">
                  Tren Omset vs Beban vs Laba Bersih (6 Bulan)
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Perbandingan tren pertumbuhan omset terhadap realisasi profit bulanan
                </p>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingTrend ? (
                  <div className="h-[320px] flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : trendList.length === 0 ? (
                  <div className="h-[320px] flex items-center justify-center text-xs text-muted-foreground font-semibold">
                    Belum ada data tren laba rugi.
                  </div>
                ) : (
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={trendList}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="rgba(255,255,255,0.05)"
                        />
                        <XAxis
                          dataKey="month"
                          stroke="#888888"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `Rp ${val / 1000000}M`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(15,23,42,0.9)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                          }}
                          formatter={(value: unknown) => [
                            formatCurrency(Number(value || 0)),
                            "",
                          ]}
                        />
                        <Legend
                          iconType="circle"
                          wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="pendapatan"
                          name="Omset Penjualan"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorRev)"
                        />
                        <Area
                          type="monotone"
                          dataKey="labaBersih"
                          name="Laba Bersih"
                          stroke="#10b981"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorNet)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Donut Chart: Komposisi Omset */}
            <Card className="rounded-3xl border-border/50 shadow-sm">
              <CardHeader className="p-6 pb-0">
                <h3 className="text-base font-black text-foreground">
                  Alokasi Penggunaan Omset
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Rasio serapan omset ke HPP, operasional, dan profit
                </p>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center">
                {pieChartData.length === 0 ? (
                  <div className="h-[210px] flex items-center justify-center text-xs text-muted-foreground font-semibold">
                    Tidak ada data alokasi omset
                  </div>
                ) : (
                  <>
                    <div className="h-[210px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieChartData.map((_entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(15,23,42,0.9)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "12px",
                            }}
                            formatter={(value: unknown) => [
                              formatCurrency(Number(value || 0)),
                              "",
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full space-y-2 mt-4">
                      {pieChartData.map((item, index) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between text-xs font-semibold"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                              }}
                            />
                            <span className="text-muted-foreground">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-muted-foreground">
                              {item.percentage}%
                            </span>
                            <span className="font-bold text-foreground">
                              {formatCurrency(item.value)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart Komparasi Biaya HPP vs Operasional per Bulan */}
          <Card className="rounded-3xl border-border/50 shadow-sm">
            <CardHeader className="p-6 pb-0">
              <h3 className="text-base font-black text-foreground">
                Perbandingan HPP Bahan vs Beban Operasional Bulanan
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                Evaluasi efisiensi biaya produksi terhadap biaya overhead
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingTrend ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : trendList.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-xs text-muted-foreground font-semibold">
                  Belum ada data perbandingan bulanan.
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={trendList}
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <XAxis
                        dataKey="month"
                        stroke="#888888"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `Rp ${val / 1000000}M`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15,23,42,0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                        }}
                        formatter={(value: unknown) => [
                          formatCurrency(Number(value || 0)),
                          "",
                        ]}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }}
                      />
                      <Bar
                        dataKey="hpp"
                        name="HPP Bahan Baku"
                        fill="#ef4444"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="opex"
                        name="Beban Operasional"
                        fill="#f59e0b"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="labaBersih"
                        name="Laba Bersih"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportProfitLossPage;
