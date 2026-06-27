import type { PaginationParams } from "@core/shared/api/pagination";

export interface FundTransferParams extends PaginationParams {
  startDate?: string;
  endDate?: string;
}
export interface CreateFundTransferInput {
  fromAccount: string;
  toAccount: string;
  amount: number;
  notes: string;
}
