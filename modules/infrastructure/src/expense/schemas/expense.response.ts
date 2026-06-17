import type { SupplierResponse } from "../../supplier/schemas";

export interface ExpenseCategoryDetailResponse {
  id: string;
  name: string;
  group: "PRODUCTION" | "OPERATIONAL";
  product_category_id: string | null;
  product_category?: {
    id: string;
    name: string;
  } | null;
}

export interface ExpenseItemResponse {
  id: string;
  expense_id: string;
  expense_category_id: string;
  expense_category?: ExpenseCategoryDetailResponse | null;
  description: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface ExpensePaymentResponse {
  id: string;
  expense_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  cashier_id: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseResponse {
  id: string;
  expense_number: string;
  invoice_number: string;
  supplier_id: string | null;
  supplier?: SupplierResponse | null;
  vendor_name: string;
  amount: number;
  discount: number;
  status: "PAID" | "PARTIAL" | "UNPAID" | "VOID";
  expense_date: string;
  description: string;
  cashier_id: string;
  items: ExpenseItemResponse[];
  payments: ExpensePaymentResponse[];
  created_at: string;
  updated_at: string;
}
