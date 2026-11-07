import type { ReceivableRepository } from "../../domains/repositories/receivable.repository";
import type {
  CustomerReceivableModel,
  CustomerReceivableSummaryModel,
  ReceivableInvoiceItemModel,
  SettledInvoiceReceivableModel,
} from "../../domains/models/receivable.model";
import type {
  CustomerReceivableParams,
  SettledReceivableParams,
  PayCustomerInvoiceInput,
} from "../inputs/receivable.input";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export class GetCustomerReceivables {
  constructor(private readonly receivableRepository: ReceivableRepository) {}

  async execute(
    params: CustomerReceivableParams,
  ): Promise<PaginatedResponse<CustomerReceivableModel>> {
    return await this.receivableRepository.getCustomerReceivables(params);
  }
}

export class GetSettledReceivables {
  constructor(private readonly receivableRepository: ReceivableRepository) {}

  async execute(
    params: SettledReceivableParams,
  ): Promise<PaginatedResponse<SettledInvoiceReceivableModel>> {
    return await this.receivableRepository.getSettledReceivables(params);
  }
}

export class GetCustomerReceivableSummary {
  constructor(private readonly receivableRepository: ReceivableRepository) {}

  async execute(): Promise<CustomerReceivableSummaryModel> {
    return await this.receivableRepository.getCustomerReceivableSummary();
  }
}

export class PayCustomerInvoice {
  constructor(private readonly receivableRepository: ReceivableRepository) {}

  async execute(
    input: PayCustomerInvoiceInput,
  ): Promise<{ customer: CustomerReceivableModel; invoice: ReceivableInvoiceItemModel }> {
    return await this.receivableRepository.payCustomerInvoice(input);
  }
}
