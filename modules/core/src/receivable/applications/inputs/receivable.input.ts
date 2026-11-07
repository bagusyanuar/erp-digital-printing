import type { PaginationParams } from "@core/shared/api/pagination";

export type ReceivableTabType = "ACTIVE" | "HISTORY";

export type CustomerReceivableStatusFilter = "ALL" | "OVERDUE" | "PARTIAL" | "UNPAID";

export interface CustomerReceivableParams extends PaginationParams {
  tab: ReceivableTabType;
  search?: string;
  status?: CustomerReceivableStatusFilter;
  startDate?: string;
  endDate?: string;
}

export interface SettledReceivableParams extends PaginationParams {
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaymentSplitItem {
  paymentMethod: "cash" | "transfer" | "qris";
  amount: number;
}

export interface PayCustomerInvoiceInput {
  customerId: string;
  invoiceId: string;
  payments: PaymentSplitItem[];
  cashierName?: string;
}
