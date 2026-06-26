import type { CapitalRepository } from "../../domains/repositories/capital.repository";
import type { CapitalTransactionModel } from "../../domains/models/capital.model";
import type { CapitalParams, CreateCapitalInput } from "../inputs/capital.input";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export class GetCapitalTransactions {
  constructor(private readonly capitalRepository: CapitalRepository) {}

  async execute(params: CapitalParams): Promise<PaginatedResponse<CapitalTransactionModel>> {
    return await this.capitalRepository.getTransactions(params);
  }
}

export class CreateCapitalTransaction {
  constructor(private readonly capitalRepository: CapitalRepository) {}

  async execute(input: CreateCapitalInput): Promise<CapitalTransactionModel> {
    return await this.capitalRepository.createTransaction(input);
  }
}

export class DeleteCapitalTransaction {
  constructor(private readonly capitalRepository: CapitalRepository) {}

  async execute(id: string): Promise<void> {
    await this.capitalRepository.deleteTransaction(id);
  }
}
