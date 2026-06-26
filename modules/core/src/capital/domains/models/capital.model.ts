export interface CapitalTransactionModel {
  id: string;
  transactionDate: string;
  type: "INJECTION" | "WITHDRAWAL";
  amount: number;
  paymentMethod: string;
  description: string;
  createdBy: string;
  creatorName: string;
  createdAt: string;
}
