import { ApiOrderRepository } from "../repositories/order.repository";
import { SaveDraftOrder, GetOrders, SubmitOrder, PayOrder, RepayOrder, RefundOrder, GetOrderSpk, GetOrderPayments, UpdateOrderStatus, GetOrderById, UpdateOrder, GetOrderReportWidgets } from "@core/order/applications/usecases/order.usecase";
import type { HttpClient } from "@erp-digital-printing/http";


export function saveDraftUseCase(http: HttpClient): SaveDraftOrder {
  const repository = new ApiOrderRepository(http);
  return new SaveDraftOrder(repository);
}

export function getOrdersUseCase(http: HttpClient): GetOrders {
  const repository = new ApiOrderRepository(http);
  return new GetOrders(repository);
}

export function submitOrderUseCase(http: HttpClient): SubmitOrder {
  const repository = new ApiOrderRepository(http);
  return new SubmitOrder(repository);
}

export function payOrderUseCase(http: HttpClient): PayOrder {
  const repository = new ApiOrderRepository(http);
  return new PayOrder(repository);
}

export function repayOrderUseCase(http: HttpClient): RepayOrder {
  const repository = new ApiOrderRepository(http);
  return new RepayOrder(repository);
}

export function getOrderPaymentsUseCase(http: HttpClient): GetOrderPayments {
  const repository = new ApiOrderRepository(http);
  return new GetOrderPayments(repository);
}

export function getOrderSpkUseCase(http: HttpClient): GetOrderSpk {
  const repository = new ApiOrderRepository(http);
  return new GetOrderSpk(repository);
}

export function updateOrderStatusUseCase(http: HttpClient): UpdateOrderStatus {
  const repository = new ApiOrderRepository(http);
  return new UpdateOrderStatus(repository);
}

export function getOrderByIdUseCase(http: HttpClient): GetOrderById {
  const repository = new ApiOrderRepository(http);
  return new GetOrderById(repository);
}

export function updateOrderUseCase(http: HttpClient): UpdateOrder {
  const repository = new ApiOrderRepository(http);
  return new UpdateOrder(repository);
}

export function getOrderReportWidgetsUseCase(http: HttpClient): GetOrderReportWidgets {
  const repository = new ApiOrderRepository(http);
  return new GetOrderReportWidgets(repository);
}

export function refundOrderUseCase(http: HttpClient): RefundOrder {
  const repository = new ApiOrderRepository(http);
  return new RefundOrder(repository);
}


