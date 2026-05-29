import type { PaginationParams } from "@core/shared/api/pagination";

export interface CategoryParams extends PaginationParams {
  search?: string;
  sort?: string;
  sortBy?: string;
}

export interface CreateCategoryInput {
  name: string;
}
