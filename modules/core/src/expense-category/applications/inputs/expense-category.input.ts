import type { PaginationParams } from "@core/shared/api/pagination";

export interface ExpenseCategoryParams extends PaginationParams {
  search?: string;
  group?: "ALL" | "OPERATIONAL" | "PRODUCTION";
}

export interface CreateExpenseCategoryInput {
  name: string;
  group: "OPERATIONAL" | "PRODUCTION";
  productCategoryId: string | null;
}
