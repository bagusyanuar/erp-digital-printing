export interface PayablePaymentResponse {
  id: string;
  payable_expense_id: string;
  amount: number;
  payment_method: "cash" | "transfer" | "qris";
  recorded_by: string;
  payment_date: string;
  source_account?: string;
  notes?: string;
}

export interface PayableExpenseResponse {
  id: string;
  expense_number: string;
  reference_number?: string;
  category_name: string;
  expense_date: string;
  due_date: string;
  total_amount: number;
  amount_paid: number;
  remaining_amount: number;
  payment_status: "UNPAID" | "PARTIAL" | "PAID";
  notes?: string;
  payments?: PayablePaymentResponse[];
}

export interface VendorPayableResponse {
  id: string;
  vendor_name: string;
  vendor_phone: string;
  vendor_category: "SUPPLIER" | "SUBKONTRAK" | "OPERASIONAL" | "MAINTENANCE";
  total_expenses_count: number;
  unpaid_expenses_count: number;
  total_amount: number;
  total_paid: number;
  total_remaining: number;
  has_overdue?: boolean;
  max_days_overdue?: number;
  oldest_due_date?: string;
  expenses: PayableExpenseResponse[];
}

export interface SettledPayableResponse {
  id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_phone: string;
  vendor_category: string;
  expense_number: string;
  reference_number?: string;
  category_name: string;
  expense_date: string;
  settled_date: string;
  total_amount: number;
  amount_paid: number;
  payment_method: "cash" | "transfer" | "qris" | "split";
  payments: PayablePaymentResponse[];
  notes?: string;
}

export interface VendorPayableSummaryResponse {
  total_active_payable: number;
  total_overdue_payable: number;
  total_settled_payable: number;
  active_vendor_count: number;
}

