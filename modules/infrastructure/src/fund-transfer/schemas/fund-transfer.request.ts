export interface FundTransferResponse {
  id: string;
  transfer_date: string;
  from_account: string;
  to_account: string;
  amount: number;
  notes: string;
  cashier_name: string;
  created_at: string;
}
export interface CreateFundTransferRequest {
  from_account: string;
  to_account: string;
  amount: number;
  notes: string;
}

export interface FundTransferWidgetBreakdownResponse {
  account_name: string;
  amount: number;
}

export interface FundTransferWidgetsResponse {
  total_amount: number;
  breakdown: FundTransferWidgetBreakdownResponse[];
}
