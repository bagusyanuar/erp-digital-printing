import type { PaginationParams } from "@core/shared/api/pagination";

export interface CapitalParams extends PaginationParams {
  type?: "INJECTION" | "WITHDRAWAL";
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateCapitalInput {
  type: "INJECTION" | "WITHDRAWAL";
  amount: number;
  paymentMethod: string;
  description: string;
}
