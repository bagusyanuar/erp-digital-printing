import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { FundTransferParams } from "../../applications/inputs/fund-transfer.input";
import type { FundTransferModel } from "../models/fund-transfer.model";

import type { CreateFundTransferInput } from "../../applications/inputs/fund-transfer.input";

export interface FundTransferWidgetsParams {
  startDate?: string;
  endDate?: string;
}

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
