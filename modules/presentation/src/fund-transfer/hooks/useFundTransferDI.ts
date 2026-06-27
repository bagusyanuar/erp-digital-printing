import { useDI } from "@presentation/shared/di/DIContext";

export function useFundTransferDI() {
  const { fundTransfer } = useDI();
  return fundTransfer;
}
