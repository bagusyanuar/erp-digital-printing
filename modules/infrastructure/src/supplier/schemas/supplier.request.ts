import type { PaginationQuery } from "@infrastructure/libs/api-response";

export interface SupplierQuery extends PaginationQuery {
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface CreateSupplierRequest {
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
}
