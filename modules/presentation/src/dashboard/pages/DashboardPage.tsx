"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
    LuLayoutDashboard,
    LuTrendingUp,
    LuShoppingCart,
    LuUsers,
    LuClock,
    LuEllipsisVertical,
    LuPrinter,
    LuCircleCheck
} from "@erp-digital-printing/ui/icons"
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
    Cell
} from "recharts"

// Dummy Data for Revenue Chart
const revenueData = [
    { name: "Mon", revenue: 4500000 },
    { name: "Tue", revenue: 5200000 },
    { name: "Wed", revenue: 4800000 },
    { name: "Thu", revenue: 6100000 },
    { name: "Fri", revenue: 5500000 },
    { name: "Sat", revenue: 7800000 },
    { name: "Sun", revenue: 6900000 },
]

// Dummy Data for Order Status
const orderStatusData = [
    { name: "Selesai", value: 45, color: "#10b981" },
    { name: "Proses", value: 30, color: "#eb1b33" }, // Using our primary red
    { name: "Menunggu", value: 25, color: "#f59e0b" },
]

// Dummy Data for Recent Orders
const recentOrders = [
    { id: "ORD-001", customer: "Bagus Yanuar", project: "Banner HUT RI", total: "Rp 750.000", status: "Proses" },
    { id: "ORD-002", customer: "Digital Print Inc", project: "Brosur A4 1000pcs", total: "Rp 1.200.000", status: "Selesai" },
    { id: "ORD-003", customer: "Toko Berkah", project: "Stiker Vinyl", total: "Rp 350.000", status: "Menunggu" },
]

export default function DashboardPage() {
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
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border/50 text-sm font-bold text-foreground hover:bg-muted transition-all">
                        <LuClock size={18} />
                        Real-time Data
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        <LuPrinter size={18} />
                        Cetak Laporan
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Omzet", value: "Rp 40.8M", icon: LuTrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "Pesanan Masuk", value: "1,284", icon: LuShoppingCart, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Pelanggan Baru", value: "+142", icon: LuUsers, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Order Selesai", value: "98%", icon: LuCircleCheck, color: "text-purple-500", bg: "bg-purple-500/10" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-card border border-border/50 p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <button className="text-muted-foreground hover:text-foreground">
                                <LuEllipsisVertical size={20} />
                            </button>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-muted-foreground tracking-wide">{stat.label}</p>
                            <h3 className="text-2xl font-black text-foreground">{stat.value}</h3>
                        </div>
                    </motion.div>
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
                        <h3 className="text-lg font-black tracking-tight text-foreground">Grafik Omzet Mingguan</h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                            <LuTrendingUp size={14} />
                            +12.5% vs Minggu Lalu
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--foreground-rgb), 0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "rgba(var(--foreground-rgb), 0.5)", fontSize: 12, fontWeight: 600 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "rgba(var(--foreground-rgb), 0.5)", fontSize: 12, fontWeight: 600 }}
                                    tickFormatter={(value) => `${value / 1000000}jt`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--card)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "16px",
                                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
                                    }}
                                    itemStyle={{ fontWeight: "bold" }}
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
                    </div>
                </motion.div>

                {/* Status Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-border/50 p-6 rounded-3xl space-y-6 shadow-sm"
                >
                    <h3 className="text-lg font-black tracking-tight text-foreground">Status Produksi</h3>
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {orderStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-foreground">100</span>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Job</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {orderStatusData.map((status) => (
                            <div key={status.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: status.color }} />
                                    <span className="font-bold text-muted-foreground">{status.name}</span>
                                </div>
                                <span className="font-black text-foreground">{status.value}%</span>
                            </div>
                        ))}
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
                    <h3 className="text-lg font-black tracking-tight text-foreground">Order Terbaru</h3>
                    <button className="text-sm font-bold text-primary hover:underline transition-all">Lihat Semua</button>
                </div>
                <div className="overflow-x-auto">
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
                            {recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-muted/10 transition-all group">
                                    <td className="px-6 py-4 font-bold text-foreground">{order.id}</td>
                                    <td className="px-6 py-4 text-muted-foreground font-medium">{order.customer}</td>
                                    <td className="px-6 py-4 text-foreground font-bold">{order.project}</td>
                                    <td className="px-6 py-4 text-foreground font-black">{order.total}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'Selesai' ? 'bg-emerald-500/10 text-emerald-500' :
                                                order.status === 'Proses' ? 'bg-primary/10 text-primary' :
                                                    'bg-amber-500/10 text-amber-500'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}
