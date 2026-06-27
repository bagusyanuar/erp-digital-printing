import type { FundTransferParams } from "@core/fund-transfer/applications/inputs/fund-transfer.input";

export const fundTransferKeys = {
  all: ["fundTransfer"] as const,
  lists: () => [...fundTransferKeys.all, "list"] as const,
  list: (params: FundTransferParams) => [...fundTransferKeys.lists(), params] as const,
  widgets: (params: { startDate?: string; endDate?: string }) => [...fundTransferKeys.all, "widgets", params] as const,
};
