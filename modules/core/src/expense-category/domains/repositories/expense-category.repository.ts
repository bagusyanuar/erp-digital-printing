import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { ExpenseCategoryParams, CreateExpenseCategoryInput } from "../../applications/inputs";
import type { ExpenseCategoryModel } from "../models";

export interface ExpenseCategoryRepository {
  getExpenseCategories(
    params: ExpenseCategoryParams,
  ): Promise<PaginatedResponse<ExpenseCategoryModel>>;
  getExpenseCategoryById(id: string): Promise<ExpenseCategoryModel>;
  create(input: CreateExpenseCategoryInput): Promise<ExpenseCategoryModel>;
  update(id: string, input: CreateExpenseCategoryInput): Promise<ExpenseCategoryModel>;
  delete(id: string): Promise<void>;
}
