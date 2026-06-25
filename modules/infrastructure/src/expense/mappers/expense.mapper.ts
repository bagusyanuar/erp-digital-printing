import type { CreateExpenseInput, CreateExpenseItemInput, CreateExpensePaymentInput, ExpenseQueryParams, PayExpenseInput } from "@core/expense/applications/inputs/expense.input";
import type { ExpenseModel, ExpenseItemModel, ExpensePaymentModel } from "@core/expense/domains/models/expense.model";
import type { CreateExpenseRequest, CreateExpenseItemRequest, CreateExpensePaymentRequest, ExpenseResponse, ExpenseItemResponse, ExpensePaymentResponse, ExpenseQuery, PayExpenseRequest } from "../schemas";

export function mapPayInputToRequest(input: PayExpenseInput): PayExpenseRequest {
  return {
    payments: input.payments.map(mapCreatePaymentInputToRequest),
  };
}

export function mapParamsToQuery(params: ExpenseQueryParams): ExpenseQuery {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    status: params.status,
    group: params.group,
    expense_category_id: params.expenseCategoryId,
    start_date: params.startDate,
    end_date: params.endDate,
    search: params.search,
  };
}

export function mapCreateInputToRequest(input: CreateExpenseInput): CreateExpenseRequest {
  return {
    invoice_number: input.invoiceNumber,
    supplier_id: input.supplierId,
    vendor_name: input.vendorName,
    description: input.description,
    discount: input.discount,
    items: input.items.map(mapCreateItemInputToRequest),
    payments: input.payments.map(mapCreatePaymentInputToRequest),
  };
}

function mapCreateItemInputToRequest(item: CreateExpenseItemInput): CreateExpenseItemRequest {
  return {
    expense_category_id: item.expenseCategoryId,
    description: item.description,
    amount: item.amount,
  };
}

function mapCreatePaymentInputToRequest(payment: CreateExpensePaymentInput): CreateExpensePaymentRequest {
  return {
    amount: payment.amount,
    payment_method: payment.paymentMethod,
  };
}

export function mapResponseToModel(response: ExpenseResponse): ExpenseModel {
  // Calculate paid amount from payments array
  const paidAmount = response.payments.reduce((sum, p) => sum + p.amount, 0);

  // Map status: BE status "PARTIAL" maps to FE status "PARTIAL_PAID"
  const paymentStatus: ExpenseModel["paymentStatus"] = 
    response.status === "PARTIAL"
      ? "PARTIAL_PAID"
      : response.status;

  return {
    id: response.id,
    invoiceNumber: response.invoice_number || response.expense_number,
    supplierId: response.supplier_id,
    vendorName: response.vendor_name,
    description: response.description,
    discount: response.discount,
    totalAmount: response.amount,
    paidAmount,
    paymentStatus,
    items: response.items.map(mapItemResponseToModel),
    payments: response.payments.map(mapPaymentResponseToModel),
    createdAt: response.expense_date || response.created_at,
  };
}

function mapItemResponseToModel(item: ExpenseItemResponse): ExpenseItemModel {
  return {
    id: item.id,
    expenseCategoryId: item.expense_category_id,
    description: item.description,
    amount: item.amount,
    createdAt: item.created_at,
  };
}

function mapPaymentResponseToModel(payment: ExpensePaymentResponse): ExpensePaymentModel {
  return {
    id: payment.id,
    amount: payment.amount,
    paymentMethod: payment.payment_method,
    paymentDate: payment.payment_date,
    createdAt: payment.created_at,
  };
}
