import { useQuery } from "@tanstack/react-query";
import { useDI } from "../../shared/di/DIContext";
import { orderKeys } from "@infrastructure/order/keys";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { OrderModel } from "@core/order/domains/models/order.model";
import type { AppError } from "@core/shared/errors/domain.error";

export const useRecentOrders = () => {
  const { getOrdersUseCase } = useDI().order;

  return useQuery<PaginatedResponse<OrderModel>, AppError>({
    queryKey: orderKeys.list({
      page: 1,
      limit: 5,
      status: "IN_PRODUCTION,READY_FOR_PICKUP,COMPLETED",
    }),
    queryFn: () =>
      getOrdersUseCase.execute({
        page: 1,
        limit: 5,
        status: "IN_PRODUCTION,READY_FOR_PICKUP,COMPLETED",
      }),
    staleTime: 10_000,
    gcTime: 30_000,
    refetchOnWindowFocus: false,
  });
};
