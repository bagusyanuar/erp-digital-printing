import type { PaginationParams } from "@core/shared/api/pagination";

export interface ResellerParams extends PaginationParams {
  search?: string;
  sort?: string;
  sortBy?: string;
}
