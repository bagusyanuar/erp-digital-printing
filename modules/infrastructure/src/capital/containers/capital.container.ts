import { type HttpClient } from "@erp-digital-printing/http";
import { GetCapitalTransactions, CreateCapitalTransaction, DeleteCapitalTransaction } from "@core/capital/applications/usecases/capital.usecase";
import { ApiCapitalRepository } from "../repositories/capital.repository";

export function getCapitalTransactionsUseCase(http: HttpClient): GetCapitalTransactions {
  const repository = new ApiCapitalRepository(http);
  return new GetCapitalTransactions(repository);
}

export function createCapitalTransactionUseCase(http: HttpClient): CreateCapitalTransaction {
  const repository = new ApiCapitalRepository(http);
  return new CreateCapitalTransaction(repository);
}

export function deleteCapitalTransactionUseCase(http: HttpClient): DeleteCapitalTransaction {
  const repository = new ApiCapitalRepository(http);
  return new DeleteCapitalTransaction(repository);
}
