import type { HttpClient } from "@erp-digital-printing/http";
import { ExportProfitLoss, ExportSalesReport, GetProfitLoss, GetProfitLossTrend } from "@core/report";
import { ApiReportRepository } from "../repositories/report.repository";

export function getProfitLossUseCase(http: HttpClient): GetProfitLoss {
  const repository = new ApiReportRepository(http);
  return new GetProfitLoss(repository);
}

export function getProfitLossTrendUseCase(http: HttpClient): GetProfitLossTrend {
  const repository = new ApiReportRepository(http);
  return new GetProfitLossTrend(repository);
}

export function exportSalesReportUseCase(http: HttpClient): ExportSalesReport {
  const repository = new ApiReportRepository(http);
  return new ExportSalesReport(repository);
}

export function exportProfitLossUseCase(http: HttpClient): ExportProfitLoss {
  const repository = new ApiReportRepository(http);
  return new ExportProfitLoss(repository);
}

