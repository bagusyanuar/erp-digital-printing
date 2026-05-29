import type { CategoryParams, CreateCategoryInput } from "@core/category/applications/inputs";
import type { CategoryModel } from "@core/category/domains/models";
import type { CategoryRepository } from "@core/category/domains/repositories";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { safeApiCall } from "@infrastructure/libs/error";
import {
  mapCategoryParamToQuery,
  mapCategoryResponseToModel,
  mapCreateCategoryInputToRequest,
} from "../mappers";
import type { HttpClient } from "@erp-digital-printing/http";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import type { CategoryResponse } from "../schemas";

export class ApiCategoryRepository implements CategoryRepository {
  constructor(private readonly http: HttpClient) {}

  async getCategories(
    params: CategoryParams,
  ): Promise<PaginatedResponse<CategoryModel>> {
    return safeApiCall(async () => {
      const query = mapCategoryParamToQuery(params);
      const response = await this.http.get<ApiResponse<CategoryResponse[]>>(
        "/categories",
        { params: query },
      );
      return {
        data: response.data.map(mapCategoryResponseToModel),
        page: response.meta?.pagination.current_page ?? 1,
        total: response.meta?.pagination.total_items ?? 0,
        limit: response.meta?.pagination.limit ?? 10,
      };
    });
  }

  async getCategoryById(id: string): Promise<CategoryModel> {
    return safeApiCall(async () => {
      const response = await this.http.get<ApiResponse<CategoryResponse>>(
        `/categories/${id}`,
      );
      return mapCategoryResponseToModel(response.data);
    });
  }

  async create(input: CreateCategoryInput): Promise<CategoryModel> {
    return safeApiCall(async () => {
      const payload = mapCreateCategoryInputToRequest(input);
      const response = await this.http.post<ApiResponse<CategoryResponse>>(
        "/categories",
        payload,
      );
      return mapCategoryResponseToModel(response.data);
    });
  }

  async update(id: string, input: CreateCategoryInput): Promise<CategoryModel> {
    return safeApiCall(async () => {
      const payload = mapCreateCategoryInputToRequest(input);
      const response = await this.http.put<ApiResponse<CategoryResponse>>(
        `/categories/${id}`,
        payload,
      );
      return mapCategoryResponseToModel(response.data);
    });
  }

  async delete(id: string): Promise<void> {
    return safeApiCall(async () => {
      await this.http.delete(`/categories/${id}`);
    });
  }
}
