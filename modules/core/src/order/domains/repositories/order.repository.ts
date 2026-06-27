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
  customer_type?: string;
  payment_methods?: string;
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

export interface RefundOrderInput {
  payment_method: string;
  amount: number;
  reason: string;
}

export interface OrderReportWidgetsParams {
  status?: string;
  payment_status?: string;
  designer_id?: string;
  cashier_id?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  customer_type?: string;
  payment_method?: string;
}

export interface OrderReportWidgetsModel {
  omset_penjualan: number;
  total_piutang: number;
  belum_lunas_count: number;
  volume_transaksi?: number;
  total_produk_terjual?: number;
  status_nota?: {
    lunas: number;
    belum_lunas: number;
  };
}

export interface SalesReportWidgetsParams {
  status?: string;
  payment_status?: string;
  designer_id?: string;
  cashier_id?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  customer_type?: string;
  payment_method?: string;
}

export interface SalesReportWidgetsModel {
  omset_penjualan: number;
  volume_transaksi: number;
  total_produk_terjual: number;
  lunas_count: number;
  belum_lunas_count: number;
}

export interface OrderRepository {
  saveDraft(input: DraftOrderModel): Promise<void>;
  getOrders(params: OrderParams): Promise<PaginatedResponse<OrderModel>>;
  submitOrder(id: string): Promise<void>;
  payOrder(id: string, input: ProcessPaymentInput): Promise<void>;
  repayOrder(id: string, input: RepayPaymentInput): Promise<void>;
  refundOrder(id: string, input: RefundOrderInput): Promise<void>;
  getOrderSpk(id: string): Promise<OrderSpkModel>;
  getOrderPayments(id: string): Promise<OrderPaymentModel[]>;
  updateOrderStatus(id: string, status: string): Promise<void>;
  getOrderById(id: string): Promise<OrderModel>;
  updateOrder(id: string, input: DraftOrderModel): Promise<void>;
  getOrderReportWidgets(params: OrderReportWidgetsParams): Promise<OrderReportWidgetsModel>;
  getSalesReportWidgets(params: SalesReportWidgetsParams): Promise<SalesReportWidgetsModel>;
}


