export interface DraftOrderItemRequest {
  product_variant_id: string;
  uom: string;
  quantity: number;
  design_file_url: string;
  production_notes: string;
  finishing_ids: string[];
  length_cm?: number;
  width_cm?: number;
}

export interface DraftOrderRequest {
  designer_id: string;
  notes: string;
  items: DraftOrderItemRequest[];
}
