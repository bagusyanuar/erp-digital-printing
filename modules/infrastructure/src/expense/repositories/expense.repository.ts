import type { CreateExpenseInput, ExpenseQueryParams, PayExpenseInput } from "@core/expense/applications/inputs/expense.input";
import type { ExpenseModel } from "@core/expense/domains/models/expense.model";
import type { ExpenseRepository, ExpenseReportWidgetsParams, ExpenseReportWidgetsModel, ExpenseAnalyticsSummaryParams, ExpenseAnalyticsSummaryModel } from "@core/expense/domains/repositories/expense.repository";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { safeApiCall } from "@infrastructure/libs/error";
import { mapCreateInputToRequest, mapResponseToModel, mapParamsToQuery, mapPayInputToRequest } from "../mappers/expense.mapper";
import type { HttpClient } from "@erp-digital-printing/http";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import type { ExpenseResponse } from "../schemas/expense.response";

export class ApiExpenseRepository implements ExpenseRepository {
  constructor(private readonly http: HttpClient) {}

  async create(input: CreateExpenseInput): Promise<ExpenseModel> {
    return safeApiCall(async () => {
      const payload = mapCreateInputToRequest(input);
      const response = await this.http.post<ApiResponse<ExpenseResponse>>(
        "/expenses",
        payload,
      );
      return mapResponseToModel(response.data);
    });
  }

  async getExpenses(
    params: ExpenseQueryParams,
  ): Promise<PaginatedResponse<ExpenseModel>> {
    return safeApiCall(async () => {
      const query = mapParamsToQuery(params);
      const response = await this.http.get<ApiResponse<ExpenseResponse[]>>(
        "/expenses",
        { params: query },
      );
      return {
        data: response.data.map(mapResponseToModel),
        page: response.meta?.pagination.current_page ?? 1,
        total: response.meta?.pagination.total_items ?? 0,
        limit: response.meta?.pagination.limit ?? 10,
      };
    });
  }

  async getExpenseReportWidgets(
    params: ExpenseReportWidgetsParams,
  ): Promise<ExpenseReportWidgetsModel> {
    return safeApiCall(async () => {
      const query = {
        start_date: params.startDate,
        end_date: params.endDate,
        group: params.group,
        expense_category_id: params.expenseCategoryId,
        search: params.search,
        status: params.status,
      };
      const response = await this.http.get<ApiResponse<{
        total_expense: number;
        remaining_debt: number;
        transaction_volume: number;
      }>>("/expenses/reports/widgets", { params: query });
      
      return {
        totalExpense: response.data.total_expense,
        remainingDebt: response.data.remaining_debt,
        transactionVolume: response.data.transaction_volume,
      };
    });
  }

  async getExpenseAnalyticsSummary(
    params: ExpenseAnalyticsSummaryParams,
  ): Promise<ExpenseAnalyticsSummaryModel> {
    return safeApiCall(async () => {
      const query = {
        start_date: params.startDate,
        end_date: params.endDate,
      };
      const response = await this.http.get<ApiResponse<{
        total_production: number;
        total_operational: number;
        total_expense: number;
      }>>("/expenses/analytics/summary", { params: query });
      
      return {
        totalProduction: response.data.total_production,
        totalOperational: response.data.total_operational,
        totalExpense: response.data.total_expense,
      };
    });
  }

  async pay(id: string, input: PayExpenseInput): Promise<void> {
    return safeApiCall(async () => {
      const payload = mapPayInputToRequest(input);
      await this.http.post(`/expenses/${id}/payments`, payload);
    });
  }
}
