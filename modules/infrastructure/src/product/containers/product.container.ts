import { type HttpClient } from "@erp-digital-printing/http";
import { GetProducts, CreateProduct, GetProductById, UpdateProduct, DeleteProduct } from "@core/product/applications/usecases/product.usecase";
import { ApiProductRepository } from "../repositories/product.repository";

export function getProductUseCase(http: HttpClient): GetProducts {
  const repository = new ApiProductRepository(http);
  return new GetProducts(repository);
}

export function createProductUseCase(http: HttpClient): CreateProduct {
  const repository = new ApiProductRepository(http);
  return new CreateProduct(repository);
}

export function getProductByIdUseCase(http: HttpClient): GetProductById {
  const repository = new ApiProductRepository(http);
  return new GetProductById(repository);
}

export function updateProductUseCase(http: HttpClient): UpdateProduct {
  const repository = new ApiProductRepository(http);
  return new UpdateProduct(repository);
}

export function deleteProductUseCase(http: HttpClient): DeleteProduct {
  const repository = new ApiProductRepository(http);
  return new DeleteProduct(repository);
}
