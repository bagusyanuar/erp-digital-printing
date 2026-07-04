import { useQuery } from "@tanstack/react-query";
import { useDashboardDI } from "./useDashboardDI";
import type { WeeklyRevenue } from "@core/dashboard/domains/models/dashboard.model";
import type { AppError } from "@core/shared/errors/domain.error";

export const useWeeklyRevenue = (date?: string) => {
  const { getWeeklyRevenueUseCase } = useDashboardDI();

  return useQuery<WeeklyRevenue, AppError>({
    queryKey: ["dashboard", "weekly-revenue", { date }],
    queryFn: () => getWeeklyRevenueUseCase.execute(date),
    staleTime: 10_000,
    gcTime: 30_000,
    refetchOnWindowFocus: false,
  });
};
