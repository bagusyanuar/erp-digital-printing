import type { HttpClient } from "@erp-digital-printing/http";
import {
  GetVendorPayables,
  GetSettledPayables,
  GetVendorPayableSummary,
  PayVendorExpense,
} from "@core/payable/applications/usecases/payable.usecase";
import { MockPayableRepository } from "../repositories/mock-payable.repository";
import { ApiPayableRepository } from "../repositories/payable.repository";

// Toggle switch: set to false to use real BE endpoints
const USE_MOCK = false;

// Fallback singleton instance for mock repository
const mockPayableRepoInstance = new MockPayableRepository();

export function getVendorPayablesUseCase(http: HttpClient): GetVendorPayables {
  const repository = USE_MOCK ? mockPayableRepoInstance : new ApiPayableRepository(http);
  return new GetVendorPayables(repository);
}

export function getSettledPayablesUseCase(http: HttpClient): GetSettledPayables {
  const repository = USE_MOCK ? mockPayableRepoInstance : new ApiPayableRepository(http);
  return new GetSettledPayables(repository);
}

export function getVendorPayableSummaryUseCase(http: HttpClient): GetVendorPayableSummary {
  const repository = USE_MOCK ? mockPayableRepoInstance : new ApiPayableRepository(http);
  return new GetVendorPayableSummary(repository);
}

export function payVendorExpenseUseCase(http: HttpClient): PayVendorExpense {
  const repository = USE_MOCK ? mockPayableRepoInstance : new ApiPayableRepository(http);
  return new PayVendorExpense(repository);
}
