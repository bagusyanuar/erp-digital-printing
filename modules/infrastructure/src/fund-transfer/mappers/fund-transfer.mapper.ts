import type { FundTransferParams, CreateFundTransferInput, FundTransferWidgetsParams } from "@core/fund-transfer/applications/inputs/fund-transfer.input";
import type { FundTransferResponse, CreateFundTransferRequest, FundTransferWidgetsResponse } from "../schemas/fund-transfer.request";
import type { FundTransferModel } from "@core/fund-transfer/domains/models/fund-transfer.model";
import type { FundTransferWidgetsModel } from "@core/fund-transfer/domains/repositories/fund-transfer.repository";

export function mapFundTransferParamsToQuery(params: FundTransferParams) {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    start_date: params.startDate,
    end_date: params.endDate,
  };
}

export function mapFundTransferResponseToModel(
  response: FundTransferResponse,
): FundTransferModel {
  return {
    id: response.id,
    transferDate: response.transfer_date,
    fromAccount: response.from_account,
    toAccount: response.to_account,
    amount: response.amount,
    notes: response.notes,
    cashierName: response.cashier_name,
    createdAt: response.created_at,
  };
}

export function mapCreateFundTransferInputToRequest(
  input: CreateFundTransferInput,
): CreateFundTransferRequest {
  return {
    from_account: input.fromAccount,
    to_account: input.toAccount,
    amount: input.amount,
    notes: input.notes,
  };
}

export function mapFundTransferWidgetsParamsToQuery(params: FundTransferWidgetsParams) {
  return {
    start_date: params.startDate,
    end_date: params.endDate,
  };
}

export function mapFundTransferWidgetsResponseToModel(
  response: FundTransferWidgetsResponse,
): FundTransferWidgetsModel {
  return {
    totalAmount: response.total_amount,
    breakdown: (response.breakdown || []).map((item) => ({
      accountName: item.account_name,
      amount: item.amount,
    })),
  };
}

