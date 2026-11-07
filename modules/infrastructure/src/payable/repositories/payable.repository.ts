import type { HttpClient } from "@erp-digital-printing/http";
import type { PayableRepository } from "@core/payable/domains/repositories/payable.repository";
import type {
  VendorPayableModel,
  PayableExpenseItemModel,
  SettledExpensePayableModel,
  VendorPayableSummaryModel,
} from "@core/payable/domains/models/payable.model";
import type {
  VendorPayableParams,
  SettledPayableParams,
  PayVendorExpenseInput,
} from "@core/payable/applications/inputs/payable.input";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { safeApiCall } from "@infrastructure/libs/error";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import type {
  VendorPayableResponse,
  SettledPayableResponse,
  VendorPayableSummaryResponse,
} from "../schemas";
import {
  mapVendorPayableParamsToQuery,
  mapSettledPayableParamsToQuery,
  mapPayVendorExpenseToRequest,
  mapVendorPayableResponseToModel,
  mapSettledExpenseResponseToModel,
  mapSummaryResponseToModel,
} from "../mappers/payable.mapper";

export class ApiPayableRepository implements PayableRepository {
  constructor(private readonly http: HttpClient) {}

  async getVendorPayables(
    params: VendorPayableParams,
  ): Promise<PaginatedResponse<VendorPayableModel>> {
    return safeApiCall(async () => {
      const query = mapVendorPayableParamsToQuery(params);
      const response = await this.http.get<ApiResponse<VendorPayableResponse[]>>(
        "/vendor-payables",
        { params: query },
      );

      return {
        data: (response.data || []).map(mapVendorPayableResponseToModel),
        page: response.meta?.pagination.current_page ?? 1,
        total: response.meta?.pagination.total_items ?? 0,
        limit: response.meta?.pagination.limit ?? 10,
      };
    });
  }

  async getSettledPayables(
    params: SettledPayableParams,
  ): Promise<PaginatedResponse<SettledExpensePayableModel>> {
    return safeApiCall(async () => {
      const query = mapSettledPayableParamsToQuery(params);
      const response = await this.http.get<ApiResponse<SettledPayableResponse[]>>(
        "/vendor-payables/settled",
        { params: query },
      );

      return {
        data: (response.data || []).map(mapSettledExpenseResponseToModel),
        page: response.meta?.pagination.current_page ?? 1,
        total: response.meta?.pagination.total_items ?? 0,
        limit: response.meta?.pagination.limit ?? 10,
      };
    });
  }

  async getVendorPayableSummary(): Promise<VendorPayableSummaryModel> {
    return safeApiCall(async () => {
      const response = await this.http.get<ApiResponse<VendorPayableSummaryResponse>>(
        "/vendor-payables/summary",
      );
      return mapSummaryResponseToModel(response.data);
    });
  }

  async payVendorExpense(
    input: PayVendorExpenseInput,
  ): Promise<{ vendor: VendorPayableModel; expense: PayableExpenseItemModel }> {
    return safeApiCall(async () => {
      const payload = mapPayVendorExpenseToRequest(input);
      const response = await this.http.post<ApiResponse<VendorPayableResponse>>(
        `/expenses/${input.expenseId}/pay`,
        payload,
      );

      const mappedVendor = mapVendorPayableResponseToModel(response.data);
      const matchedExpense =
        mappedVendor.expenses.find((e) => e.id === input.expenseId) ||
        mappedVendor.expenses[0]!;

      return {
        vendor: mappedVendor,
        expense: matchedExpense,
      };
    });
  }
}

