import type { PaginationParams } from "@core/shared/api/pagination";

export interface SupplierParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateSupplierInput {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string | null;
  address?: string;
}
