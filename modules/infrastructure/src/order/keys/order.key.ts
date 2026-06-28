import type { OrderParams, OrderReportWidgetsParams, SalesReportWidgetsParams, SalesTrendParams, CategorySalesParams, PaymentSalesParams } from "@core/order/domains/repositories/order.repository";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params: OrderParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  spk: (id: string) => [...orderKeys.all, "spk", id] as const,
  payments: (id: string) => [...orderKeys.all, "payments", id] as const,
  reportWidgets: (params: OrderReportWidgetsParams) => [...orderKeys.all, "reportWidgets", params] as const,
  salesReportWidgets: (params: SalesReportWidgetsParams) => [...orderKeys.all, "salesReportWidgets", params] as const,
  salesTrend: (params: SalesTrendParams) => [...orderKeys.all, "salesTrend", params] as const,
  categorySales: (params: CategorySalesParams) => [...orderKeys.all, "categorySales", params] as const,
  paymentSales: (params: PaymentSalesParams) => [...orderKeys.all, "paymentSales", params] as const,
};

