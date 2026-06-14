import { type HttpClient } from "@erp-digital-printing/http";
import { ApiCashFlowRepository } from "../repositories/cash-flow.repository";
import {
  GetCashFlowReport,
  GetCashFlowSummary,
  CreateCashFlowAdjustment,
  GetCashAccounts
} from "@core/cash-flow/applications/usecases/cash-flow.usecase";

export function getCashFlowReportUseCase(http: HttpClient) {
  return new GetCashFlowReport(new ApiCashFlowRepository(http));
}

export function getCashFlowSummaryUseCase(http: HttpClient) {
  return new GetCashFlowSummary(new ApiCashFlowRepository(http));
}

export function createCashFlowAdjustmentUseCase(http: HttpClient) {
  return new CreateCashFlowAdjustment(new ApiCashFlowRepository(http));
}

export function getCashAccountsUseCase(http: HttpClient) {
  return new GetCashAccounts(new ApiCashFlowRepository(http));
}
