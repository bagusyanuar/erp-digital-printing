import type { CategoryParams, CreateCategoryInput } from "@core/category/applications/inputs";
import type { CategoryQuery, CategoryResponse, CreateCategoryRequest } from "../schemas";
import type { CategoryModel } from "@core/category/domains/models";

export function mapCategoryParamToQuery(params: CategoryParams): CategoryQuery {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search,
    sort: params.sort,
    order: params.sortBy,
  };
}

export function mapCategoryResponseToModel(
  response: CategoryResponse,
): CategoryModel {
  return {
    id: response.id,
    name: response.name,
  };
}

export function mapCreateCategoryInputToRequest(
  input: CreateCategoryInput,
): CreateCategoryRequest {
  return {
    name: input.name,
  };
}
