import type {
  ProfitLossModel,
  ProfitLossParams,
  ProfitLossTrendItemModel,
  ProfitLossTrendParams,
  ReportRepository,
} from "@core/report";
import type { HttpClient } from "@erp-digital-printing/http";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import { safeApiCall } from "@infrastructure/libs/error";
import {
  mapProfitLossResponseToModel,
  mapProfitLossTrendResponseToModel,
} from "../mappers/report.mapper";
import type {
  ProfitLossResponse,
  ProfitLossTrendItemResponse,
} from "../schemas/report.response";

export class ApiReportRepository implements ReportRepository {
  constructor(private readonly http: HttpClient) {}

  async getProfitLoss(params?: ProfitLossParams): Promise<ProfitLossModel> {
    return safeApiCall(async () => {
      const query: Record<string, string | undefined> = {};
      if (params?.startDate) query.start_date = params.startDate;
      if (params?.endDate) query.end_date = params.endDate;

      const response = await this.http.get<ApiResponse<ProfitLossResponse>>(
        "/reports/profit-loss",
        { params: query },
      );
      return mapProfitLossResponseToModel(response.data);
    });
  }

  async getProfitLossTrend(
    params?: ProfitLossTrendParams,
  ): Promise<ProfitLossTrendItemModel[]> {
    return safeApiCall(async () => {
      const query: Record<string, number | undefined> = {};
      if (params?.months) query.months = params.months;

      const response = await this.http.get<
        ApiResponse<ProfitLossTrendItemResponse[]>
      >("/reports/profit-loss/trend", { params: query });
      return (response.data || []).map(mapProfitLossTrendResponseToModel);
    });
  }
}
