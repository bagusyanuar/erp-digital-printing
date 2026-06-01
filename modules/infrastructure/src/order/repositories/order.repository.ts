import type { DraftOrderModel, OrderModel, OrderSpkModel } from "@core/order/domains/models/order.model";
import type { OrderRepository, OrderParams, ProcessPaymentInput } from "@core/order/domains/repositories/order.repository";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { safeApiCall } from "@infrastructure/libs/error";
import type { HttpClient } from "@erp-digital-printing/http";
import type { DraftOrderRequest } from "../schemas/order.request";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import type { OrderResponse, OrderSpkResponse } from "../schemas/order.response";

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
      if (params.payment_status) {
        query.payment_status = params.payment_status;
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
}
