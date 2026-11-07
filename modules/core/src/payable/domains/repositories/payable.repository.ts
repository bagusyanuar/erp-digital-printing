import type { PaginatedResponse } from "@core/shared/api/pagination";
import type {
  VendorPayableModel,
  VendorPayableSummaryModel,
  PayableExpenseItemModel,
  SettledExpensePayableModel,
} from "../models/payable.model";
import type {
  VendorPayableParams,
  SettledPayableParams,
  PayVendorExpenseInput,
} from "../../applications/inputs/payable.input";

export interface PayableRepository {
  getVendorPayables(
    params: VendorPayableParams,
  ): Promise<PaginatedResponse<VendorPayableModel>>;
  getSettledPayables(
    params: SettledPayableParams,
  ): Promise<PaginatedResponse<SettledExpensePayableModel>>;
  getVendorPayableSummary(): Promise<VendorPayableSummaryModel>;
  payVendorExpense(
    input: PayVendorExpenseInput,
  ): Promise<{ vendor: VendorPayableModel; expense: PayableExpenseItemModel }>;
}

