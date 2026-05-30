export interface PriceTierResponse {
  id: string;
  customer_level_id: string;
  min_qty: number;
  max_qty: number;
  price_per_unit: number;
}

export interface VariantAttributeResponse {
  attribute_id: string;
  value: string;
}

export interface ProductVariantResponse {
  id: string;
  variant_name: string;
  additional_cost: number;
  attributes?: VariantAttributeResponse[];
  attribute_values?: VariantAttributeResponse[];
  price_tiers: PriceTierResponse[];
}

export interface ProductResponse {
  id: string;
  name: string;
  category_id: string;
  sku: string;
  uom: string;
  base_price: number;
  description?: string;
  variants?: ProductVariantResponse[];
}
