import type { CreateExpenseInput, ExpenseQueryParams } from "../../applications/inputs/expense.input";
import type { ExpenseModel } from "../models/expense.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export interface ExpenseRepository {
  create(input: CreateExpenseInput): Promise<ExpenseModel>;
  getExpenses(params: ExpenseQueryParams): Promise<PaginatedResponse<ExpenseModel>>;
}
