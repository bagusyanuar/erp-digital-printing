export interface DraftOrderItemRequest {
  product_variant_id: string;
  uom: string;
  quantity: number;
  design_file_url: string;
  production_notes: string;
  finishing_ids: string[];
  length_m?: number;
  width_m?: number;
  price_per_unit?: number;
}

export interface DraftOrderRequest {
  designer_id: string;
  reseller_id: string | null;
  customer_name: string;
  customer_phone: string;
  notes: string;
  deadline?: string | null;
  items: DraftOrderItemRequest[];
}
