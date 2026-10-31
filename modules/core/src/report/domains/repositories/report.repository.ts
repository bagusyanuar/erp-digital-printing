import type { ProfitLossModel, ProfitLossTrendItemModel } from "../models/report.model";

export interface ProfitLossParams {
  startDate?: string;
  endDate?: string;
}

export interface ProfitLossTrendParams {
  months?: number;
}

export interface ReportRepository {
  getProfitLoss(params?: ProfitLossParams): Promise<ProfitLossModel>;
  getProfitLossTrend(params?: ProfitLossTrendParams): Promise<ProfitLossTrendItemModel[]>;
}
