import type { PaginationParams } from "@core/shared/api/pagination";
import type { ProductModel } from "../../domains/models/product.model";

export interface ProductParams extends PaginationParams {
  search?: string;
  sort?: string;
  sortBy?: string;
  category_id?: string;
}

export type CreateProductInput = ProductModel;
