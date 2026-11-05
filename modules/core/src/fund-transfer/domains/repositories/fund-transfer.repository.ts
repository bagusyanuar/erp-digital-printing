import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { FundTransferParams, FundTransferWidgetsParams, CreateFundTransferInput } from "../../applications/inputs/fund-transfer.input";
import type { FundTransferModel } from "../models/fund-transfer.model";

export interface FundTransferWidgetBreakdownModel {
  accountName: string;
  amount: number;
}

export interface FundTransferWidgetsModel {
  totalAmount: number;
  breakdown: FundTransferWidgetBreakdownModel[];
}

export interface FundTransferRepository {
  getFundTransfers(params: FundTransferParams): Promise<PaginatedResponse<FundTransferModel>>;
  createFundTransfer(input: CreateFundTransferInput): Promise<FundTransferModel>;
  getFundTransferWidgets(params: FundTransferWidgetsParams): Promise<FundTransferWidgetsModel>;
}
