import type { DraftOrderModel, OrderModel, OrderSpkModel, OrderPaymentModel } from "@core/order/domains/models/order.model";
import type { OrderRepository, OrderParams, ProcessPaymentInput, RepayPaymentInput, RefundOrderInput, OrderReportWidgetsParams, OrderReportWidgetsModel, SalesReportWidgetsParams, SalesReportWidgetsModel, SalesTrendParams, SalesTrendItem, CategorySalesParams, CategorySalesItem, PaymentSalesParams, PaymentSalesItem } from "@core/order/domains/repositories/order.repository";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { safeApiCall } from "@infrastructure/libs/error";
import type { HttpClient } from "@erp-digital-printing/http";
import type { DraftOrderRequest } from "../schemas/order.request";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import type { OrderResponse, OrderSpkResponse, OrderPaymentResponse } from "../schemas/order.response";



export class ApiOrderRepository implements OrderRepository {
  constructor(private readonly http: HttpClient) {}

  async saveDraft(input: DraftOrderModel): Promise<void> {
    return safeApiCall(async () => {
      const payload: DraftOrderRequest = {
        designer_id: input.designer_id,
        reseller_id: input.reseller_id,
        customer_name: input.customer_name,
        customer_phone: input.customer_phone,
        notes: input.notes,
        items: input.items.map((item) => ({
          product_variant_id: item.product_variant_id,
          uom: item.uom,
          quantity: item.quantity,
          design_file_url: item.design_file_url,
          production_notes: item.production_notes,
          finishing_ids: item.finishing_ids,
          length_cm: item.length_cm,
          width_cm: item.width_cm,
        })),
      };
      await this.http.post("/orders/draft", payload);
    });
  }

  async getOrders(params: OrderParams): Promise<PaginatedResponse<OrderModel>> {
    return safeApiCall(async () => {
      const query: Record<string, string | number> = {
        page: params.page,
        limit: params.limit,
      };
      if (params.status) {
        query.status = params.status;
      }
      if (params.designer_id) {
        query.designer_id = params.designer_id;
      }
      if (params.cashier_id) {
        query.cashier_id = params.cashier_id;
      }
      if (params.payment_status) {
        query.payment_status = params.payment_status;
      }
      if (params.search) {
        query.search = params.search;
      }
      if (params.start_date) {
        query.start_date = params.start_date;
      }
      if (params.end_date) {
        query.end_date = params.end_date;
      }
      if (params.customer_type) {
        query.customer_type = params.customer_type;
      }
      if (params.payment_methods) {
        query.payment_method = params.payment_methods;
      }

      const response = await this.http.get<ApiResponse<OrderResponse[]>>(
        "/orders",
        { params: query },
      );

      return {
        data: (response.data ?? []).map((order): OrderModel => ({
          id: order.id,
          job_number: order.job_number,
          invoice_number: order.invoice_number,
          designer_id: order.designer_id,
          designer_name: order.designer_name,
          status: order.status,
          payment_status: order.payment_status,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          reseller_id: order.reseller_id,
          notes: order.notes,
          total_additional_cost: order.total_additional_cost,
          total_product_price: order.total_product_price,
          grand_total: order.grand_total,
          amount_paid: order.amount_paid,
          order_items: (order.order_items ?? []).map((item) => ({
            id: item.id,
            product_variant_id: item.product_variant_id,
            product_name: item.product_name,
            variant_name: item.variant_name,
            uom: item.uom,
            quantity: item.quantity,
            design_file_url: item.design_file_url,
            production_notes: item.production_notes,
            price_per_unit: item.price_per_unit,
            additional_cost: item.additional_cost,
            subtotal: item.subtotal,
            length_cm: item.length_cm,
            width_cm: item.width_cm,
          })),
          order_payments: (order.order_payments ?? []).map((pay) => ({
            id: pay.id,
            cashier_id: pay.cashier_id,
            cashier_name: pay.cashier_name,
            amount: pay.amount,
            payment_method: pay.payment_method,
            payment_type: pay.payment_type,
            payment_number: pay.payment_number,
            created_at: pay.created_at,
          })),
          created_at: order.created_at,
          updated_at: order.updated_at,
        })),
        page: response.meta?.pagination.current_page ?? 1,
        total: response.meta?.pagination.total_items ?? 0,
        limit: response.meta?.pagination.limit ?? 10,
      };
    });
  }

  async submitOrder(id: string): Promise<void> {
    return safeApiCall(async () => {
      await this.http.put(`/orders/${id}/submit`, {});
    });
  }

  async payOrder(id: string, input: ProcessPaymentInput): Promise<void> {
    return safeApiCall(async () => {
      await this.http.post(`/orders/${id}/pay`, input);
    });
  }

