import { type HttpClient } from "@erp-digital-printing/http";
import {
  GetExpenseCategories,
  CreateExpenseCategory,
  GetExpenseCategoryById,
  UpdateExpenseCategory,
  DeleteExpenseCategory,
} from "@core/expense-category/applications/usecases/expense-category.usecase";
import { ApiExpenseCategoryRepository } from "../repositories/expense-category.repository";

export function getExpenseCategoriesUseCase(http: HttpClient): GetExpenseCategories {
  const repository = new ApiExpenseCategoryRepository(http);
  return new GetExpenseCategories(repository);
}

export function createExpenseCategoryUseCase(http: HttpClient): CreateExpenseCategory {
  const repository = new ApiExpenseCategoryRepository(http);
  return new CreateExpenseCategory(repository);
}

export function getExpenseCategoryByIdUseCase(http: HttpClient): GetExpenseCategoryById {
  const repository = new ApiExpenseCategoryRepository(http);
  return new GetExpenseCategoryById(repository);
}

export function updateExpenseCategoryUseCase(http: HttpClient): UpdateExpenseCategory {
  const repository = new ApiExpenseCategoryRepository(http);
  return new UpdateExpenseCategory(repository);
}

export function deleteExpenseCategoryUseCase(http: HttpClient): DeleteExpenseCategory {
  const repository = new ApiExpenseCategoryRepository(http);
  return new DeleteExpenseCategory(repository);
}
