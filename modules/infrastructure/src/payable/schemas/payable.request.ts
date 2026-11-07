export interface VendorPayableQueryRequest {
  page?: number;
  limit?: number;
  search?: string;
  tab?: "ACTIVE" | "HISTORY";
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface SettledPayableQueryRequest {
  page?: number;
  limit?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface PayExpenseItemRequest {
  payment_method: "cash" | "transfer" | "qris";
  amount: number;
  source_account?: string;
}

export interface PayExpenseRequest {
  payments: PayExpenseItemRequest[];
  recorded_by?: string;
  notes?: string;
}

