import { type HttpClient } from "@erp-digital-printing/http";
import { CreateExpense, GetExpenses, GetExpenseReportWidgets } from "@core/expense/applications/usecases/expense.usecase";
import { ApiExpenseRepository } from "../repositories/expense.repository";

export function createExpenseUseCase(http: HttpClient): CreateExpense {
  const repository = new ApiExpenseRepository(http);
  return new CreateExpense(repository);
}

export function getExpensesUseCase(http: HttpClient): GetExpenses {
  const repository = new ApiExpenseRepository(http);
  return new GetExpenses(repository);
}

export function getExpenseReportWidgetsUseCase(http: HttpClient): GetExpenseReportWidgets {
  const repository = new ApiExpenseRepository(http);
  return new GetExpenseReportWidgets(repository);
}
