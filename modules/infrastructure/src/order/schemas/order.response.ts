export interface OrderItemResponse {
  id: string;
  product_variant_id: string;
  product_name: string;
  variant_name: string;
  uom: string;
  quantity: number;
  design_file_url: string;
  production_notes: string;
  price_per_unit: number;
  additional_cost: number;
  subtotal: number;
  length_cm?: number;
  width_cm?: number;
}

export interface OrderResponse {
  id: string;
  job_number: string;
  invoice_number: string | null;
  designer_id: string;
  designer_name: string;
  status: string;
  payment_status: string;
  customer_name: string | null;
  customer_phone: string | null;
  reseller_id: string | null;
  notes: string;
  total_additional_cost: number;
  total_product_price: number;
  grand_total: number;
  amount_paid: number;
  order_items: OrderItemResponse[];
  created_at: string;
  updated_at: string;
}

export interface SpkItemResponse {
  id: string;
  product_name: string;
  variant_name: string;
  uom: string;
  quantity: number;
  design_file_url: string;
  production_notes: string;
  length_cm?: number | null;
  width_cm?: number | null;
}

export interface SpkCategoryResponse {
  category_id: string;
  category_name: string;
  items: SpkItemResponse[];
}

export interface OrderSpkResponse {
  order_id: string;
  job_number: string;
  invoice_number: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  spk_by_category: SpkCategoryResponse[];
}

export interface OrderPaymentResponse {
  id: string;
  cashier_id: string;
  cashier_name: string;
  amount: number;
  payment_method: string;
  created_at: string;
}

