import type { CategoryParams, CreateCategoryInput } from "@core/category/applications/inputs";
import type { CategoryQuery, CategoryResponse, CreateCategoryRequest } from "../schemas";
import type { CategoryModel } from "@core/category/domains/models";

export function mapCategoryParamToQuery(params: CategoryParams): CategoryQuery {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search,
    sort_by: params.sort || "sequence",
    sort_order: params.sortBy || "asc",
  };
}

export function mapCategoryResponseToModel(
  response: CategoryResponse,
): CategoryModel {
  return {
    id: response.id,
    name: response.name,
    sequence: response.sequence,
  };
}

export function mapCreateCategoryInputToRequest(
  input: CreateCategoryInput,
): CreateCategoryRequest {
  return {
    name: input.name,
  };
}
