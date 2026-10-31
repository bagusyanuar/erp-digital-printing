import type { HttpClient } from "@erp-digital-printing/http";
import { GetProfitLoss, GetProfitLossTrend } from "@core/report";
import { ApiReportRepository } from "../repositories/report.repository";

export function getProfitLossUseCase(http: HttpClient): GetProfitLoss {
  const repository = new ApiReportRepository(http);
  return new GetProfitLoss(repository);
}

export function getProfitLossTrendUseCase(http: HttpClient): GetProfitLossTrend {
  const repository = new ApiReportRepository(http);
  return new GetProfitLossTrend(repository);
}
