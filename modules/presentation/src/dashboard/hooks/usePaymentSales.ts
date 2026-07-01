import { useQuery } from "@tanstack/react-query";
import { useOrderDI } from "../../order/hooks/useOrderDI";
import { orderKeys } from "@infrastructure/order/keys";
import type { PaymentSalesItem } from "@core/order/domains/repositories/order.repository";
import type { AppError } from "@core/shared/errors/domain.error";

export const usePaymentSales = (startDate?: string, endDate?: string) => {
  const { getPaymentSalesUseCase } = useOrderDI();

  return useQuery<PaymentSalesItem[], AppError>({
    queryKey: orderKeys.paymentSales({ start_date: startDate, end_date: endDate }),
    queryFn: () => getPaymentSalesUseCase.execute({ start_date: startDate, end_date: endDate }),
    staleTime: 10_000,
    gcTime: 30_000,
    refetchOnWindowFocus: false,
  });
};
