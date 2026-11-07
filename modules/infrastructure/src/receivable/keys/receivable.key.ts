import type {
  CustomerReceivableParams,
  SettledReceivableParams,
} from "@core/receivable/applications/inputs/receivable.input";

export const receivableKeys = {
  all: ["customer-receivables"] as const,
  lists: () => [...receivableKeys.all, "list"] as const,
  list: (params: CustomerReceivableParams) => [...receivableKeys.lists(), params] as const,
  settledLists: () => [...receivableKeys.all, "settled-list"] as const,
  settledList: (params: SettledReceivableParams) => [...receivableKeys.settledLists(), params] as const,
  summaries: () => [...receivableKeys.all, "summary"] as const,
  summary: () => [...receivableKeys.summaries()] as const,
};
