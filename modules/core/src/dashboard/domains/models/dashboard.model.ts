export interface DashboardWidgets {
  totalOmzet: number;
  totalPendapatan: number;
  totalPengeluaran: number;
  volumeTransaksi: number;
}

export interface WeeklyRevenueItem {
  date: string;
  day_name: string;
  revenue: number;
}

export interface WeeklyRevenue {
  total_this_week: number;
  total_last_week: number;
  percentage_change: number;
  weekly_data: WeeklyRevenueItem[];
}
