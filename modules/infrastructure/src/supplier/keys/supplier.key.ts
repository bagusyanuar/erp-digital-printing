import type { SupplierParams } from "@core/supplier/applications/inputs";

export const supplierKeys = {
  all: ["suppliers"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
  list: (params: SupplierParams) => [...supplierKeys.lists(), params] as const,
  details: () => [...supplierKeys.all, "detail"] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
};
