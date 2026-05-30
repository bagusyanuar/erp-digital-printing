import type { PaginationQuery } from "@infrastructure/libs/api-response";

export interface ProductQuery extends PaginationQuery {
  search?: string;
  sort?: string;
  order?: string;
  category_id?: string;
}

export interface PriceTierRequest {
  customer_level_id: string;
  min_qty: number;
  max_qty: number;
  price_per_unit: number;
}

export interface VariantAttributeRequest {
  attribute_id: string;
  value: string;
}

export interface ProductVariantRequest {
  variant_name: string;
  additional_cost: number;
  attributes: VariantAttributeRequest[];
  price_tiers: PriceTierRequest[];
}

export interface CreateProductRequest {
  name: string;
  category_id: string;
  sku: string;
  uom: string;
  base_price: number;
  description?: string;
  variants?: ProductVariantRequest[];
}
