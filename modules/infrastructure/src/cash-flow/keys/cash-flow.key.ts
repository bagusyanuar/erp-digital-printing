export const cashFlowKeys = {
  all: ["cashFlow"] as const,
  reports: (filter: Record<string, string | number | boolean | undefined>) => [...cashFlowKeys.all, "report", filter] as const,
  summaries: (filter: Record<string, string | number | boolean | undefined>) => [...cashFlowKeys.all, "summary", filter] as const,
  accounts: () => [...cashFlowKeys.all, "accounts"] as const,
};
