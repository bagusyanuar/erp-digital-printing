import type { ProfitLossModel, ProfitLossTrendItemModel } from "../models/report.model";

export interface ProfitLossParams {
  startDate?: string;
  endDate?: string;
}

export interface ProfitLossTrendParams {
  months?: number;
}

export interface ExportSalesReportParams {
  date?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExportSalesReportResult {
  blob: Blob;
  filename?: string;
}

export interface ReportRepository {
  getProfitLoss(params?: ProfitLossParams): Promise<ProfitLossModel>;
  getProfitLossTrend(params?: ProfitLossTrendParams): Promise<ProfitLossTrendItemModel[]>;
  exportSalesReport(params?: ExportSalesReportParams): Promise<ExportSalesReportResult>;
}

