import type { CreateExpenseInput, ExpenseQueryParams, PayExpenseInput } from "../../applications/inputs/expense.input";
import type { ExpenseModel, CategoryExpenseBreakdownModel } from "../models/expense.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export interface ExpenseReportWidgetsParams {
  startDate?: string;
  endDate?: string;
  group?: "PRODUCTION" | "OPERATIONAL";
  expenseCategoryId?: string;
  categoryId?: string;
  search?: string;
  status?: string;
}

export interface ExpenseReportWidgetsModel {
  totalExpense: number;
  remainingDebt: number;
  transactionVolume: number;
}

export interface ExpenseAnalyticsSummaryParams {
  startDate?: string;
  endDate?: string;
}

export interface ExpenseAnalyticsSummaryModel {
  totalProduction: number;
  totalOperational: number;
  totalExpense: number;
}

export interface CategoryExpensesParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  group?: "PRODUCTION" | "OPERATIONAL";
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ExpenseRepository {
  create(input: CreateExpenseInput): Promise<ExpenseModel>;
  getExpenses(params: ExpenseQueryParams): Promise<PaginatedResponse<ExpenseModel>>;
  getExpenseReportWidgets(params: ExpenseReportWidgetsParams): Promise<ExpenseReportWidgetsModel>;
  getExpenseAnalyticsSummary(params: ExpenseAnalyticsSummaryParams): Promise<ExpenseAnalyticsSummaryModel>;
  getCategoryExpenses(params?: CategoryExpensesParams): Promise<PaginatedResponse<CategoryExpenseBreakdownModel>>;
  pay(id: string, input: PayExpenseInput): Promise<void>;
}
