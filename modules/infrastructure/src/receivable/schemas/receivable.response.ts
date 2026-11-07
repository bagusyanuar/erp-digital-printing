export interface ReceivablePaymentItemResponse {
  id: string;
  receivable_invoice_id: string;
  amount: number;
  payment_method: string;
  cashier_name: string;
  payment_date: string;
}

export interface ReceivableInvoiceItemResponse {
  id: string;
  invoice_number: string;
  job_number: string;
  order_date: string;
  total_amount: number;
  amount_paid: number;
  remaining_amount: number;
  payment_status: string;
  notes?: string | null;
  payments: ReceivablePaymentItemResponse[];
}

export interface CustomerReceivableResponse {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_type: "RESELLER" | "RETAIL";
  total_invoices_count: number;
  unpaid_invoices_count: number;
  total_amount: number;
  total_paid: number;
  total_remaining: number;
  invoices: ReceivableInvoiceItemResponse[];
}

export interface SettledInvoiceReceivableResponse {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_type: "RESELLER" | "RETAIL";
  invoice_number: string;
  job_number: string;
  order_date: string;
  settled_date: string;
  total_amount: number;
  amount_paid: number;
  payment_method: string;
  payments: ReceivablePaymentItemResponse[];
  notes?: string | null;
}

export interface CustomerReceivableSummaryResponse {
  total_active_receivable: number;
  total_settled_receivable: number;
  active_customer_count: number;
}

export interface OrderPaymentItemResponse {
  id: string;
  cashier_id?: string;
  cashier_name?: string;
  amount: number;
  payment_method: string;
  payment_type?: string;
  payment_number?: number;
  created_at: string;
}

export interface OrderRepayResponse {
  id: string;
  job_number: string;
  invoice_number?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  status: string;
  payment_status: string;
  grand_total: number;
  amount_paid: number;
  notes?: string | null;
  order_payments?: OrderPaymentItemResponse[];
  created_at: string;
  updated_at: string;
}

