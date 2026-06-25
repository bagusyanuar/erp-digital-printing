import type { PaginationParams } from "@core/shared/api/pagination";

export interface CreateExpenseItemInput {
  expenseCategoryId: string;
  description: string;
  amount: number;
}

export interface CreateExpensePaymentInput {
  amount: number;
  paymentMethod: "cash" | "transfer";
}

export interface CreateExpenseInput {
  invoiceNumber: string;
  supplierId: string | null;
  vendorName: string;
  description: string;
  discount: number;
  items: CreateExpenseItemInput[];
  payments: CreateExpensePaymentInput[];
}

export interface ExpenseQueryParams extends PaginationParams {
  status?: "PAID" | "PARTIAL" | "UNPAID";
  group?: "PRODUCTION" | "OPERATIONAL";
  expenseCategoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PayExpenseInput {
  payments: CreateExpensePaymentInput[];
}
