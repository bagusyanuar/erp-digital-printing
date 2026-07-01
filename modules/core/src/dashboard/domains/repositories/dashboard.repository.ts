import type { DashboardWidgets } from "../models/dashboard.model";

export interface DashboardRepository {
  getWidgets(startDate?: string, endDate?: string): Promise<DashboardWidgets>;
}
