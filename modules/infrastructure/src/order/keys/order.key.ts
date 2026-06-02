import type { OrderParams } from "@core/order/domains/repositories/order.repository";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params: OrderParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  spk: (id: string) => [...orderKeys.all, "spk", id] as const,
  payments: (id: string) => [...orderKeys.all, "payments", id] as const,
};
