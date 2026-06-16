import type { SupplierParams, CreateSupplierInput } from "@core/supplier/applications/inputs";
import type { SupplierModel } from "@core/supplier/domains/models";
import type { SupplierRepository } from "@core/supplier/domains/repositories";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { safeApiCall } from "@infrastructure/libs/error";
import {
  mapSupplierParamToQuery,
  mapSupplierResponseToModel,
  mapCreateInputToRequest,
} from "../mappers";
import type { HttpClient } from "@erp-digital-printing/http";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import type { SupplierResponse } from "../schemas";

export class ApiSupplierRepository implements SupplierRepository {
  constructor(private readonly http: HttpClient) {}

  async getSuppliers(
    params: SupplierParams,
  ): Promise<PaginatedResponse<SupplierModel>> {
    return safeApiCall(async () => {
      const query = mapSupplierParamToQuery(params);
      const response = await this.http.get<ApiResponse<SupplierResponse[]>>(
        "/suppliers",
        { params: query },
      );
      return {
        data: response.data.map(mapSupplierResponseToModel),
        page: response.meta?.pagination.current_page ?? 1,
        total: response.meta?.pagination.total_items ?? 0,
        limit: response.meta?.pagination.limit ?? 10,
      };
    });
  }

  async getSupplierById(id: string): Promise<SupplierModel> {
    return safeApiCall(async () => {
      const response = await this.http.get<ApiResponse<SupplierResponse>>(
        `/suppliers/${id}`,
      );
      return mapSupplierResponseToModel(response.data);
    });
  }

  async create(input: CreateSupplierInput): Promise<SupplierModel> {
    return safeApiCall(async () => {
      const payload = mapCreateInputToRequest(input);
      const response = await this.http.post<ApiResponse<SupplierResponse>>(
        "/suppliers",
        payload,
      );
      return mapSupplierResponseToModel(response.data);
    });
  }

  async update(id: string, input: CreateSupplierInput): Promise<SupplierModel> {
    return safeApiCall(async () => {
      const payload = mapCreateInputToRequest(input);
      const response = await this.http.put<ApiResponse<SupplierResponse>>(
        `/suppliers/${id}`,
        payload,
      );
      return mapSupplierResponseToModel(response.data);
    });
  }

  async delete(id: string): Promise<void> {
    return safeApiCall(async () => {
      await this.http.delete(`/suppliers/${id}`);
    });
  }
}
