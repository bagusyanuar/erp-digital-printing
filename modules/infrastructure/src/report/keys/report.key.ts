import type { ProfitLossParams, ProfitLossTrendParams } from "@core/report";

export const reportKeys = {
  all: ["reports"] as const,
  profitLoss: (params?: ProfitLossParams) => [...reportKeys.all, "profit-loss", params] as const,
  profitLossTrend: (params?: ProfitLossTrendParams) => [...reportKeys.all, "profit-loss-trend", params] as const,
};

