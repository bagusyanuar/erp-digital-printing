export interface CustomerReceivableQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface SettledReceivableQuery {
  page?: number;
  limit?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface OrderRepayPaymentItemRequest {
  payment_method: string;
  amount_paid: number;
}

export interface OrderRepayRequest {
  payments: OrderRepayPaymentItemRequest[];
}