  async repayOrder(id: string, input: RepayPaymentInput): Promise<void> {
    return safeApiCall(async () => {
      await this.http.post(`/orders/${id}/repay`, input);
    });
  }

  async refundOrder(id: string, input: RefundOrderInput): Promise<void> {
    return safeApiCall(async () => {
      await this.http.post(`/orders/${id}/refund`, input);
    });
  }

  async getOrderSpk(id: string): Promise<OrderSpkModel> {
    return safeApiCall(async () => {
      const response = await this.http.get<ApiResponse<OrderSpkResponse>>(
        `/orders/${id}/spk`
      );
      const data = response.data;
      if (!data) {
        throw new Error("Data SPK tidak ditemukan.");
      }
      return {
        order_id: data.order_id,
        job_number: data.job_number,
        invoice_number: data.invoice_number,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        status: data.status,
        spk_by_category: (data.spk_by_category ?? []).map((cat) => ({
          category_id: cat.category_id,
          category_name: cat.category_name,
          items: (cat.items ?? []).map((item) => ({
            id: item.id,
            product_name: item.product_name,
            variant_name: item.variant_name,
            uom: item.uom,
            quantity: item.quantity,
            design_file_url: item.design_file_url,
            production_notes: item.production_notes,
            length_cm: item.length_cm,
            width_cm: item.width_cm,
          })),
        })),
      };
    });
  }

  async getOrderPayments(id: string): Promise<OrderPaymentModel[]> {
    return safeApiCall(async () => {
      const response = await this.http.get<ApiResponse<OrderPaymentResponse[]>>(
        `/orders/${id}/payments`
      );
      return (response.data ?? []).map((pay) => ({
        id: pay.id,
        cashier_id: pay.cashier_id,
        cashier_name: pay.cashier_name,
        amount: pay.amount,
        payment_method: pay.payment_method,
        payment_type: pay.payment_type,
        payment_number: pay.payment_number,
        created_at: pay.created_at,
      }));
    });
  }

  async updateOrderStatus(id: string, status: string): Promise<void> {
    return safeApiCall(async () => {
      await this.http.patch(`/orders/${id}/status`, { status });
    });
  }

  async getOrderById(id: string): Promise<OrderModel> {
    return safeApiCall(async () => {
      const response = await this.http.get<ApiResponse<OrderResponse>>(`/orders/${id}`);
      const order = response.data;
      if (!order) {
        throw new Error("Order tidak ditemukan.");
      }
      return {
        id: order.id,
        job_number: order.job_number,
        invoice_number: order.invoice_number,
        designer_id: order.designer_id,
        designer_name: order.designer_name,
        status: order.status,
        payment_status: order.payment_status,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        reseller_id: order.reseller_id,
        notes: order.notes,
        total_additional_cost: order.total_additional_cost,
        total_product_price: order.total_product_price,
        grand_total: order.grand_total,
        amount_paid: order.amount_paid,
        order_items: (order.order_items ?? []).map((item) => ({
          id: item.id,
          product_variant_id: item.product_variant_id,
          product_name: item.product_name,
          variant_name: item.variant_name,
          uom: item.uom,
          quantity: item.quantity,
          design_file_url: item.design_file_url,
          production_notes: item.production_notes,
          price_per_unit: item.price_per_unit,
          additional_cost: item.additional_cost,
          subtotal: item.subtotal,
          length_cm: item.length_cm,
          width_cm: item.width_cm,
        })),
        order_payments: (order.order_payments ?? []).map((pay) => ({
          id: pay.id,
          cashier_id: pay.cashier_id,
          cashier_name: pay.cashier_name,
          amount: pay.amount,
          payment_method: pay.payment_method,
          payment_type: pay.payment_type,
          payment_number: pay.payment_number,
          created_at: pay.created_at,
        })),
        created_at: order.created_at,
        updated_at: order.updated_at,
      };
    });
  }

  async updateOrder(id: string, input: DraftOrderModel): Promise<void> {
    return safeApiCall(async () => {
      const payload = {
        designer_id: input.designer_id,
        reseller_id: input.reseller_id,
        customer_name: input.customer_name,
        customer_phone: input.customer_phone,
        notes: input.notes,
        items: input.items.map((item) => ({
          product_variant_id: item.product_variant_id,
          uom: item.uom,
          quantity: item.quantity,
          design_file_url: item.design_file_url,
          production_notes: item.production_notes,
          finishing_ids: item.finishing_ids,
          length_cm: item.length_cm,
          width_cm: item.width_cm,
        })),
      };
      await this.http.put(`/orders/${id}`, payload);
    });
  }

