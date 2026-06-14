import type { CashFlowRepository } from "../../domains/repositories/cash-flow.repository";
import type { CashFlowFilterInput, CreateAdjustmentInput } from "../inputs/cash-flow.input";
import type { CashFlowTransactionModel, CashFlowSummaryModel, CashAccountModel } from "../../domains/models/cash-flow.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export class GetCashFlowReport {
  constructor(private readonly repository: CashFlowRepository) {}
  async execute(filter: CashFlowFilterInput): Promise<PaginatedResponse<CashFlowTransactionModel>> {
    return await this.repository.getReport(filter);
  }
}

export class GetCashFlowSummary {
  constructor(private readonly repository: CashFlowRepository) {}
  async execute(filter: Omit<CashFlowFilterInput, "page" | "limit">): Promise<CashFlowSummaryModel> {
    return await this.repository.getSummary(filter);
  }
}

export class CreateCashFlowAdjustment {
  constructor(private readonly repository: CashFlowRepository) {}
  async execute(input: CreateAdjustmentInput): Promise<CashFlowTransactionModel> {
    return await this.repository.createAdjustment(input);
  }
}

export class GetCashAccounts {
  constructor(private readonly repository: CashFlowRepository) {}
  async execute(): Promise<CashAccountModel[]> {
    return await this.repository.getAccounts();
  }
}
