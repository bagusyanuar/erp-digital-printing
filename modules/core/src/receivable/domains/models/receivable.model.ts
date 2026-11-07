export interface ReceivablePaymentModel {
  id: string;
  receivableInvoiceId: string;
  amount: number;
  paymentMethod: "cash" | "transfer" | "qris";
  cashierName: string;
  paymentDate: string;
  notes?: string;
}

export interface ReceivableInvoiceItemModel {
  id: string;
  invoiceNumber: string;
  jobNumber: string;
  orderDate: string;
  dueDate?: string;
  daysOverdue?: number;
  isOverdue?: boolean;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  notes?: string;
  payments: ReceivablePaymentModel[];
}

export interface CustomerReceivableModel {
  id: string;
  customerName: string;
  customerPhone: string;
  customerType: "RESELLER" | "RETAIL";
  totalInvoicesCount: number;
  unpaidInvoicesCount: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  hasOverdue?: boolean;
  maxDaysOverdue?: number;
  oldestDueDate?: string;
  invoices: ReceivableInvoiceItemModel[];
}

export interface SettledInvoiceReceivableModel {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerType: "RESELLER" | "RETAIL";
  invoiceNumber: string;
  jobNumber: string;
  orderDate: string;
  settledDate: string;
  totalAmount: number;
  amountPaid: number;
  paymentMethod: "cash" | "transfer" | "qris" | "split";
  payments: ReceivablePaymentModel[];
  notes?: string;
}

export interface CustomerReceivableSummaryModel {
  totalActiveReceivable: number;
  totalOverdueReceivable?: number;
  totalSettledReceivable: number;
  activeCustomerCount: number;
}
