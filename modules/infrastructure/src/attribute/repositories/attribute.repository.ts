import type { AttributeParams, CreateAttributeInput } from "@core/attribute/applications/inputs";
import type { AttributeModel } from "@core/attribute/domains/models";
import type { AttributeRepository } from "@core/attribute/domains/repositories";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { safeApiCall } from "@infrastructure/libs/error";
import {
  mapAttributeParamToQuery,
  mapAttributeResponseToModel,
  mapCreateAttributeInputToRequest,
} from "../mappers";
import type { HttpClient } from "@erp-digital-printing/http";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import type { AttributeResponse } from "../schemas";

export class ApiAttributeRepository implements AttributeRepository {
  constructor(private readonly http: HttpClient) {}

  async getAttributes(
    params: AttributeParams,
  ): Promise<PaginatedResponse<AttributeModel>> {
    return safeApiCall(async () => {
      const query = mapAttributeParamToQuery(params);
      const response = await this.http.get<ApiResponse<AttributeResponse[]>>(
        "/attributes",
        { params: query },
      );
      return {
        data: response.data.map(mapAttributeResponseToModel),
        page: response.meta?.pagination.current_page ?? 1,
        total: response.meta?.pagination.total_items ?? 0,
        limit: response.meta?.pagination.limit ?? 10,
      };
    });
  }

  async getAttributeById(id: string): Promise<AttributeModel> {
    return safeApiCall(async () => {
      const response = await this.http.get<ApiResponse<AttributeResponse>>(
        `/attributes/${id}`,
      );
      return mapAttributeResponseToModel(response.data);
    });
  }

  async create(input: CreateAttributeInput): Promise<AttributeModel> {
    return safeApiCall(async () => {
      const payload = mapCreateAttributeInputToRequest(input);
      const response = await this.http.post<ApiResponse<AttributeResponse>>(
        "/attributes",
        payload,
      );
      return mapAttributeResponseToModel(response.data);
    });
  }

  async update(id: string, input: CreateAttributeInput): Promise<AttributeModel> {
    return safeApiCall(async () => {
      const payload = mapCreateAttributeInputToRequest(input);
      const response = await this.http.put<ApiResponse<AttributeResponse>>(
        `/attributes/${id}`,
        payload,
      );
      return mapAttributeResponseToModel(response.data);
    });
  }

  async delete(id: string): Promise<void> {
    return safeApiCall(async () => {
      await this.http.delete(`/attributes/${id}`);
    });
  }
}
