import type { PaginationParams } from "@core/shared/api/pagination";

export interface CashFlowFilterInput extends PaginationParams {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  paymentMethod?: string;
  type?: "DEBIT" | "CREDIT";
  referenceType?: string;
  cashierId?: string;
  search?: string;
}

export interface CreateAdjustmentInput {
  amount: number;
  type: "DEBIT" | "CREDIT";
  paymentMethod: string;
  description: string;
}
