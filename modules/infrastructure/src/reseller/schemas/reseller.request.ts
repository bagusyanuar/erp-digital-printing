import type { PaginationQuery } from "@infrastructure/libs/api-response";

export interface ResellerQuery extends PaginationQuery {
  search?: string;
  sort?: string;
  order?: string;
}
