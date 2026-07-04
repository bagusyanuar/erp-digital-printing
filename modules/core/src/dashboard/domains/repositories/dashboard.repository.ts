import type { DashboardWidgets, WeeklyRevenue } from "../models/dashboard.model";

export interface DashboardRepository {
  getWidgets(startDate?: string, endDate?: string): Promise<DashboardWidgets>;
  getWeeklyRevenue(date?: string): Promise<WeeklyRevenue>;
}
