import type { CapitalParams, CreateCapitalInput } from "@core/capital/applications/inputs/capital.input";
import type { CapitalTransactionModel } from "@core/capital/domains/models/capital.model";
import type { CapitalRepository } from "@core/capital/domains/repositories/capital.repository";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { safeApiCall } from "@infrastructure/libs/error";
import {
  mapCapitalParamsToQuery,
  mapCapitalResponseToModel,
  mapCreateCapitalInputToRequest,
} from "../mappers/capital.mapper";
import type { HttpClient } from "@erp-digital-printing/http";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import type { CapitalTransactionResponse } from "../schemas/capital.request";

export class ApiCapitalRepository implements CapitalRepository {
  constructor(private readonly http: HttpClient) {}

  async getTransactions(
    params: CapitalParams,
  ): Promise<PaginatedResponse<CapitalTransactionModel>> {
    return safeApiCall(async () => {
      const query = mapCapitalParamsToQuery(params);
      const response = await this.http.get<ApiResponse<CapitalTransactionResponse[]>>(
        "/capital",
        { params: query },
      );
      return {
        data: response.data.map(mapCapitalResponseToModel),
        page: response.meta?.pagination.current_page ?? 1,
        total: response.meta?.pagination.total_items ?? 0,
        limit: response.meta?.pagination.limit ?? 10,
      };
    });
  }

  async createTransaction(input: CreateCapitalInput): Promise<CapitalTransactionModel> {
    return safeApiCall(async () => {
      const payload = mapCreateCapitalInputToRequest(input);
      const response = await this.http.post<ApiResponse<CapitalTransactionResponse>>(
        "/capital",
        payload,
      );
      return mapCapitalResponseToModel(response.data);
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    return safeApiCall(async () => {
      await this.http.delete(`/capital/${id}`);
    });
  }
}
