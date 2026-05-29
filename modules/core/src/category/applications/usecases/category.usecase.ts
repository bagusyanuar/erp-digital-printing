import type { CategoryRepository } from "../../domains/repositories";
import type { CategoryModel } from "../../domains/models";
import type { CategoryParams, CreateCategoryInput } from "../inputs";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export class GetCategories {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(
    params: CategoryParams,
  ): Promise<PaginatedResponse<CategoryModel>> {
    return await this.categoryRepository.getCategories(params);
  }
}

export class GetCategoryById {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<CategoryModel> {
    return await this.categoryRepository.getCategoryById(id);
  }
}

export class CreateCategory {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<CategoryModel> {
    return await this.categoryRepository.create(input);
  }
}

export class UpdateCategory {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string, input: CreateCategoryInput): Promise<CategoryModel> {
    return await this.categoryRepository.update(id, input);
  }
}

export class DeleteCategory {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<void> {
    await this.categoryRepository.delete(id);
  }
}
