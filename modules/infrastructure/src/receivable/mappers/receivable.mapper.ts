import type {
  CustomerReceivableModel,
  ReceivableInvoiceItemModel,
  ReceivablePaymentModel,
  SettledInvoiceReceivableModel,
  CustomerReceivableSummaryModel,
} from "@core/receivable/domains/models/receivable.model";
import type {
  CustomerReceivableParams,
  SettledReceivableParams,
  PayCustomerInvoiceInput,
} from "@core/receivable/applications/inputs/receivable.input";
import type {
  CustomerReceivableResponse,
  ReceivableInvoiceItemResponse,
  ReceivablePaymentItemResponse,
  SettledInvoiceReceivableResponse,
  CustomerReceivableSummaryResponse,
  CustomerReceivableQuery,
  SettledReceivableQuery,
  OrderRepayRequest,
} from "../schemas";

export function mapCustomerReceivableParamsToQuery(
  params: CustomerReceivableParams,
): CustomerReceivableQuery {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search?.trim() || undefined,
    status: params.status && params.status !== "ALL" ? params.status : undefined,
    start_date: params.startDate,
    end_date: params.endDate,
  };
}

export function mapSettledReceivableParamsToQuery(
  params: SettledReceivableParams,
): SettledReceivableQuery {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search?.trim() || undefined,
    start_date: params.startDate,
    end_date: params.endDate,
  };
}

export function mapPayCustomerInvoiceToRepayRequest(
  input: PayCustomerInvoiceInput,
): OrderRepayRequest {
  return {
    payments: input.payments.map((p) => ({
      payment_method: p.paymentMethod,
      amount_paid: p.amount,
    })),
  };
}

export function mapPaymentItemResponseToModel(
  res: ReceivablePaymentItemResponse,
): ReceivablePaymentModel {
  const method = res.payment_method?.toLowerCase();
  const paymentMethod: "cash" | "transfer" | "qris" =
    method === "transfer" ? "transfer" : method === "qris" ? "qris" : "cash";

  return {
    id: res.id,
    receivableInvoiceId: res.receivable_invoice_id,
    amount: res.amount,
    paymentMethod,
    cashierName: res.cashier_name,
    paymentDate: res.payment_date,
  };
}

export function mapInvoiceItemResponseToModel(
  res: ReceivableInvoiceItemResponse,
): ReceivableInvoiceItemModel {
  return {
    id: res.id,
    invoiceNumber: res.invoice_number,
    jobNumber: res.job_number,
    orderDate: res.order_date,
    dueDate: "-",
    daysOverdue: 0,
    isOverdue: false,
    totalAmount: res.total_amount,
    amountPaid: res.amount_paid,
    remainingAmount: res.remaining_amount,
    paymentStatus: (res.payment_status?.toUpperCase() as "UNPAID" | "PARTIAL" | "PAID") || (res.remaining_amount === 0 ? "PAID" : "PARTIAL"),
    notes: res.notes ?? undefined,
    payments: (res.payments || []).map(mapPaymentItemResponseToModel),
  };
}

export function mapCustomerReceivableResponseToModel(
  res: CustomerReceivableResponse,
): CustomerReceivableModel {
  return {
    id: res.id,
    customerName: res.customer_name,
    customerPhone: res.customer_phone,
    customerType: res.customer_type,
    totalInvoicesCount: res.total_invoices_count,
    unpaidInvoicesCount: res.unpaid_invoices_count,
    totalAmount: res.total_amount,
    totalPaid: res.total_paid,
    totalRemaining: res.total_remaining,
    hasOverdue: false,
    maxDaysOverdue: 0,
    oldestDueDate: "-",
    invoices: (res.invoices || []).map(mapInvoiceItemResponseToModel),
  };
}

export function mapSettledInvoiceResponseToModel(
  res: SettledInvoiceReceivableResponse,
): SettledInvoiceReceivableModel {
  const method = res.payment_method?.toLowerCase();
  const paymentMethod: "cash" | "transfer" | "qris" | "split" =
    method === "transfer"
      ? "transfer"
      : method === "qris"
        ? "qris"
        : method === "split"
          ? "split"
          : "cash";

  return {
    id: res.id,
    customerId: res.customer_id,
    customerName: res.customer_name,
    customerPhone: res.customer_phone,
    customerType: res.customer_type,
    invoiceNumber: res.invoice_number,
    jobNumber: res.job_number,
    orderDate: res.order_date,
    settledDate: res.settled_date,
    totalAmount: res.total_amount,
    amountPaid: res.amount_paid,
    paymentMethod,
    payments: (res.payments || []).map(mapPaymentItemResponseToModel),
    notes: res.notes ?? undefined,
  };
}

export function mapSummaryResponseToModel(
  res: CustomerReceivableSummaryResponse,
): CustomerReceivableSummaryModel {
  return {
    totalActiveReceivable: res.total_active_receivable,
    totalOverdueReceivable: 0,
    totalSettledReceivable: res.total_settled_receivable,
    activeCustomerCount: res.active_customer_count,
  };
}
