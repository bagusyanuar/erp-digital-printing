import { type HttpClient } from "@erp-digital-printing/http";
import { GetCategories, CreateCategory, GetCategoryById, UpdateCategory, DeleteCategory } from "@core/category/applications/usecases/category.usecase";
import { ApiCategoryRepository } from "../repositories/category.repository";

export function getCategoryUseCase(http: HttpClient): GetCategories {
  const repository = new ApiCategoryRepository(http);
  return new GetCategories(repository);
}

export function createCategoryUseCase(http: HttpClient): CreateCategory {
  const repository = new ApiCategoryRepository(http);
  return new CreateCategory(repository);
}

export function getCategoryByIdUseCase(http: HttpClient): GetCategoryById {
  const repository = new ApiCategoryRepository(http);
  return new GetCategoryById(repository);
}

export function updateCategoryUseCase(http: HttpClient): UpdateCategory {
  const repository = new ApiCategoryRepository(http);
  return new UpdateCategory(repository);
}

export function deleteCategoryUseCase(http: HttpClient): DeleteCategory {
  const repository = new ApiCategoryRepository(http);
  return new DeleteCategory(repository);
}
