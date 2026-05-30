import type { ProductModel } from "../models/product.model";
import type { CreateProductInput, ProductParams } from "../../applications/inputs/product.input";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export interface ProductRepository {
  getProducts(params: ProductParams): Promise<PaginatedResponse<ProductModel>>;
  getProductById(id: string): Promise<ProductModel>;
  create(input: CreateProductInput): Promise<ProductModel>;
  update(id: string, input: CreateProductInput): Promise<ProductModel>;
  delete(id: string): Promise<void>;
}
