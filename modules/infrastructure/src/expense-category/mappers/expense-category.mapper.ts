import type { ExpenseCategoryParams, CreateExpenseCategoryInput } from "@core/expense-category/applications/inputs";
import type { ExpenseCategoryQuery, ExpenseCategoryResponse, CreateExpenseCategoryRequest } from "../schemas";
import type { ExpenseCategoryModel } from "@core/expense-category/domains/models";

export function mapExpenseCategoryParamToQuery(
  params: ExpenseCategoryParams,
): ExpenseCategoryQuery {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search,
    group: params.group === "ALL" ? undefined : params.group,
  };
}

export function mapExpenseCategoryResponseToModel(
  response: ExpenseCategoryResponse,
): ExpenseCategoryModel {
  return {
    id: response.id,
    name: response.name,
    group: response.group,
    productCategoryId: response.product_category_id,
  };
}

export function mapCreateExpenseCategoryInputToRequest(
  input: CreateExpenseCategoryInput,
): CreateExpenseCategoryRequest {
  return {
    name: input.name,
    group: input.group,
    product_category_id: input.productCategoryId,
  };
}
