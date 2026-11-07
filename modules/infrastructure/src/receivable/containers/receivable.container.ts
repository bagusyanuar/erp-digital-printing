import type { HttpClient } from "@erp-digital-printing/http";
import {
  GetCustomerReceivables,
  GetSettledReceivables,
  GetCustomerReceivableSummary,
  PayCustomerInvoice,
} from "@core/receivable/applications/usecases/receivable.usecase";
import { ApiReceivableRepository } from "../repositories/receivable.repository";

export function getCustomerReceivablesUseCase(http: HttpClient): GetCustomerReceivables {
  const repository = new ApiReceivableRepository(http);
  return new GetCustomerReceivables(repository);
}

export function getSettledReceivablesUseCase(http: HttpClient): GetSettledReceivables {
  const repository = new ApiReceivableRepository(http);
  return new GetSettledReceivables(repository);
}

export function getCustomerReceivableSummaryUseCase(http: HttpClient): GetCustomerReceivableSummary {
  const repository = new ApiReceivableRepository(http);
  return new GetCustomerReceivableSummary(repository);
}

export function payCustomerInvoiceUseCase(http: HttpClient): PayCustomerInvoice {
  const repository = new ApiReceivableRepository(http);
  return new PayCustomerInvoice(repository);
}
