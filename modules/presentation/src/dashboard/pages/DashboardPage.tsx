"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuTrendingUp,
  LuShoppingCart,
  LuWallet,
  LuCreditCard,
  LuArrowRight,
} from "@erp-digital-printing/ui/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  DateRangePicker,
  type DateRange,
} from "@erp-digital-printing/ui/DateRangePicker";

import { useDashboardWidgets } from "../hooks/useDashboardWidgets";
import { usePaymentSales } from "../hooks/usePaymentSales";
import { useRecentOrders } from "../hooks/useRecentOrders";
import { useWeeklyRevenue } from "../hooks/useWeeklyRevenue";

const formatDate = (date?: Date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

const formatNumber = (val: number) => {
  return new Intl.NumberFormat("id-ID").format(val);
};

export default function DashboardPage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const startDateStr = dateRange?.from ? formatDate(dateRange.from) : undefined;
  const endDateStr = dateRange?.to ? formatDate(dateRange.to) : undefined;

  const { data: widgetsData, isLoading } = useDashboardWidgets(startDateStr, endDateStr);
  const { data: paymentSalesData, isLoading: isLoadingPaymentSales } = usePaymentSales(startDateStr, endDateStr);
  const { data: recentOrdersResponse, isLoading: isLoadingRecentOrders } = useRecentOrders();
  const { data: weeklyRevenueData, isLoading: isLoadingWeeklyRevenue } = useWeeklyRevenue(startDateStr);

  const recentOrders = recentOrdersResponse?.data ?? [];

  const mappedWeeklyData = React.useMemo(() => {
    if (!weeklyRevenueData?.weekly_data) return [];
    return weeklyRevenueData.weekly_data.map((item) => {
      let name = item.day_name.slice(0, 3);
      if (item.day_name === "Monday") name = "Sen";
      else if (item.day_name === "Tuesday") name = "Sel";
      else if (item.day_name === "Wednesday") name = "Rab";
      else if (item.day_name === "Thursday") name = "Kam";
      else if (item.day_name === "Friday") name = "Jum";
      else if (item.day_name === "Saturday") name = "Sab";
      else if (item.day_name === "Sunday") name = "Min";

      return {
        name,
        revenue: item.revenue,
      };
    });
  }, [weeklyRevenueData]);

  const percentageChange = weeklyRevenueData?.percentage_change ?? 0;
  const isPositive = percentageChange >= 0;
  const changeText = `${isPositive ? "+" : ""}${percentageChange}% vs Minggu Lalu`;
  const changeClass = isPositive
    ? "text-emerald-500 bg-emerald-500/10"
    : "text-rose-500 bg-rose-500/10";

  const totalAmount = React.useMemo(() => {
    return paymentSalesData?.reduce((sum, item) => sum + item.total_amount, 0) ?? 0;
  }, [paymentSalesData]);

  const paymentDistributionData = React.useMemo(() => {
    if (!paymentSalesData || paymentSalesData.length === 0) return [];
    return paymentSalesData.map((item) => {
      const name =
        item.payment_method.charAt(0).toUpperCase() +
        item.payment_method.slice(1).toLowerCase();
      const value = totalAmount > 0 ? (item.total_amount / totalAmount) * 100 : 0;

      let color = "#cbd5e1";
      const lowerMethod = item.payment_method.toLowerCase();
      if (lowerMethod === "cash") {
        color = "#10b981";
      } else if (lowerMethod === "transfer") {
        color = "#3b82f6";
      } else if (lowerMethod === "qris") {
        color = "#eb1b33";
      }

      return {
        name,
        value,
        amount: formatCurrency(item.total_amount),
        color,
      };
    });
  }, [paymentSalesData, totalAmount]);

  const stats = [
    {
      label: "Total Omzet",
      value: isLoading ? "..." : formatCurrency(widgetsData?.totalOmzet ?? 0),
      icon: LuTrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      to: "/report/selling",
    },
    {
      label: "Total Pendapatan",
      value: isLoading ? "..." : formatCurrency(widgetsData?.totalPendapatan ?? 0),
      icon: LuWallet,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      to: "/report/cash-flow",
    },
    {
      label: "Total Pengeluaran",
      value: isLoading ? "..." : formatCurrency(widgetsData?.totalPengeluaran ?? 0),
      icon: LuCreditCard,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      to: "/report/cash-flow",
    },
    {
      label: "Volume Transaksi",
      value: isLoading ? "..." : formatNumber(widgetsData?.volumeTransaksi ?? 0),
      icon: LuShoppingCart,
      color: "text-primary",
      bg: "bg-primary/10",
      to: "/report/selling",
    },
  ];

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuLayoutDashboard className="text-primary" size={32} />
            Overview Dashboard
          </h1>
          <p className="text-muted-foreground font-medium">
            Halo Bosku, berikut adalah performa percetakan Anda hari ini.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            isClearable
            className="w-[280px]"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="block group cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border/50 p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className="text-muted-foreground/0 group-hover:text-foreground group-hover:text-muted-foreground/100 group-hover:translate-x-1 transition-all">
                  <LuArrowRight size={20} />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground tracking-wide">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-black text-foreground">
                  {stat.value}
                </h3>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-card border border-border/50 p-6 rounded-3xl space-y-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight text-foreground">
              Grafik Omzet Mingguan
            </h3>
            {!isLoadingWeeklyRevenue && (
              <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full ${changeClass}`}>
                <LuTrendingUp size={14} className={!isPositive ? "rotate-180" : ""} />
                {changeText}
              </div>
            )}
          </div>
          <div className="h-[300px] w-full relative">
            {isLoadingWeeklyRevenue ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
            ) : mappedWeeklyData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-medium">
                Tidak ada data omzet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mappedWeeklyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-primary)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(var(--foreground-rgb), 0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="currentColor"
                    className="text-muted-foreground text-[10px] font-bold"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="currentColor"
                    className="text-muted-foreground text-[10px] font-bold"
                    tickLine={false}
                    axisLine={false}
                    width={55}
                    tickFormatter={(value) => {
                      const num = Number(value);
                      if (isNaN(num)) return "";
                      if (num === 0) return "0";
                      if (num >= 1000000) {
                        return `${Number((num / 1000000).toFixed(1))}jt`;
                      }
                      if (num >= 1000) {
                        return `${Number((num / 1000).toFixed(1))}rb`;
                      }
                      return String(num);
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "16px",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                    itemStyle={{ fontWeight: "bold" }}
                    formatter={(value: unknown) => [formatCurrency(Number(value || 0)), "Omzet"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-primary)"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Payment Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border/50 p-6 rounded-3xl space-y-6 shadow-sm"
        >
          <div className="flex items-center justify-between w-full">
            <Link
              to="/report/cash-flow"
              className="flex items-center justify-between w-full text-lg font-black tracking-tight text-foreground hover:text-primary transition-colors group/title"
            >
              Distribusi Pendapatan
              <LuArrowRight className="h-5 w-5 text-muted-foreground group-hover/title:translate-x-1 group-hover/title:text-primary transition-all" />
            </Link>
          </div>
          <div className="h-[250px] w-full relative">
            {isLoadingPaymentSales ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
            ) : paymentDistributionData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-medium">
                Tidak ada data pembayaran
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {paymentDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-black text-foreground max-w-[120px] text-center truncate">
                    {formatCurrency(totalAmount)}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Total Masuk
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="space-y-3">
            {isLoadingPaymentSales ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            ) : (
              paymentDistributionData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-bold text-muted-foreground">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-black">
                    <span className="text-foreground">{item.amount}</span>
                    <span className="text-muted-foreground text-xs">
                      ({item.value.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm"
      >
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tight text-foreground">
            Order Terbaru
          </h3>
          <Link to="/invoice" className="text-sm font-bold text-primary hover:underline transition-all">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          {isLoadingRecentOrders ? (
            <div className="p-8 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm font-medium">
              Tidak ada data order terbaru
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/30 text-xs font-black uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {recentOrders.map((order) => {
                  const projectNames =
                    order.order_items?.map((item) => item.product_name).join(", ") ||
                    order.notes ||
                    "-";
                  const statusLabel =
                    order.status === "COMPLETED"
                      ? "Selesai"
                      : order.status === "READY_FOR_PICKUP"
                      ? "Siap Diambil"
                      : order.status === "IN_PRODUCTION"
                      ? "Proses"
                      : order.status;

                  const statusClass =
                    order.status === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : order.status === "READY_FOR_PICKUP"
                      ? "bg-blue-500/10 text-blue-500"
                      : order.status === "IN_PRODUCTION"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-slate-500/10 text-slate-500";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-muted/10 transition-all group"
                    >
                      <td className="px-6 py-4 font-bold text-foreground">
                        {order.invoice_number || order.job_number || order.id}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-medium">
                        {order.customer_name || "Customer Walk In"}
                      </td>
                      <td className="px-6 py-4 text-foreground font-bold max-w-[200px] truncate" title={projectNames}>
                        {projectNames}
                      </td>
                      <td className="px-6 py-4 text-foreground font-black">
                        {formatCurrency(order.grand_total)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusClass}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
