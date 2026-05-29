import type { AttributeParams } from "@core/attribute/applications/inputs";

export const attributeKeys = {
  all: ["attributes"] as const,
  lists: () => [...attributeKeys.all, "list"] as const,
  list: (params: AttributeParams) => [...attributeKeys.lists(), params] as const,
  details: () => [...attributeKeys.all, "detail"] as const,
  detail: (id: string) => [...attributeKeys.details(), id] as const,
};
