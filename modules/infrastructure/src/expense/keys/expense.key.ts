import type { ExpenseQueryParams } from "@core/expense/applications/inputs/expense.input";
import type { ExpenseReportWidgetsParams } from "@core/expense/domains/repositories/expense.repository";

export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (params: ExpenseQueryParams) => [...expenseKeys.lists(), params] as const,
  details: () => [...expenseKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  reportWidgets: (params: ExpenseReportWidgetsParams) => [...expenseKeys.all, "reportWidgets", params] as const,
};
