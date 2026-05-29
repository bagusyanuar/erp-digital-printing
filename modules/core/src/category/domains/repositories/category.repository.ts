import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { CategoryParams, CreateCategoryInput } from "@core/category/applications/inputs";
import type { CategoryModel } from "../models";

export interface CategoryRepository {
  getCategories(
    params: CategoryParams,
  ): Promise<PaginatedResponse<CategoryModel>>;
  getCategoryById(id: string): Promise<CategoryModel>;
  create(input: CreateCategoryInput): Promise<CategoryModel>;
  update(id: string, input: CreateCategoryInput): Promise<CategoryModel>;
  delete(id: string): Promise<void>;
}
