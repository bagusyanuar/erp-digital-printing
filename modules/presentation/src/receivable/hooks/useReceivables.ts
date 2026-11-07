import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useReceivableDI } from "./useReceivableDI";
import { receivableKeys } from "@infrastructure/receivable/keys/receivable.key";
import type {
  CustomerReceivableParams,
  SettledReceivableParams,
  PayCustomerInvoiceInput,
} from "@core/receivable/applications/inputs/receivable.input";
import type {
  CustomerReceivableModel,
  CustomerReceivableSummaryModel,
  ReceivableInvoiceItemModel,
  SettledInvoiceReceivableModel,
} from "@core/receivable/domains/models/receivable.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import { toast } from "@erp-digital-printing/ui/Toast";

export function useCustomerReceivablesList(params: CustomerReceivableParams) {
  const { getCustomerReceivablesUseCase } = useReceivableDI();

  return useQuery<PaginatedResponse<CustomerReceivableModel>>({
    queryKey: receivableKeys.list(params),
    queryFn: () => getCustomerReceivablesUseCase.execute(params),
    staleTime: 10_000,
  });
}

export function useSettledReceivablesList(params: SettledReceivableParams) {
  const { getSettledReceivablesUseCase } = useReceivableDI();

  return useQuery<PaginatedResponse<SettledInvoiceReceivableModel>>({
    queryKey: receivableKeys.settledList(params),
    queryFn: () => getSettledReceivablesUseCase.execute(params),
    staleTime: 10_000,
  });
}

export function useCustomerReceivableSummary() {
  const { getCustomerReceivableSummaryUseCase } = useReceivableDI();

  return useQuery<CustomerReceivableSummaryModel>({
    queryKey: receivableKeys.summary(),
    queryFn: () => getCustomerReceivableSummaryUseCase.execute(),
    staleTime: 10_000,
  });
}

export function usePayCustomerInvoice() {
  const { payCustomerInvoiceUseCase } = useReceivableDI();
  const queryClient = useQueryClient();

  return useMutation<
    { customer: CustomerReceivableModel; invoice: ReceivableInvoiceItemModel },
    Error,
    PayCustomerInvoiceInput
  >({
    mutationFn: (input) => payCustomerInvoiceUseCase.execute(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: receivableKeys.all });
      if (data.invoice.remainingAmount === 0) {
        toast.success(`Nota ${data.invoice.invoiceNumber} berhasil dilunasi dan masuk ke Riwayat Piutang!`);
      } else {
        toast.success(`Pembayaran cicilan untuk nota ${data.invoice.invoiceNumber} berhasil dicatat.`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memproses pembayaran nota piutang");
    },
  });
}
