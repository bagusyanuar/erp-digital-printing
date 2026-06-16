import type { PaginationQuery } from "@infrastructure/libs/api-response";

export interface ExpenseCategoryQuery extends PaginationQuery {
  search?: string;
  group?: string;
}

export interface CreateExpenseCategoryRequest {
  name: string;
  group: "OPERATIONAL" | "PRODUCTION";
  product_category_id: string | null;
}
