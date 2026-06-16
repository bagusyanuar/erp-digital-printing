import type { ExpenseCategoryParams } from "@core/expense-category/applications/inputs";

export const expenseCategoryKeys = {
  all: ["expense-categories"] as const,
  lists: () => [...expenseCategoryKeys.all, "list"] as const,
  list: (params: ExpenseCategoryParams) => [...expenseCategoryKeys.lists(), params] as const,
  details: () => [...expenseCategoryKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseCategoryKeys.details(), id] as const,
};
