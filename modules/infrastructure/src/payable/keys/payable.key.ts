import type {
  VendorPayableParams,
  SettledPayableParams,
} from "@core/payable/applications/inputs/payable.input";

export const payableKeys = {
  all: ["vendor-payables"] as const,
  lists: () => [...payableKeys.all, "list"] as const,
  list: (params: VendorPayableParams) => [...payableKeys.lists(), params] as const,
  settledLists: () => [...payableKeys.all, "settled-list"] as const,
  settledList: (params: SettledPayableParams) => [...payableKeys.settledLists(), params] as const,
  summaries: () => [...payableKeys.all, "summary"] as const,
  summary: () => [...payableKeys.summaries()] as const,
};

