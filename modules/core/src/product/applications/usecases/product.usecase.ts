import type { ProductRepository } from "../../domains/repositories/product.repository";
import type { ProductModel } from "../../domains/models/product.model";
import type { CreateProductInput, ProductParams } from "../inputs/product.input";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export class GetProducts {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(params: ProductParams): Promise<PaginatedResponse<ProductModel>> {
    return await this.productRepository.getProducts(params);
  }
}

export class GetProductById {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<ProductModel> {
    return await this.productRepository.getProductById(id);
  }
}

export class CreateProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: CreateProductInput): Promise<ProductModel> {
    return await this.productRepository.create(input);
  }
}

export class UpdateProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string, input: CreateProductInput): Promise<ProductModel> {
    return await this.productRepository.update(id, input);
  }
}

export class DeleteProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<void> {
    await this.productRepository.delete(id);
  }
}
