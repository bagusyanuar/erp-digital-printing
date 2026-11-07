import type { HttpClient } from "@erp-digital-printing/http";
import type { ReceivableRepository } from "@core/receivable/domains/repositories/receivable.repository";
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
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { safeApiCall } from "@infrastructure/libs/error";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import type {
  CustomerReceivableResponse,
  SettledInvoiceReceivableResponse,
  CustomerReceivableSummaryResponse,
  OrderRepayResponse,
} from "../schemas";
import {
  mapCustomerReceivableParamsToQuery,
  mapSettledReceivableParamsToQuery,
  mapPayCustomerInvoiceToRepayRequest,
  mapCustomerReceivableResponseToModel,
  mapSettledInvoiceResponseToModel,
  mapSummaryResponseToModel,
} from "../mappers/receivable.mapper";

export class ApiReceivableRepository implements ReceivableRepository {
  constructor(private readonly http: HttpClient) {}

  async getCustomerReceivables(
    params: CustomerReceivableParams,
  ): Promise<PaginatedResponse<CustomerReceivableModel>> {
    return safeApiCall(async () => {
      const query = mapCustomerReceivableParamsToQuery(params);
      const response = await this.http.get<ApiResponse<CustomerReceivableResponse[]>>(
        "/customer-receivables",
        { params: query },
      );

      return {
        data: (response.data || []).map(mapCustomerReceivableResponseToModel),
        page: response.meta?.pagination.current_page ?? 1,
        total: response.meta?.pagination.total_items ?? 0,
        limit: response.meta?.pagination.limit ?? 10,
      };
    });
  }

  async getSettledReceivables(
    params: SettledReceivableParams,
  ): Promise<PaginatedResponse<SettledInvoiceReceivableModel>> {
    return safeApiCall(async () => {
      const query = mapSettledReceivableParamsToQuery(params);
      const response = await this.http.get<ApiResponse<SettledInvoiceReceivableResponse[]>>(
        "/customer-receivables/settled",
        { params: query },
      );

      return {
        data: (response.data || []).map(mapSettledInvoiceResponseToModel),
        page: response.meta?.pagination.current_page ?? 1,
        total: response.meta?.pagination.total_items ?? 0,
        limit: response.meta?.pagination.limit ?? 10,
      };
    });
  }

  async getCustomerReceivableSummary(): Promise<CustomerReceivableSummaryModel> {
    return safeApiCall(async () => {
      const response = await this.http.get<ApiResponse<CustomerReceivableSummaryResponse>>(
        "/customer-receivables/summary",
      );
      return mapSummaryResponseToModel(response.data);
    });
  }

  async payCustomerInvoice(
    input: PayCustomerInvoiceInput,
  ): Promise<{ customer: CustomerReceivableModel; invoice: ReceivableInvoiceItemModel }> {
    return safeApiCall(async () => {
      const payload = mapPayCustomerInvoiceToRepayRequest(input);
      const response = await this.http.post<ApiResponse<OrderRepayResponse>>(
        `/orders/${input.invoiceId}/repay`,
        payload,
      );

      const order = response.data;
      const remaining = Math.max(0, (order.grand_total ?? 0) - (order.amount_paid ?? 0));

      let payments: ReceivablePaymentModel[] = (order.order_payments || []).map((p) => {
        const method = p.payment_method?.toLowerCase();
        const paymentMethod: "cash" | "transfer" | "qris" =
          method === "transfer" ? "transfer" : method === "qris" ? "qris" : "cash";

        return {
          id: p.id,
          receivableInvoiceId: order.id,
          amount: p.amount,
          paymentMethod,
          cashierName: p.cashier_name || "Kasir",
          paymentDate: p.created_at,
        };
      });

      // Defensive fallback: If BE did not return order_payments, synthesize from input
      if (payments.length === 0 && input.payments.length > 0) {
        const now = new Date();
        const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        payments = input.payments.map((p, idx) => ({
          id: `pay-${Date.now()}-${idx}`,
          receivableInvoiceId: order.id,
          amount: p.amount,
          paymentMethod: p.paymentMethod,
          cashierName: input.cashierName || "Kasir",
          paymentDate: nowStr,
        }));
      }

      const updatedInvoice: ReceivableInvoiceItemModel = {
        id: order.id,
        invoiceNumber: order.invoice_number ?? "-",
        jobNumber: order.job_number,
        orderDate: order.created_at,
        dueDate: "-",
        daysOverdue: 0,
        isOverdue: false,
        totalAmount: order.grand_total,
        amountPaid: order.amount_paid,
        remainingAmount: remaining,
        paymentStatus: (order.payment_status as "UNPAID" | "PARTIAL" | "PAID") || (remaining === 0 ? "PAID" : "PARTIAL"),
        notes: order.notes ?? undefined,
        payments,
      };

      const updatedCustomer: CustomerReceivableModel = {
        id: input.customerId,
        customerName: order.customer_name ?? "-",
        customerPhone: order.customer_phone ?? "-",
        customerType: "RETAIL",
        totalInvoicesCount: 1,
        unpaidInvoicesCount: remaining > 0 ? 1 : 0,
        totalAmount: order.grand_total,
        totalPaid: order.amount_paid,
        totalRemaining: remaining,
        hasOverdue: false,
        maxDaysOverdue: 0,
        oldestDueDate: "-",
        invoices: [updatedInvoice],
      };

      return { customer: updatedCustomer, invoice: updatedInvoice };
    });
  }
}
