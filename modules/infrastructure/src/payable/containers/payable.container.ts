import type { HttpClient } from "@erp-digital-printing/http";
import {
  GetVendorPayables,
  GetSettledPayables,
  GetVendorPayableSummary,
  PayVendorExpense,
} from "@core/payable/applications/usecases/payable.usecase";
import { MockPayableRepository } from "../repositories/mock-payable.repository";
import { ApiPayableRepository } from "../repositories/payable.repository";

// Singleton instance for mock repository to retain mutations during the session
const mockPayableRepoInstance = new MockPayableRepository();

// Toggle switch: set to false to switch to real API when BE endpoints are deployed
const USE_MOCK = true;

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

