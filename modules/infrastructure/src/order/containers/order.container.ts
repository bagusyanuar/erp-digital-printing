import { ApiOrderRepository } from "../repositories/order.repository";
import { SaveDraftOrder, GetOrders } from "@core/order/applications/usecases/order.usecase";
import type { HttpClient } from "@erp-digital-printing/http";

export function saveDraftUseCase(http: HttpClient): SaveDraftOrder {
  const repository = new ApiOrderRepository(http);
  return new SaveDraftOrder(repository);
}

export function getOrdersUseCase(http: HttpClient): GetOrders {
  const repository = new ApiOrderRepository(http);
  return new GetOrders(repository);
}
