import type { ProductParams, CreateProductInput } from "@core/product/applications/inputs";
import type { ProductModel } from "@core/product/domains/models";
import type { ProductRepository } from "@core/product/domains/repositories";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { safeApiCall } from "@infrastructure/libs/error";
import {
  mapProductParamToQuery,
  mapProductResponseToModel,
  mapCreateProductInputToRequest,
} from "../mappers";
import type { HttpClient } from "@erp-digital-printing/http";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import type { ProductResponse } from "../schemas";

export class ApiProductRepository implements ProductRepository {
  constructor(private readonly http: HttpClient) {}

  async getProducts(
    params: ProductParams,
  ): Promise<PaginatedResponse<ProductModel>> {
    return safeApiCall(async () => {
      const query = mapProductParamToQuery(params);
      const response = await this.http.get<ApiResponse<ProductResponse[]>>(
        "/products",
        { params: query },
      );
      return {
        data: (response.data ?? []).map(mapProductResponseToModel),
        page: response.meta?.pagination.current_page ?? 1,
        total: response.meta?.pagination.total_items ?? 0,
        limit: response.meta?.pagination.limit ?? 10,
      };
    });
  }

  async getProductById(id: string): Promise<ProductModel> {
    return safeApiCall(async () => {
      const response = await this.http.get<ApiResponse<ProductResponse>>(
        `/products/${id}`,
      );
      return mapProductResponseToModel(response.data);
    });
  }

  async create(input: CreateProductInput): Promise<ProductModel> {
    return safeApiCall(async () => {
      const payload = mapCreateProductInputToRequest(input);
      const response = await this.http.post<ApiResponse<ProductResponse>>(
        "/products",
        payload,
      );
      return mapProductResponseToModel(response.data);
    });
  }

  async update(id: string, input: CreateProductInput): Promise<ProductModel> {
    return safeApiCall(async () => {
      const payload = mapCreateProductInputToRequest(input);
      const response = await this.http.put<ApiResponse<ProductResponse>>(
        `/products/${id}`,
        payload,
      );
      return mapProductResponseToModel(response.data);
    });
  }

  async delete(id: string): Promise<void> {
    return safeApiCall(async () => {
      await this.http.delete(`/products/${id}`);
    });
  }
}
