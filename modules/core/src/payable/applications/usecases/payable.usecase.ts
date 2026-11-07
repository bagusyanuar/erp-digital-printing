import type { PayableRepository } from "../../domains/repositories/payable.repository";
import type {
  VendorPayableModel,
  VendorPayableSummaryModel,
  PayableExpenseItemModel,
  SettledExpensePayableModel,
} from "../../domains/models/payable.model";
import type {
  VendorPayableParams,
  SettledPayableParams,
  PayVendorExpenseInput,
} from "../inputs/payable.input";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export class GetVendorPayables {
  constructor(private readonly payableRepository: PayableRepository) {}

  async execute(
    params: VendorPayableParams,
  ): Promise<PaginatedResponse<VendorPayableModel>> {
    return await this.payableRepository.getVendorPayables(params);
  }
}

export class GetSettledPayables {
  constructor(private readonly payableRepository: PayableRepository) {}

  async execute(
    params: SettledPayableParams,
  ): Promise<PaginatedResponse<SettledExpensePayableModel>> {
    return await this.payableRepository.getSettledPayables(params);
  }
}

export class GetVendorPayableSummary {
  constructor(private readonly payableRepository: PayableRepository) {}

  async execute(): Promise<VendorPayableSummaryModel> {
    return await this.payableRepository.getVendorPayableSummary();
  }
}

export class PayVendorExpense {
  constructor(private readonly payableRepository: PayableRepository) {}

  async execute(
    input: PayVendorExpenseInput,
  ): Promise<{ vendor: VendorPayableModel; expense: PayableExpenseItemModel }> {
    return await this.payableRepository.payVendorExpense(input);
  }
}

