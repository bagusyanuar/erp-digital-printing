export interface PriceTierModel {
  customer_level_id: string;
  min_qty: number;
  max_qty: number;
  price_per_unit: number;
}

export interface VariantAttributeModel {
  attribute_id: string;
  value: string;
}

export interface ProductVariantModel {
  id?: string;
  variant_name: string;
  additional_cost: number;
  attributes: VariantAttributeModel[];
  price_tiers: PriceTierModel[];
}

export interface ProductModel {
  id?: string;
  name: string;
  category_id: string;
  sku: string;
  uom: string;
  base_price: number;
  description?: string;
  variants?: ProductVariantModel[];
}
