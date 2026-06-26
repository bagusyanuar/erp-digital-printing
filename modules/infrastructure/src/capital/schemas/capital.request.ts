export interface CreateCapitalRequest {
  type: "INJECTION" | "WITHDRAWAL";
  amount: number;
  payment_method: string;
  description: string;
}

export interface CapitalTransactionResponse {
  id: string;
  transaction_date: string;
  type: "INJECTION" | "WITHDRAWAL";
  amount: number;
  payment_method: string;
  description?: string | null;
  created_by: string;
  creator_name: string;
  created_at: string;
}
