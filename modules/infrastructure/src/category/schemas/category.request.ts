import type { PaginationQuery } from "@infrastructure/libs/api-response";

export interface CategoryQuery extends PaginationQuery {
  search?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface CreateCategoryRequest {
  name: string;
}
