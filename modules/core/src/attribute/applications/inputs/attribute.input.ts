import type { PaginationParams } from "@core/shared/api/pagination";

export interface AttributeParams extends PaginationParams {
  search?: string;
  sort?: string;
  sortBy?: string;
}

export interface CreateAttributeInput {
  name: string;
  value_type: string;
  options?: string[];
}
