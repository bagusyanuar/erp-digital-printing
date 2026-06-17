export interface ExpenseItemModel {
  id: string;
  expenseCategoryId: string;
  description: string;
  amount: number;
  createdAt: string;
}

export interface ExpensePaymentModel {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  createdAt: string;
}

export interface ExpenseModel {
  id: string;
  invoiceNumber: string;
  supplierId: string | null;
  vendorName: string;
  description: string;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: "UNPAID" | "PARTIAL_PAID" | "PAID" | "VOID";
  items: ExpenseItemModel[];
  payments: ExpensePaymentModel[];
  createdAt: string;
}
