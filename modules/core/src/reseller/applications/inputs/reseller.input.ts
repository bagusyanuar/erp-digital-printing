import type { PaginationParams } from "@core/shared/api/pagination";

export interface ResellerParams extends PaginationParams {
  search?: string;
  sort?: string;
  sortBy?: string;
}

export interface CreateResellerInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  creditLimit: number;
}
