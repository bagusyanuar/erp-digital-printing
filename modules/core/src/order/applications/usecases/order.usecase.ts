import type { OrderRepository, OrderParams, ProcessPaymentInput, RepayPaymentInput, OrderReportWidgetsParams, OrderReportWidgetsModel } from "../../domains/repositories/order.repository";
import type { SaveDraftOrderInput } from "../inputs/order.input";
import type { OrderModel, OrderSpkModel, OrderPaymentModel } from "../../domains/models/order.model";
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

export class RepayOrder {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string, input: RepayPaymentInput): Promise<void> {
    await this.orderRepository.repayOrder(id, input);
  }
}

export class GetOrderSpk {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string): Promise<OrderSpkModel> {
    return await this.orderRepository.getOrderSpk(id);
  }
}

export class GetOrderPayments {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string): Promise<OrderPaymentModel[]> {
    return await this.orderRepository.getOrderPayments(id);
  }
}

export class UpdateOrderStatus {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string, status: string): Promise<void> {
    await this.orderRepository.updateOrderStatus(id, status);
  }
}

export class GetOrderById {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string): Promise<OrderModel> {
    return await this.orderRepository.getOrderById(id);
  }
}

export class UpdateOrder {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string, input: SaveDraftOrderInput): Promise<void> {
    await this.orderRepository.updateOrder(id, input);
  }
}

export class GetOrderReportWidgets {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(params: OrderReportWidgetsParams): Promise<OrderReportWidgetsModel> {
    return await this.orderRepository.getOrderReportWidgets(params);
  }
}


