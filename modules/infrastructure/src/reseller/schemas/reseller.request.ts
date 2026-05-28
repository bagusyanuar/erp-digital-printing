import type { PaginationQuery } from "@infrastructure/libs/api-response";

export interface ResellerQuery extends PaginationQuery {
  search?: string;
  sort?: string;
  order?: string;
}

export interface CreateResellerRequest {
  customer_level_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  credit_limit: number;
}
