import type { OrderRepository, OrderParams, ProcessPaymentInput } from "../../domains/repositories/order.repository";
import type { SaveDraftOrderInput } from "../inputs/order.input";
import type { OrderModel, OrderSpkModel } from "../../domains/models/order.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export class SaveDraftOrder {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(input: SaveDraftOrderInput): Promise<void> {
    await this.orderRepository.saveDraft(input);
  }
}

export class GetOrders {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(params: OrderParams): Promise<PaginatedResponse<OrderModel>> {
    return await this.orderRepository.getOrders(params);
  }
}

export class SubmitOrder {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string): Promise<void> {
    await this.orderRepository.submitOrder(id);
  }
}

export class PayOrder {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string, input: ProcessPaymentInput): Promise<void> {
    await this.orderRepository.payOrder(id, input);
  }
}

export class GetOrderSpk {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string): Promise<OrderSpkModel> {
    return await this.orderRepository.getOrderSpk(id);
  }
}

