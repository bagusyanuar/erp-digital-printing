import type { DraftOrderModel, OrderModel, OrderSpkModel, OrderPaymentModel } from "../models/order.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export interface OrderParams {
  page: number;
  limit: number;
  status?: string;
  designer_id?: string;
  payment_status?: string;
}

export interface ProcessPaymentInput {
  reseller_id: string | null;
  customer_name: string;
  customer_phone: string;
  payment_method: string;
  payment_type: string;
  amount_paid: number;
}

export interface RepayPaymentInput {
  amount_paid: number;
  payment_method: string;
}

export interface OrderRepository {
  saveDraft(input: DraftOrderModel): Promise<void>;
  getOrders(params: OrderParams): Promise<PaginatedResponse<OrderModel>>;
  submitOrder(id: string): Promise<void>;
  payOrder(id: string, input: ProcessPaymentInput): Promise<void>;
  repayOrder(id: string, input: RepayPaymentInput): Promise<void>;
  getOrderSpk(id: string): Promise<OrderSpkModel>;
  getOrderPayments(id: string): Promise<OrderPaymentModel[]>;
}

