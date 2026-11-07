import type {
  VendorPayableParams,
  SettledPayableParams,
  PayVendorExpenseInput,
} from "@core/payable/applications/inputs/payable.input";
import type {
  VendorPayableModel,
  PayableExpenseItemModel,
  PayablePaymentModel,
  SettledExpensePayableModel,
  VendorPayableSummaryModel,
} from "@core/payable/domains/models/payable.model";
import type {
  VendorPayableQueryRequest,
  SettledPayableQueryRequest,
  PayExpenseRequest,
  VendorPayableResponse,
  PayableExpenseResponse,
  PayablePaymentResponse,
  SettledPayableResponse,
  VendorPayableSummaryResponse,
} from "../schemas";

function calculateDaysOverdue(dueDateStr: string): { days: number; isOverdue: boolean } {
  if (!dueDateStr) return { days: 0, isOverdue: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return { days: 0, isOverdue: false };
  due.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return { days: diffDays, isOverdue: true };
  }
  return { days: 0, isOverdue: false };
}

export function mapVendorPayableParamsToQuery(
  params: VendorPayableParams,
): VendorPayableQueryRequest {
  return {
    page: params.page,
    limit: params.limit,
    search: params.search,
    tab: params.tab,
    status: params.status !== "ALL" ? params.status : undefined,
    start_date: params.startDate,
    end_date: params.endDate,
  };
}

export function mapSettledPayableParamsToQuery(
  params: SettledPayableParams,
): SettledPayableQueryRequest {
  return {
    page: params.page,
    limit: params.limit,
    search: params.search,
    start_date: params.startDate,
    end_date: params.endDate,
  };
}

export function mapPayVendorExpenseToRequest(
  input: PayVendorExpenseInput,
): PayExpenseRequest {
  return {
    payments: input.payments.map((p) => ({
      payment_method: p.paymentMethod,
      amount: p.amount,
      source_account: p.sourceAccount,
    })),
    recorded_by: input.recordedBy,
    notes: input.notes,
  };
}

export function mapPayablePaymentResponseToModel(
  res: PayablePaymentResponse,
): PayablePaymentModel {
  const method = res.payment_method?.toLowerCase();
  const paymentMethod: "cash" | "transfer" | "qris" =
    method === "transfer" ? "transfer" : method === "qris" ? "qris" : "cash";

  return {
    id: res.id,
    payableExpenseId: res.payable_expense_id,
    amount: res.amount,
    paymentMethod,
    recordedBy: res.recorded_by || "Finance",
    paymentDate: res.payment_date,
    sourceAccount: res.source_account,
    notes: res.notes,
  };
}

export function mapPayableExpenseResponseToModel(
  res: PayableExpenseResponse,
): PayableExpenseItemModel {
  const { days, isOverdue } = calculateDaysOverdue(res.due_date || "");

  return {
    id: res.id,
    expenseNumber: res.expense_number,
    referenceNumber: res.reference_number,
    categoryName: res.category_name || "Pengeluaran",
    expenseDate: res.expense_date,
    dueDate: res.due_date || "-",
    daysOverdue: days,
    isOverdue,
    totalAmount: res.total_amount,
    amountPaid: res.amount_paid,
    remainingAmount: res.remaining_amount,
    paymentStatus: res.payment_status,
    notes: res.notes,
    payments: (res.payments || []).map(mapPayablePaymentResponseToModel),
  };
}

export function mapVendorPayableResponseToModel(
  res: VendorPayableResponse,
): VendorPayableModel {
  const expenses = (res.expenses || []).map(mapPayableExpenseResponseToModel);
  const hasOverdue = expenses.some((e) => e.isOverdue && e.remainingAmount > 0);
  const maxDaysOverdue = Math.max(
    0,
    ...expenses.filter((e) => e.remainingAmount > 0).map((e) => e.daysOverdue),
  );

  return {
    id: res.id,
    vendorName: res.vendor_name,
    vendorPhone: res.vendor_phone,
    vendorCategory: (res.vendor_category as "SUPPLIER" | "SUBKONTRAK" | "OPERASIONAL" | "MAINTENANCE") || "SUPPLIER",
    totalExpensesCount: res.total_expenses_count,
    unpaidExpensesCount: res.unpaid_expenses_count,
    totalAmount: res.total_amount,
    totalPaid: res.total_paid,
    totalRemaining: res.total_remaining,
    hasOverdue: res.has_overdue ?? hasOverdue,
    maxDaysOverdue: res.max_days_overdue ?? maxDaysOverdue,
    oldestDueDate: res.oldest_due_date,
    expenses,
  };
}

export function mapSettledExpenseResponseToModel(
  res: SettledPayableResponse,
): SettledExpensePayableModel {
  return {
    id: res.id,
    vendorId: res.vendor_id,
    vendorName: res.vendor_name,
    vendorPhone: res.vendor_phone,
    vendorCategory: res.vendor_category || "SUPPLIER",
    expenseNumber: res.expense_number,
    referenceNumber: res.reference_number,
    categoryName: res.category_name || "Pengeluaran",
    expenseDate: res.expense_date,
    settledDate: res.settled_date,
    totalAmount: res.total_amount,
    amountPaid: res.amount_paid,
    paymentMethod: res.payment_method,
    payments: (res.payments || []).map(mapPayablePaymentResponseToModel),
    notes: res.notes,
  };
}

export function mapSummaryResponseToModel(
  res: VendorPayableSummaryResponse,
): VendorPayableSummaryModel {
  return {
    totalActivePayable: res.total_active_payable ?? 0,
    totalOverduePayable: res.total_overdue_payable ?? 0,
    totalSettledPayable: res.total_settled_payable ?? 0,
    activeVendorCount: res.active_vendor_count ?? 0,
  };
}
