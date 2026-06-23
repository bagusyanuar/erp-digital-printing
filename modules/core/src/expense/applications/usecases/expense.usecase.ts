import type { ExpenseRepository, ExpenseReportWidgetsParams, ExpenseReportWidgetsModel, ExpenseAnalyticsSummaryParams, ExpenseAnalyticsSummaryModel } from "../../domains/repositories/expense.repository";
import type { CreateExpenseInput, ExpenseQueryParams } from "../inputs/expense.input";
import type { ExpenseModel } from "../../domains/models/expense.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export class CreateExpense {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(input: CreateExpenseInput): Promise<ExpenseModel> {
    return await this.expenseRepository.create(input);
  }
}

export class GetExpenses {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(params: ExpenseQueryParams): Promise<PaginatedResponse<ExpenseModel>> {
    return await this.expenseRepository.getExpenses(params);
  }
}

export class GetExpenseReportWidgets {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(params: ExpenseReportWidgetsParams): Promise<ExpenseReportWidgetsModel> {
    return await this.expenseRepository.getExpenseReportWidgets(params);
  }
}

export class GetExpenseAnalyticsSummary {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(params: ExpenseAnalyticsSummaryParams): Promise<ExpenseAnalyticsSummaryModel> {
    return await this.expenseRepository.getExpenseAnalyticsSummary(params);
  }
}
