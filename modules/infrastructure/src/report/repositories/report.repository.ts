import type {
  ExportProfitLossParams,
  ExportProfitLossResult,
  ExportSalesReportParams,
  ExportSalesReportResult,
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

  async exportSalesReport(
    params?: ExportSalesReportParams,
  ): Promise<ExportSalesReportResult> {
    return safeApiCall(async () => {
      const query: Record<string, string | undefined> = {};
      if (params?.date) query.date = params.date;
      if (params?.startDate) query.start_date = params.startDate;
      if (params?.endDate) query.end_date = params.endDate;

      const response = await this.http.getInstance().get<Blob>(
        "/reports/sales/export",
        {
          params: query,
          responseType: "blob",
        },
      );

      const disposition = response.headers["content-disposition"] as
        | string
        | undefined;
      let filename: string | undefined;
      if (disposition) {
        const match = disposition.match(
          /filename=(?:["']?)(.*?)(?:["']?)(?:;|$)/,
        );
        if (match?.[1]) {
          filename = match[1];
        }
      }

      return {
        blob: response.data,
        filename,
      };
    });
  }

  async exportProfitLoss(
    params?: ExportProfitLossParams,
  ): Promise<ExportProfitLossResult> {
    return safeApiCall(async () => {
      const query: Record<string, string | undefined> = {};
      if (params?.date) query.date = params.date;
      if (params?.startDate) query.start_date = params.startDate;
      if (params?.endDate) query.end_date = params.endDate;

      const response = await this.http.getInstance().get<Blob>(
        "/reports/profit-loss/export",
        {
          params: query,
          responseType: "blob",
        },
      );

      const disposition = response.headers["content-disposition"] as
        | string
        | undefined;
      let filename: string | undefined;
      if (disposition) {
        const match = disposition.match(
          /filename=(?:["']?)(.*?)(?:["']?)(?:;|$)/,
        );
        if (match?.[1]) {
          filename = match[1];
        }
      }

      return {
        blob: response.data,
        filename,
      };
    });
  }
}

