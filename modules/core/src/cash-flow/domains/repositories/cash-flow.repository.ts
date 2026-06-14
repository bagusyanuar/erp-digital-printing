import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { CashFlowFilterInput, CreateAdjustmentInput } from "../../applications/inputs/cash-flow.input";
import type { CashFlowTransactionModel, CashFlowSummaryModel, CashAccountModel } from "../models/cash-flow.model";

export interface CashFlowRepository {
  getReport(filter: CashFlowFilterInput): Promise<PaginatedResponse<CashFlowTransactionModel>>;
  getSummary(filter: Omit<CashFlowFilterInput, "page" | "limit">): Promise<CashFlowSummaryModel>;
  createAdjustment(input: CreateAdjustmentInput): Promise<CashFlowTransactionModel>;
  getAccounts(): Promise<CashAccountModel[]>;
}
