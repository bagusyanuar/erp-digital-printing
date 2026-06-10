import type { DraftOrderModel, OrderModel, OrderSpkModel, OrderPaymentModel } from "../models/order.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export interface OrderParams {
  page: number;
  limit: number;
  status?: string;
  designer_id?: string;
  cashier_id?: string;
  payment_status?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface PaymentItemInput {
  payment_method: string;
  amount_paid: number;
}

export interface ProcessPaymentInput {
  reseller_id: string | null;
  customer_name: string;
  customer_phone: string;
  payments: PaymentItemInput[];
}

export interface RepayPaymentInput {
  payments: PaymentItemInput[];
}

export interface OrderRepository {
  saveDraft(input: DraftOrderModel): Promise<void>;
  getOrders(params: OrderParams): Promise<PaginatedResponse<OrderModel>>;
  submitOrder(id: string): Promise<void>;
  payOrder(id: string, input: ProcessPaymentInput): Promise<void>;
  repayOrder(id: string, input: RepayPaymentInput): Promise<void>;
  getOrderSpk(id: string): Promise<OrderSpkModel>;
  getOrderPayments(id: string): Promise<OrderPaymentModel[]>;
  updateOrderStatus(id: string, status: string): Promise<void>;
  getOrderById(id: string): Promise<OrderModel>;
  updateOrder(id: string, input: DraftOrderModel): Promise<void>;
}

