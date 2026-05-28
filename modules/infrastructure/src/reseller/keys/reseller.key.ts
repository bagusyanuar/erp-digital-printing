import type { ResellerParams } from "@core/reseller/applications/inputs";

export const resellerKeys = {
  all: ["resellers"] as const,
  lists: () => [...resellerKeys.all, "list"] as const,
  list: (params: ResellerParams) => [...resellerKeys.lists(), params] as const,
  details: () => [...resellerKeys.all, "detail"] as const,
  detail: (id: string) => [...resellerKeys.details(), id] as const,
};
