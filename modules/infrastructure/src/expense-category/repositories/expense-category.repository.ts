import type { ExpenseCategoryParams, CreateExpenseCategoryInput } from "@core/expense-category/applications/inputs";
import type { ExpenseCategoryModel } from "@core/expense-category/domains/models";
import type { ExpenseCategoryRepository } from "@core/expense-category/domains/repositories";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { safeApiCall } from "@infrastructure/libs/error";
import {
  mapExpenseCategoryParamToQuery,
  mapExpenseCategoryResponseToModel,
  mapCreateExpenseCategoryInputToRequest,
} from "../mappers";
import type { HttpClient } from "@erp-digital-printing/http";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import type { ExpenseCategoryResponse } from "../schemas";

export class ApiExpenseCategoryRepository implements ExpenseCategoryRepository {
  constructor(private readonly http: HttpClient) {}

  async getExpenseCategories(
    params: ExpenseCategoryParams,
  ): Promise<PaginatedResponse<ExpenseCategoryModel>> {
    return safeApiCall(async () => {
      const query = mapExpenseCategoryParamToQuery(params);
      const response = await this.http.get<ApiResponse<ExpenseCategoryResponse[]>>(
        "/expense-categories",
        { params: query },
      );
      return {
        data: response.data.map(mapExpenseCategoryResponseToModel),
        page: response.meta?.pagination.current_page ?? 1,
        total: response.meta?.pagination.total_items ?? 0,
        limit: response.meta?.pagination.limit ?? 10,
      };
    });
  }

  async getExpenseCategoryById(id: string): Promise<ExpenseCategoryModel> {
    return safeApiCall(async () => {
      const response = await this.http.get<ApiResponse<ExpenseCategoryResponse>>(
        `/expense-categories/${id}`,
      );
      return mapExpenseCategoryResponseToModel(response.data);
    });
  }

  async create(input: CreateExpenseCategoryInput): Promise<ExpenseCategoryModel> {
    return safeApiCall(async () => {
      const payload = mapCreateExpenseCategoryInputToRequest(input);
      const response = await this.http.post<ApiResponse<ExpenseCategoryResponse>>(
        "/expense-categories",
        payload,
      );
      return mapExpenseCategoryResponseToModel(response.data);
    });
  }

  async update(id: string, input: CreateExpenseCategoryInput): Promise<ExpenseCategoryModel> {
    return safeApiCall(async () => {
      const payload = mapCreateExpenseCategoryInputToRequest(input);
      const response = await this.http.put<ApiResponse<ExpenseCategoryResponse>>(
        `/expense-categories/${id}`,
        payload,
      );
      return mapExpenseCategoryResponseToModel(response.data);
    });
  }

  async delete(id: string): Promise<void> {
    return safeApiCall(async () => {
      await this.http.delete(`/expense-categories/${id}`);
    });
  }
}
