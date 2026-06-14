export interface CashFlowTransactionResponse {
  id: string;
  transaction_date: string;
  reference_type: string;
  reference_id?: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  payment_method: string;
  description?: string;
  customer_name?: string;
  invoice_number?: string | null;
  cashier_name: string;
}

export interface CashFlowSummaryDetailResponse {
  debit: number;
  credit: number;
  balance: number;
}

export interface CashFlowSummaryResponse {
  summary: {
    total_debit: number;
    total_credit: number;
    net_balance: number;
  };
  details_by_method: Record<string, CashFlowSummaryDetailResponse>;
}

export interface CashAccountResponse {
  id: string;
  name: string;
  balance: number;
}
