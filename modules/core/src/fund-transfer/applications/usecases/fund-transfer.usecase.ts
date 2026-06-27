import type { FundTransferRepository, FundTransferWidgetsParams, FundTransferWidgetsModel } from "../../domains/repositories/fund-transfer.repository";
import type { FundTransferModel } from "../../domains/models/fund-transfer.model";
import type { FundTransferParams, CreateFundTransferInput } from "../inputs/fund-transfer.input";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export class GetFundTransfers {
  constructor(private readonly fundTransferRepository: FundTransferRepository) {}

  async execute(params: FundTransferParams): Promise<PaginatedResponse<FundTransferModel>> {
    return await this.fundTransferRepository.getFundTransfers(params);
  }
}

export class CreateFundTransfer {
  constructor(private readonly fundTransferRepository: FundTransferRepository) {}

  async execute(input: CreateFundTransferInput): Promise<FundTransferModel> {
    return await this.fundTransferRepository.createFundTransfer(input);
  }
}

export class GetFundTransferWidgets {
  constructor(private readonly fundTransferRepository: FundTransferRepository) {}

  async execute(params: FundTransferWidgetsParams): Promise<FundTransferWidgetsModel> {
    return await this.fundTransferRepository.getFundTransferWidgets(params);
  }
}
