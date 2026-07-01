import { useQuery } from "@tanstack/react-query";
import { useDashboardDI } from "./useDashboardDI";

export const useDashboardWidgets = (startDate?: string, endDate?: string) => {
  const { getDashboardWidgetsUseCase } = useDashboardDI();

  return useQuery({
    queryKey: ["dashboard", "widgets", { startDate, endDate }],
    queryFn: () => getDashboardWidgetsUseCase.execute(startDate, endDate),
    staleTime: 10_000,
    gcTime: 30_000,
    refetchOnWindowFocus: false,
  });
};
