import React, { useMemo } from "react";
import { Card } from "@erp-digital-printing/ui/Card";
import {
  LuTrendingUp,
  LuShoppingBag,
  LuFilter,
} from "@erp-digital-printing/ui/icons";
import {
  DateRangePicker,
  type DateRange,
} from "@erp-digital-printing/ui/DateRangePicker";
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

import { type TrendDataItem } from "../hooks/useReportSelling";

interface ChartDataItem {
  name: string;
  value: number;
}

interface AnalyticReportSellingProps {
  trendPeriod: "weekly" | "monthly" | "yearly";
  setTrendPeriod: (period: "weekly" | "monthly" | "yearly") => void;
  trendData: TrendDataItem[];
  categoriesData: ChartDataItem[];
  paymentsData: ChartDataItem[];
  customerTypesData: ChartDataItem[];
  formatCurrency: (value: number) => string;
  colors: string[];
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

export const AnalyticReportSelling: React.FC<AnalyticReportSellingProps> = ({
  trendPeriod,
  setTrendPeriod,
  trendData: originalTrendData,
  categoriesData,
  paymentsData,
  formatCurrency,
  colors,
  dateRange,
  setDateRange,
}) => {
  // Gunakan data tren dari API
  const filteredTrendData = originalTrendData;
  const maxCategoryVal = useMemo(() => {
    if (!categoriesData || categoriesData.length === 0) return 0;
    return Math.max(...categoriesData.map((d) => d.value));
  }, [categoriesData]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Revenue Trend Chart */}
      <Card className="rounded-3xl border-border/50 shadow-sm p-6 bg-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <LuTrendingUp className="text-primary" />
              Tren Pendapatan (Omset)
            </h3>
            <p className="text-xs text-muted-foreground">
              Perkembangan total nilai pesanan (omset) penjualan.
            </p>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Period Switch Tabs */}
            <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border/30 self-start sm:self-center">
              {(["weekly", "monthly", "yearly"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTrendPeriod(period)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                    trendPeriod === period
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {period === "weekly"
                    ? "Mingguan"
                    : period === "monthly"
                      ? "Bulanan"
                      : "Tahunan"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto pb-2">
          <div
            className="h-[360px]"
            style={{
              minWidth: "100%",
              width:
                filteredTrendData.length > 8
                  ? `${filteredTrendData.length * 85}px`
                  : "100%",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredTrendData}>
                <defs>
                  <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-primary, #3b82f6)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-primary, #3b82f6)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(156,163,175,0.15)"
                />
                <XAxis
                  dataKey="name"
                  stroke="currentColor"
                  className="text-muted-foreground text-xs"
                  tickLine={false}
                />
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
                    color: "var(--color-foreground, #1f2937)",
                  }}
                  itemStyle={{ color: "var(--color-foreground, #1f2937)" }}
                  labelStyle={{ color: "var(--color-foreground, #1f2937)" }}
                  formatter={(value: unknown) => [
                    formatCurrency(Number(value || 0)),
                    "",
                  ]}
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
                  dot={{ r: 4, strokeWidth: 1 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Filter Row for Categories & Payment Methods */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-card border border-border/40 rounded-3xl shadow-sm">
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <LuFilter className="text-primary" size={16} />
            Filter Data Analisis
          </h4>
          <p className="text-xs text-muted-foreground">
            Mengontrol rentang data Kategori Terlaris dan Metode Pembayaran di
            bawah ini.
          </p>
        </div>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          isClearable
          className="w-full sm:w-[260px] h-10 rounded-xl"
        />
      </div>

      {/* Grid for product distribution and demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products Category Performance */}
        <Card className="lg:col-span-2 rounded-3xl border-border/50 shadow-sm p-6 bg-card">
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
              <BarChart data={categoriesData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="rgba(156,163,175,0.15)"
                />
                <XAxis
                  type="number"
                  stroke="currentColor"
                  className="text-muted-foreground text-xs"
                  tickLine={false}
                  domain={[0, maxCategoryVal === 0 ? 1000000 : "auto"]}
                  tickFormatter={(v) => {
                    if (v === 0) return "Rp 0";
                    if (v >= 1000000) {
                      return `Rp ${(v / 1000000).toFixed(1).replace(/\.0$/, "")} Jt`;
                    }
                    if (v >= 1000) {
                      return `Rp ${(v / 1000).toFixed(0)} Rb`;
                    }
                    return `Rp ${v}`;
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="currentColor"
                  className="text-foreground text-xs font-medium"
                  tickLine={false}
                  width={130}
                />
                <Tooltip
                  cursor={{ fill: "rgba(156, 163, 175, 0.05)" }}
                  contentStyle={{
                    backgroundColor: "var(--color-card, #fff)",
                    borderColor: "rgba(156,163,175,0.2)",
                    borderRadius: "12px",
                    color: "var(--color-foreground, #1f2937)",
                  }}
                  itemStyle={{ color: "var(--color-foreground, #1f2937)" }}
                  labelStyle={{ color: "var(--color-foreground, #1f2937)" }}
                  formatter={(value: unknown) => [
                    formatCurrency(Number(value || 0)),
                    "Omset",
                  ]}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {categoriesData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment Methods Chart */}
        <Card className="lg:col-span-1 rounded-3xl border-border/50 shadow-sm p-6 bg-card flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <h3 className="text-md font-bold text-foreground">
              Metode Pembayaran
            </h3>
            <p className="text-xs text-muted-foreground">
              Rasio penggunaan channel pembayaran.
            </p>
          </div>
          <div className="h-[200px] w-full relative flex items-center justify-center">
            {paymentsData.some((p) => p.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentsData.map((entry, index) => {
                      const norm = entry.name.toLowerCase();
                      const fillStyle = norm.includes("transfer")
                        ? "var(--color-primary, #3b82f6)"
                        : norm.includes("qris")
                          ? "#a855f7"
                          : norm.includes("tunai") || norm.includes("cash")
                            ? "#10b981"
                            : colors[index % colors.length];
                      return <Cell key={`cell-${index}`} fill={fillStyle} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card, #fff)",
                      borderColor: "rgba(156,163,175,0.2)",
                      borderRadius: "12px",
                      color: "var(--color-foreground, #1f2937)",
                    }}
                    itemStyle={{ color: "var(--color-foreground, #1f2937)" }}
                    labelStyle={{ color: "var(--color-foreground, #1f2937)" }}
                    formatter={(value: unknown) => [
                      formatCurrency(Number(value || 0)),
                      "Total",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4 border border-dashed border-border/60 rounded-2xl h-full w-full bg-muted/10">
                <span className="text-xs text-muted-foreground font-semibold">
                  Tidak ada transaksi dalam periode ini
                </span>
              </div>
            )}
          </div>
          <div className="space-y-2 mt-4">
            {paymentsData.map((item, idx) => {
              const norm = item.name.toLowerCase();
              const badgeColor = norm.includes("transfer")
                ? "var(--color-primary, #3b82f6)"
                : norm.includes("qris")
                  ? "#a855f7"
                  : norm.includes("tunai") || norm.includes("cash")
                    ? "#10b981"
                    : colors[idx % colors.length];
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: badgeColor,
                      }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-foreground">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticReportSelling;
