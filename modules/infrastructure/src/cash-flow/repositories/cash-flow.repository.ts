import type { HttpClient } from "@erp-digital-printing/http";
import type { CashFlowRepository } from "@core/cash-flow/domains/repositories/cash-flow.repository";
import type { CashFlowFilterInput, CreateAdjustmentInput } from "@core/cash-flow/applications/inputs/cash-flow.input";
import type { CashFlowTransactionModel, CashFlowSummaryModel, CashAccountModel } from "@core/cash-flow/domains/models/cash-flow.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { ApiResponse } from "../../libs/api-response";
import { safeApiCall } from "../../libs/error";
import type { CashFlowTransactionResponse, CashFlowSummaryResponse, CashAccountResponse } from "../schemas/cash-flow.schema";
import { mapFilterToQuery, mapTransactionResponseToModel, mapSummaryResponseToModel, mapAccountResponseToModel } from "../mappers/cash-flow.mapper";

export class ApiCashFlowRepository implements CashFlowRepository {
  constructor(private readonly http: HttpClient) {}

  async getReport(filter: CashFlowFilterInput): Promise<PaginatedResponse<CashFlowTransactionModel>> {
    return safeApiCall(async () => {
      const response = await this.http.get<ApiResponse<CashFlowTransactionResponse[]>>(
        "/reports/cash-flow",
        { params: mapFilterToQuery(filter) }
      );
      return {
        data: response.data.map(mapTransactionResponseToModel),
        page: response.meta?.pagination.current_page ?? 1,
        limit: response.meta?.pagination.limit ?? 10,
        total: response.meta?.pagination.total_items ?? 0,
      };
    });
  }

  async getSummary(filter: Omit<CashFlowFilterInput, "page" | "limit">): Promise<CashFlowSummaryModel> {
    return safeApiCall(async () => {
      const response = await this.http.get<ApiResponse<CashFlowSummaryResponse>>(
        "/reports/cash-flow/summary",
        { params: mapFilterToQuery(filter) }
      );
      return mapSummaryResponseToModel(response.data);
    });
  }

  async createAdjustment(input: CreateAdjustmentInput): Promise<CashFlowTransactionModel> {
    return safeApiCall(async () => {
      const response = await this.http.post<ApiResponse<CashFlowTransactionResponse>>(
        "/reports/cash-flow/adjustment",
        input
      );
      return mapTransactionResponseToModel(response.data);
    });
  }

  async getAccounts(): Promise<CashAccountModel[]> {
    return safeApiCall(async () => {
      const response = await this.http.get<ApiResponse<CashAccountResponse[]>>(
        "/reports/cash-flow/accounts"
      );
      return response.data.map(mapAccountResponseToModel);
    });
  }
}
