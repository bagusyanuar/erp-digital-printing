import type { ExpenseCategoryRepository } from "../../domains/repositories";
import type { ExpenseCategoryModel } from "../../domains/models";
import type { ExpenseCategoryParams, CreateExpenseCategoryInput } from "../inputs";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export class GetExpenseCategories {
  constructor(private readonly repository: ExpenseCategoryRepository) {}

  async execute(
    params: ExpenseCategoryParams,
  ): Promise<PaginatedResponse<ExpenseCategoryModel>> {
    return await this.repository.getExpenseCategories(params);
  }
}

export class GetExpenseCategoryById {
  constructor(private readonly repository: ExpenseCategoryRepository) {}

  async execute(id: string): Promise<ExpenseCategoryModel> {
    return await this.repository.getExpenseCategoryById(id);
  }
}

export class CreateExpenseCategory {
  constructor(private readonly repository: ExpenseCategoryRepository) {}

  async execute(input: CreateExpenseCategoryInput): Promise<ExpenseCategoryModel> {
    return await this.repository.create(input);
  }
}

export class UpdateExpenseCategory {
  constructor(private readonly repository: ExpenseCategoryRepository) {}

  async execute(
    id: string,
    input: CreateExpenseCategoryInput,
  ): Promise<ExpenseCategoryModel> {
    return await this.repository.update(id, input);
  }
}

export class DeleteExpenseCategory {
  constructor(private readonly repository: ExpenseCategoryRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
