export interface CashFlowTransactionModel {
  id: string;
  transactionDate: string;
  referenceType: string;
  referenceId?: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  paymentMethod: string;
  description?: string;
  customerName?: string;
  cashierName: string;
}

export interface CashFlowSummaryDetailModel {
  debit: number;
  credit: number;
  balance: number;
}

export interface CashFlowSummaryModel {
  summary: {
    totalDebit: number;
    totalCredit: number;
    netBalance: number;
  };
  detailsByMethod: Record<string, CashFlowSummaryDetailModel>;
}

export interface CashAccountModel {
  id: string;
  name: string;
  balance: number;
}
