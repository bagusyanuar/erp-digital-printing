import type { PaginationParams } from "@core/shared/api/pagination";

export interface CategoryParams extends PaginationParams {
  search?: string;
  sort?: string;
  sortBy?: string;
}

export interface CreateCategoryInput {
  name: string;
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
