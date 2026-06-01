import { ApiOrderRepository } from "../repositories/order.repository";
import { SaveDraftOrder, GetOrders, SubmitOrder, PayOrder } from "@core/order/applications/usecases/order.usecase";
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
