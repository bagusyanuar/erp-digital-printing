import type { PaginationQuery } from "@infrastructure/libs/api-response";

export interface AttributeQuery extends PaginationQuery {
  search?: string;
  sort?: string;
  order?: string;
}

export interface CreateAttributeRequest {
  name: string;
  value_type: string;
  options?: string[];
}
