import type { DraftOrderModel, OrderModel } from "@core/order/domains/models/order.model";
import type { OrderRepository, OrderParams } from "@core/order/domains/repositories/order.repository";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { safeApiCall } from "@infrastructure/libs/error";
import type { HttpClient } from "@erp-digital-printing/http";
import type { DraftOrderRequest } from "../schemas/order.request";
import type { ApiResponse } from "@infrastructure/libs/api-response";
import type { OrderResponse } from "../schemas/order.response";

export class ApiOrderRepository implements OrderRepository {
  constructor(private readonly http: HttpClient) {}

  async saveDraft(input: DraftOrderModel): Promise<void> {
    return safeApiCall(async () => {
      const payload: DraftOrderRequest = {
        designer_id: input.designer_id,
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

      const response = await this.http.get<ApiResponse<OrderResponse[]>>(
        "/orders",
        { params: query },
      );

      return {
        data: (response.data ?? []).map((order): OrderModel => ({
          id: order.id,
          job_number: order.job_number,
          designer_id: order.designer_id,
          designer_name: order.designer_name,
          status: order.status,
          payment_status: order.payment_status,
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
}
