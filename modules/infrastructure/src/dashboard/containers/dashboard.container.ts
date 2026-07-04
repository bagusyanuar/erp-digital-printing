import type { HttpClient } from "@erp-digital-printing/http";
import { ApiDashboardRepository } from "../repositories/dashboard.repository";
import { GetDashboardWidgets, GetWeeklyRevenue } from "@core/dashboard/applications/usecases/dashboard.usecase";

export function getDashboardWidgetsUseCase(http: HttpClient): GetDashboardWidgets {
  const repository = new ApiDashboardRepository(http);
  return new GetDashboardWidgets(repository);
}

export function getWeeklyRevenueUseCase(http: HttpClient): GetWeeklyRevenue {
  const repository = new ApiDashboardRepository(http);
  return new GetWeeklyRevenue(repository);
}
