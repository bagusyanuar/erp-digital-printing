import type { ExpenseRepository } from "../../domains/repositories/expense.repository";
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
