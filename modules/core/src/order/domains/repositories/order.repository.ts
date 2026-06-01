import type { DraftOrderModel, OrderModel } from "../models/order.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export interface OrderParams {
  page: number;
  limit: number;
  status?: string;
  designer_id?: string;
}

export interface ProcessPaymentInput {
  reseller_id: string | null;
  customer_name: string;
  customer_phone: string;
  payment_method: string;
  payment_type: string;
  amount_paid: number;
}

export interface OrderRepository {
  saveDraft(input: DraftOrderModel): Promise<void>;
  getOrders(params: OrderParams): Promise<PaginatedResponse<OrderModel>>;
  submitOrder(id: string): Promise<void>;
  payOrder(id: string, input: ProcessPaymentInput): Promise<void>;
}
