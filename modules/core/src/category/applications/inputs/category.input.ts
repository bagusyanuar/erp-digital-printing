import type { PaginationParams } from "@core/shared/api/pagination";

export interface CategoryParams extends PaginationParams {
  search?: string;
  sort?: string;
  sortBy?: string;
  is_production?: boolean | "all" | string;
}

export interface CreateCategoryInput {
  name: string;
  isProduction?: boolean;
}

export interface AssignSPKCategoryInput {
  spkCategoryId: string | null;
}

export interface ReorderCategoryInput {
  items: {
    id: string;
    sequence: number;
  }[];
}
