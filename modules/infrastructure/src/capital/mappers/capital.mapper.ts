import type { CapitalParams, CreateCapitalInput } from "@core/capital/applications/inputs/capital.input";
import type { CapitalTransactionResponse, CreateCapitalRequest } from "../schemas/capital.request";
import type { CapitalTransactionModel } from "@core/capital/domains/models/capital.model";

export function mapCapitalParamsToQuery(params: CapitalParams) {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    type: params.type,
    search: params.search,
    start_date: params.startDate,
    end_date: params.endDate,
  };
}

export function mapCapitalResponseToModel(
  response: CapitalTransactionResponse,
): CapitalTransactionModel {
  return {
    id: response.id,
    transactionDate: response.transaction_date,
    type: response.type,
    amount: response.amount,
    paymentMethod: response.payment_method,
    description: response.description ?? "",
    createdBy: response.created_by,
    creatorName: response.creator_name,
    createdAt: response.created_at,
  };
}

export function mapCreateCapitalInputToRequest(
  input: CreateCapitalInput,
): CreateCapitalRequest {
  return {
    type: input.type,
    amount: input.amount,
    payment_method: input.paymentMethod,
    description: input.description,
  };
}
