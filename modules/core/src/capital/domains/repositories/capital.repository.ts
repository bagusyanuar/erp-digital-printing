import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { CapitalParams, CreateCapitalInput } from "../../applications/inputs";
import type { CapitalTransactionModel } from "../models/capital.model";

export interface CapitalRepository {
  getTransactions(params: CapitalParams): Promise<PaginatedResponse<CapitalTransactionModel>>;
  createTransaction(input: CreateCapitalInput): Promise<CapitalTransactionModel>;
  deleteTransaction(id: string): Promise<void>;
}
