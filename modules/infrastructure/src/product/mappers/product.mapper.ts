import type { ProductParams, CreateProductInput } from "@core/product/applications/inputs";
import type { ProductQuery, ProductResponse, CreateProductRequest } from "../schemas";
import type { ProductModel } from "@core/product/domains/models";

export function mapProductParamToQuery(params: ProductParams): ProductQuery {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search,
    sort: params.sort,
    order: params.sortBy,
    category_id: params.category_id,
  };
}

export function mapProductResponseToModel(
  response: ProductResponse,
): ProductModel {
  return {
    id: response.id,
    name: response.name,
    category_id: response.category_id,
    sku: response.sku,
    uom: response.uom,
    base_price: response.base_price,
    description: response.description,
    variants: response.variants?.map(v => ({
      id: v.id,
      variant_name: v.variant_name,
      additional_cost: v.additional_cost,
      attributes: (v.attribute_values || v.attributes || []).map(a => ({
        attribute_id: a.attribute_id,
        value: a.value
      })),
      price_tiers: (v.price_tiers || []).map(pt => ({
        customer_level_id: pt.customer_level_id,
        min_qty: pt.min_qty,
        max_qty: pt.max_qty,
        price_per_unit: pt.price_per_unit
      }))
    }))
  };
}

export function mapCreateProductInputToRequest(
  input: CreateProductInput,
): CreateProductRequest {
  return {
    name: input.name,
    category_id: input.category_id,
    sku: input.sku,
    uom: input.uom,
    base_price: input.base_price,
    description: input.description,
    variants: input.variants?.map(v => ({
      variant_name: v.variant_name,
      additional_cost: v.additional_cost,
      attributes: v.attributes.map(a => ({
        attribute_id: a.attribute_id,
        value: a.value
      })),
      price_tiers: v.price_tiers.map(pt => ({
        customer_level_id: pt.customer_level_id,
        min_qty: pt.min_qty,
        max_qty: pt.max_qty,
        price_per_unit: pt.price_per_unit
      }))
    }))
  };
}
