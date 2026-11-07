import { useDI } from "@presentation/shared/di/DIContext";

export function usePayableDI() {
  const { payable } = useDI();
  return payable;
}

