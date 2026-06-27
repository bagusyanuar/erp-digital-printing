import type { FundTransferParams, CreateFundTransferInput, FundTransferWidgetsParams } from "@core/fund-transfer/applications/inputs/fund-transfer.input";
import type { FundTransferModel } from "@core/fund-transfer/domains/models/fund-transfer.model";
import type { FundTransferRepository, FundTransferWidgetsModel } from "@core/fund-transfer/domains/repositories/fund-transfer.repository";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { safeApiCall } from "@infrastructure/libs/error";
import type { HttpClient } from "@erp-digital-printing/http";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import type { FundTransferResponse, FundTransferWidgetsResponse } from "../schemas/fund-transfer.request";
import {
  mapFundTransferParamsToQuery,
  mapFundTransferResponseToModel,
  mapCreateFundTransferInputToRequest,
  mapFundTransferWidgetsParamsToQuery,
  mapFundTransferWidgetsResponseToModel,
} from "../mappers/fund-transfer.mapper";

export class ApiFundTransferRepository implements FundTransferRepository {
  constructor(private readonly http: HttpClient) {}

  async getFundTransfers(
    params: FundTransferParams,
  ): Promise<PaginatedResponse<FundTransferModel>> {
    return safeApiCall(async () => {
      const query = mapFundTransferParamsToQuery(params);
      const response = await this.http.get<ApiResponse<FundTransferResponse[]>>(
        "/reports/cash-flow/transfers",
        { params: query },
      );
      return {
        data: response.data.map(mapFundTransferResponseToModel),
        page: response.meta?.pagination.current_page ?? 1,
        total: response.meta?.pagination.total_items ?? 0,
        limit: response.meta?.pagination.limit ?? 10,
      };
    });
  }

  async createFundTransfer(input: CreateFundTransferInput): Promise<FundTransferModel> {
    return safeApiCall(async () => {
      const payload = mapCreateFundTransferInputToRequest(input);
      const response = await this.http.post<ApiResponse<FundTransferResponse>>(
        "/reports/cash-flow/transfers",
        payload,
      );
      return mapFundTransferResponseToModel(response.data);
    });
  }

  async getFundTransferWidgets(
    params: FundTransferWidgetsParams,
  ): Promise<FundTransferWidgetsModel> {
    return safeApiCall(async () => {
      const query = mapFundTransferWidgetsParamsToQuery(params);
      const response = await this.http.get<ApiResponse<FundTransferWidgetsResponse>>(
        "/reports/cash-flow/transfers/widgets",
        { params: query },
      );
      return mapFundTransferWidgetsResponseToModel(response.data);
    });
  }
}

