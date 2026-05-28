import type { ResellerParams, CreateResellerInput } from "@core/reseller/applications/inputs";
import type { ResellerModel } from "@core/reseller/domains/models";
import type { ResellerRepository } from "@core/reseller/domains/repositories";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { safeApiCall } from "@infrastructure/libs/error";
import {
  mapResellerParamToQuery,
  mapResellerResponseToModel,
  mapCreateInputToRequest,
} from "../mappers";
import type { HttpClient } from "@erp-digital-printing/http";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import type { ResellerResponse } from "../schemas";

export class ApiResellerRepository implements ResellerRepository {
  constructor(private readonly http: HttpClient) {}

  async getResellers(
    params: ResellerParams,
  ): Promise<PaginatedResponse<ResellerModel>> {
    return safeApiCall(async () => {
      const query = mapResellerParamToQuery(params);
      const response = await this.http.get<ApiResponse<ResellerResponse[]>>(
        "/resellers",
        { params: query },
      );
      return {
        data: response.data.map(mapResellerResponseToModel),
        page: response.meta?.pagination.current_page ?? 1,
        total: response.meta?.pagination.total_items ?? 0,
        limit: response.meta?.pagination.limit ?? 10,
      };
    });
  }

  async getResellerById(id: string): Promise<ResellerModel> {
    throw new Error("Method not implemented.");
  }

  async create(input: CreateResellerInput): Promise<ResellerModel> {
    return safeApiCall(async () => {
      const payload = mapCreateInputToRequest(input);
      const response = await this.http.post<ApiResponse<ResellerResponse>>(
        "/resellers",
        payload,
      );
      return mapResellerResponseToModel(response.data);
    });
  }
}
