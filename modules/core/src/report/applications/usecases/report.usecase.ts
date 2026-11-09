import type { ProfitLossModel, ProfitLossTrendItemModel } from "../../domains/models/report.model";
import type {
  ExportSalesReportParams,
  ExportSalesReportResult,
  ProfitLossParams,
  ProfitLossTrendParams,
  ReportRepository,
} from "../../domains/repositories/report.repository";

export class GetProfitLoss {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(params?: ProfitLossParams): Promise<ProfitLossModel> {
    return await this.reportRepository.getProfitLoss(params);
  }
}

export class GetProfitLossTrend {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(params?: ProfitLossTrendParams): Promise<ProfitLossTrendItemModel[]> {
    return await this.reportRepository.getProfitLossTrend(params);
  }
}

export class ExportSalesReport {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(params?: ExportSalesReportParams): Promise<ExportSalesReportResult> {
    return await this.reportRepository.exportSalesReport(params);
  }
}