  async getOrderReportWidgets(params: OrderReportWidgetsParams): Promise<OrderReportWidgetsModel> {
    return safeApiCall(async () => {
      const query: Record<string, string | number> = {};
      if (params.status) {
        query.status = params.status;
      }
      if (params.payment_status) {
        query.payment_status = params.payment_status;
      }
      if (params.designer_id) {
        query.designer_id = params.designer_id;
      }
      if (params.cashier_id) {
        query.cashier_id = params.cashier_id;
      }
      if (params.search) {
        query.search = params.search;
      }
      if (params.start_date) {
        query.start_date = params.start_date;
      }
      if (params.end_date) {
        query.end_date = params.end_date;
      }
      if (params.customer_type) {
        query.customer_type = params.customer_type;
      }
      if (params.payment_method) {
        query.payment_method = params.payment_method;
      }

      const response = await this.http.get<ApiResponse<OrderReportWidgetsModel>>(
        "/orders/reports/widgets",
        { params: query }
      );

      if (!response.data) {
        throw new Error("Gagal memuat data widget laporan.");
      }

      return response.data;
    });
  }

  async getSalesReportWidgets(params: SalesReportWidgetsParams): Promise<SalesReportWidgetsModel> {
    return safeApiCall(async () => {
      const query: Record<string, string | number> = {};
      if (params.status) {
        query.status = params.status;
      }
      if (params.payment_status) {
        query.payment_status = params.payment_status;
      }
      if (params.designer_id) {
        query.designer_id = params.designer_id;
      }
      if (params.cashier_id) {
        query.cashier_id = params.cashier_id;
      }
      if (params.search) {
        query.search = params.search;
      }
      if (params.start_date) {
        query.start_date = params.start_date;
      }
      if (params.end_date) {
        query.end_date = params.end_date;
      }
      if (params.customer_type) {
        query.customer_type = params.customer_type;
      }
      if (params.payment_method) {
        query.payment_method = params.payment_method;
      }

      const response = await this.http.get<ApiResponse<SalesReportWidgetsModel>>(
        "/orders/reports/sales-widgets",
        { params: query }
      );

      if (!response.data) {
        throw new Error("Gagal memuat data widget laporan penjualan.");
      }

      return response.data;
    });
  }

  async getSalesTrend(params: SalesTrendParams): Promise<SalesTrendItem[]> {
    return safeApiCall(async () => {
      const query: Record<string, string | number> = {};
      if (params.type) {
        query.type = params.type;
      }
      if (params.status) {
        query.status = params.status;
      }
      if (params.payment_status) {
        query.payment_status = params.payment_status;
      }
      if (params.payment_method) {
        query.payment_method = params.payment_method;
      }
      if (params.designer_id) {
        query.designer_id = params.designer_id;
      }
      if (params.cashier_id) {
        query.cashier_id = params.cashier_id;
      }
      if (params.search) {
        query.search = params.search;
      }
      if (params.start_date) {
        query.start_date = params.start_date;
      }
      if (params.end_date) {
        query.end_date = params.end_date;
      }
      if (params.customer_type) {
        query.customer_type = params.customer_type;
      }

      const response = await this.http.get<ApiResponse<SalesTrendItem[]>>(
        "/orders/reports/sales-trend",
        { params: query }
      );

      if (!response.data) {
        throw new Error("Gagal memuat data tren penjualan.");
      }

      return response.data;
    });
  }

  async getCategorySales(params: CategorySalesParams): Promise<CategorySalesItem[]> {
    return safeApiCall(async () => {
      const query: Record<string, string | number> = {};
      if (params.start_date) {
        query.start_date = params.start_date;
      }
      if (params.end_date) {
        query.end_date = params.end_date;
      }

      const response = await this.http.get<ApiResponse<CategorySalesItem[]>>(
        "/orders/reports/category-sales",
        { params: query }
      );

      if (!response.data) {
        throw new Error("Gagal memuat data kategori cetakan terlaris.");
      }

      return response.data;
    });
  }

  async getPaymentSales(params: PaymentSalesParams): Promise<PaymentSalesItem[]> {
    return safeApiCall(async () => {
      const query: Record<string, string | number> = {};
      if (params.start_date) {
        query.start_date = params.start_date;
      }
      if (params.end_date) {
        query.end_date = params.end_date;
      }

      const response = await this.http.get<ApiResponse<PaymentSalesItem[]>>(
        "/orders/reports/payment-sales",
        { params: query }
      );

      if (!response.data) {
        throw new Error("Gagal memuat data penjualan metode pembayaran.");
      }

      return response.data;
    });
  }
}
