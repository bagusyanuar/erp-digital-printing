import type { DashboardWidgets } from "@core/dashboard/domains/models/dashboard.model";
import type { DashboardRepository } from "@core/dashboard/domains/repositories/dashboard.repository";
import { safeApiCall } from "@infrastructure/libs/error";
import { mapDashboardWidgetsResponseToModel } from "../mappers/dashboard.mapper";
import type { HttpClient } from "@erp-digital-printing/http";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import type { DashboardWidgetsResponse } from "../schemas/dashboard.schema";

export class ApiDashboardRepository implements DashboardRepository {
  constructor(private readonly http: HttpClient) {}

  async getWidgets(startDate?: string, endDate?: string): Promise<DashboardWidgets> {
    return safeApiCall(async () => {
      const params: Record<string, string> = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await this.http.get<ApiResponse<DashboardWidgetsResponse>>(
        "/dashboard/widgets",
        { params },
      );
      return mapDashboardWidgetsResponseToModel(response.data);
    });
  }
}
