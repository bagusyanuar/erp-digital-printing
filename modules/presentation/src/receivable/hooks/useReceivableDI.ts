import { useDI } from "@presentation/shared/di/DIContext";

export function useReceivableDI() {
  const { receivable } = useDI();
  return receivable;
}

