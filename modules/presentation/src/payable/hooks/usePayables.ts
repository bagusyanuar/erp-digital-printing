import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePayableDI } from "./usePayableDI";
import { payableKeys } from "@infrastructure/payable/keys/payable.key";
import type {
  VendorPayableParams,
  SettledPayableParams,
  PayVendorExpenseInput,
} from "@core/payable/applications/inputs/payable.input";
import type {
  VendorPayableModel,
  VendorPayableSummaryModel,
  PayableExpenseItemModel,
  SettledExpensePayableModel,
} from "@core/payable/domains/models/payable.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { toast } from "@erp-digital-printing/ui/Toast";

export function useVendorPayablesList(params: VendorPayableParams) {
  const { getVendorPayablesUseCase } = usePayableDI();

  return useQuery<PaginatedResponse<VendorPayableModel>>({
    queryKey: payableKeys.list(params),
    queryFn: () => getVendorPayablesUseCase.execute(params),
    staleTime: 10_000,
  });
}

export function useSettledPayablesList(params: SettledPayableParams) {
  const { getSettledPayablesUseCase } = usePayableDI();

  return useQuery<PaginatedResponse<SettledExpensePayableModel>>({
    queryKey: payableKeys.settledList(params),
    queryFn: () => getSettledPayablesUseCase.execute(params),
    staleTime: 10_000,
  });
}

export function useVendorPayableSummary() {
  const { getVendorPayableSummaryUseCase } = usePayableDI();

  return useQuery<VendorPayableSummaryModel>({
    queryKey: payableKeys.summary(),
    queryFn: () => getVendorPayableSummaryUseCase.execute(),
    staleTime: 10_000,
  });
}

export function usePayVendorExpense() {
  const { payVendorExpenseUseCase } = usePayableDI();
  const queryClient = useQueryClient();

  return useMutation<
    { vendor: VendorPayableModel; expense: PayableExpenseItemModel },
    Error,
    PayVendorExpenseInput
  >({
    mutationFn: (input) => payVendorExpenseUseCase.execute(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: payableKeys.all });
      if (data.expense.remainingAmount === 0) {
        toast.success(`Nota ${data.expense.expenseNumber} berhasil dilunasi dan masuk ke Riwayat Hutang!`);
      } else {
        toast.success(`Pembayaran cicilan untuk nota ${data.expense.expenseNumber} berhasil dicatat.`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memproses pembayaran nota pengeluaran");
    },
  });
}

