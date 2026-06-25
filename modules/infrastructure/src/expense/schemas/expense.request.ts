import type { PaginationQuery } from "@infrastructure/libs/api-response";

export interface CreateExpenseItemRequest {
  expense_category_id: string;
  description: string;
  amount: number;
}

export interface CreateExpensePaymentRequest {
  amount: number;
  payment_method: "cash" | "transfer";
}

export interface CreateExpenseRequest {
  invoice_number: string;
  supplier_id: string | null;
  vendor_name: string;
  description: string;
  discount: number;
  items: CreateExpenseItemRequest[];
  payments: CreateExpensePaymentRequest[];
}

export interface ExpenseQuery extends PaginationQuery {
  status?: "PAID" | "PARTIAL" | "UNPAID";
  group?: "PRODUCTION" | "OPERATIONAL";
  expense_category_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface PayExpenseRequest {
  payments: CreateExpensePaymentRequest[];
}
