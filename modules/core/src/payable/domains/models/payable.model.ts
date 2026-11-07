export interface PayablePaymentModel {
  id: string;
  payableExpenseId: string;
  amount: number;
  paymentMethod: "cash" | "transfer" | "qris";
  recordedBy: string;
  paymentDate: string;
  sourceAccount?: string;
  notes?: string;
}

export interface PayableExpenseItemModel {
  id: string;
  expenseNumber: string;
  referenceNumber?: string;
  categoryName: string;
  expenseDate: string;
  dueDate: string;
  daysOverdue: number;
  isOverdue: boolean;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  notes?: string;
  payments: PayablePaymentModel[];
}

export interface VendorPayableModel {
  id: string;
  vendorName: string;
  vendorPhone: string;
  vendorCategory: "SUPPLIER" | "SUBKONTRAK" | "OPERASIONAL" | "MAINTENANCE";
  totalExpensesCount: number;
  unpaidExpensesCount: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  hasOverdue: boolean;
  maxDaysOverdue: number;
  oldestDueDate?: string;
  expenses: PayableExpenseItemModel[];
}

export interface SettledExpensePayableModel {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  vendorCategory: string;
  expenseNumber: string;
  referenceNumber?: string;
  categoryName: string;
  expenseDate: string;
  settledDate: string;
  totalAmount: number;
  amountPaid: number;
  paymentMethod: "cash" | "transfer" | "qris" | "split";
  payments: PayablePaymentModel[];
  notes?: string;
}

export interface VendorPayableSummaryModel {
  totalActivePayable: number;
  totalOverduePayable: number;
  totalSettledPayable: number;
  activeVendorCount: number;
}

