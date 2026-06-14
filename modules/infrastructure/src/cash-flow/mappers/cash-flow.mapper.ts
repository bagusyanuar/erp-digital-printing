import type { CashFlowFilterInput } from "@core/cash-flow/applications/inputs/cash-flow.input";
import type { CashFlowTransactionResponse, CashFlowSummaryResponse, CashAccountResponse } from "../schemas/cash-flow.schema";
import type { CashFlowTransactionModel, CashFlowSummaryModel, CashAccountModel } from "@core/cash-flow/domains/models/cash-flow.model";

export function mapFilterToQuery(filter: CashFlowFilterInput) {
  return {
    start_date: filter.startDate,
    end_date: filter.endDate,
    page: filter.page,
    limit: filter.limit,
    payment_method: filter.paymentMethod || undefined,
    type: filter.type || undefined,
    reference_type: filter.referenceType || undefined,
    cashier_id: filter.cashierId || undefined,
    search: filter.search || undefined,
  };
}

export function mapTransactionResponseToModel(res: CashFlowTransactionResponse): CashFlowTransactionModel {
  return {
    id: res.id,
    transactionDate: res.transaction_date,
    referenceType: res.reference_type,
    referenceId: res.reference_id,
    type: res.type,
    amount: Number(res.amount),
    paymentMethod: res.payment_method,
    description: res.description,
    customerName: res.customer_name,
    invoiceNumber: res.invoice_number,
    cashierName: res.cashier_name,
  };
}

export function mapSummaryResponseToModel(res: CashFlowSummaryResponse): CashFlowSummaryModel {
  const detailsByMethod: Record<string, { debit: number; credit: number; balance: number }> = {};
  if (res.details_by_method) {
    for (const [key, val] of Object.entries(res.details_by_method)) {
      detailsByMethod[key] = {
        debit: Number(val.debit),
        credit: Number(val.credit),
        balance: Number(val.balance),
      };
    }
  }
  return {
    summary: {
      totalDebit: Number(res.summary.total_debit),
      totalCredit: Number(res.summary.total_credit),
      netBalance: Number(res.summary.net_balance),
    },
    detailsByMethod,
  };
}

export function mapAccountResponseToModel(res: CashAccountResponse): CashAccountModel {
  return {
    id: res.id,
    name: res.name,
    balance: Number(res.balance),
  };
}
