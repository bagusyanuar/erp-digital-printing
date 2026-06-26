import type { CapitalParams } from "@core/capital/applications/inputs/capital.input";

export const capitalKeys = {
  all: ["capital"] as const,
  lists: () => [...capitalKeys.all, "list"] as const,
  list: (params: CapitalParams) => [...capitalKeys.lists(), params] as const,
};
