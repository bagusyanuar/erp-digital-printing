import type { PaginatedResponse } from "@core/shared/api/pagination";
import type {
  CustomerReceivableModel,
  CustomerReceivableSummaryModel,
  ReceivableInvoiceItemModel,
  SettledInvoiceReceivableModel,
} from "../models/receivable.model";
import type {
  CustomerReceivableParams,
  SettledReceivableParams,
  PayCustomerInvoiceInput,
} from "../../applications/inputs/receivable.input";

export interface ReceivableRepository {
  getCustomerReceivables(
    params: CustomerReceivableParams,
  ): Promise<PaginatedResponse<CustomerReceivableModel>>;
  getSettledReceivables(
    params: SettledReceivableParams,
  ): Promise<PaginatedResponse<SettledInvoiceReceivableModel>>;
  getCustomerReceivableSummary(): Promise<CustomerReceivableSummaryModel>;
  payCustomerInvoice(
    input: PayCustomerInvoiceInput,
  ): Promise<{ customer: CustomerReceivableModel; invoice: ReceivableInvoiceItemModel }>;
}
