export interface DraftOrderItemRequest {
  product_variant_id: string;
  uom: string;
  quantity: number;
  design_file_url: string;
  production_notes: string;
  finishing_ids: string[];
  length_m?: number;
  width_m?: number;
}

export interface DraftOrderRequest {
  designer_id: string;
  reseller_id: string | null;
  customer_name: string;
  customer_phone: string;
  notes: string;
  items: DraftOrderItemRequest[];
}
