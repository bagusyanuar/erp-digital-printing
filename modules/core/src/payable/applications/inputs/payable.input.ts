import type { PaginationParams } from "@core/shared/api/pagination";

export type PayableTabType = "ACTIVE" | "HISTORY";

export type VendorPayableStatusFilter = "ALL" | "OVERDUE" | "PARTIAL" | "UNPAID";

export interface VendorPayableParams extends PaginationParams {
  tab: PayableTabType;
  search?: string;
  status?: VendorPayableStatusFilter;
  startDate?: string;
  endDate?: string;
}

export interface SettledPayableParams extends PaginationParams {
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface PayablePaymentSplitItem {
  paymentMethod: "cash" | "transfer" | "qris";
  amount: number;
  sourceAccount?: string;
}

export interface PayVendorExpenseInput {
  vendorId: string;
  expenseId: string;
  payments: PayablePaymentSplitItem[];
  recordedBy?: string;
  notes?: string;
}

