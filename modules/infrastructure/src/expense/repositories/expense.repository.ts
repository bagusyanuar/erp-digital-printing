import type { CreateExpenseInput, ExpenseQueryParams, PayExpenseInput } from "@core/expense/applications/inputs/expense.input";
import type { ExpenseModel, CategoryExpenseBreakdownModel } from "@core/expense/domains/models/expense.model";
import type { ExpenseRepository, ExpenseReportWidgetsParams, ExpenseReportWidgetsModel, ExpenseAnalyticsSummaryParams, ExpenseAnalyticsSummaryModel, CategoryExpensesParams, ExportExpenseParams, ExportExpenseResult } from "@core/expense/domains/repositories/expense.repository";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { safeApiCall } from "@infrastructure/libs/error";
import { mapCreateInputToRequest, mapResponseToModel, mapParamsToQuery, mapPayInputToRequest } from "../mappers/expense.mapper";
import type { HttpClient } from "@erp-digital-printing/http";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import type { ExpenseResponse, CategoryExpenseResponse } from "../schemas/expense.response";

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
        category_id: params.categoryId,
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

  async getCategoryExpenses(
    params?: CategoryExpensesParams,
  ): Promise<PaginatedResponse<CategoryExpenseBreakdownModel>> {
    return safeApiCall(async () => {
      const query = {
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
        start_date: params?.startDate,
        end_date: params?.endDate,
        category_id: params?.categoryId,
        group: params?.group,
        status: params?.status,
        sort_by: params?.sortBy,
        sort_order: params?.sortOrder,
      };
      const response = await this.http.get<ApiResponse<CategoryExpenseResponse[]>>(
        "/expenses/reports/category-expenses",
        { params: query },
      );
      return {
        data: (response.data ?? []).map((item) => ({
          id: item.id,
          categoryId: item.category_id,
          categoryName: item.category_name,
          expenseCategoryId: item.expense_category_id,
          expenseCategoryName: item.expense_category_name,
          description: item.description,
          totalExpense: item.total_expense,
          expenseCount: item.expense_count,
        })),
        page: response.meta?.pagination.current_page ?? 1,
        total: response.meta?.pagination.total_items ?? 0,
        limit: response.meta?.pagination.limit ?? 10,
      };
    });
  }

  async exportExcel(
    params?: ExportExpenseParams,
  ): Promise<ExportExpenseResult> {
    return safeApiCall(async () => {
      const query: Record<string, string | undefined> = {};
      if (params?.date) query.date = params.date;
      if (params?.startDate) query.start_date = params.startDate;
      if (params?.endDate) query.end_date = params.endDate;
      if (params?.group) query.group = params.group;
      if (params?.expenseCategoryId) query.expense_category_id = params.expenseCategoryId;
      if (params?.categoryId) query.category_id = params.categoryId;
      if (params?.search) query.search = params.search;
      if (params?.status) query.status = params.status;

      const response = await this.http.getInstance().get<Blob>(
        "/expenses/export",
        {
          params: query,
          responseType: "blob",
        },
      );

      const disposition = response.headers["content-disposition"] as
        | string
        | undefined;
      let filename: string | undefined;
      if (disposition) {
        const match = disposition.match(
          /filename=(?:["']?)(.*?)(?:["']?)(?:;|$)/,
        );
        if (match?.[1]) {
          filename = match[1];
        }
      }

      return {
        blob: response.data,
        filename,
      };
    });
  }
}
