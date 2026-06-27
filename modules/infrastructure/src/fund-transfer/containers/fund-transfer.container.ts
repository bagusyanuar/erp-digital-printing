import { GetFundTransfers, CreateFundTransfer, GetFundTransferWidgets } from "@core/fund-transfer/applications/usecases/fund-transfer.usecase";
import { ApiFundTransferRepository } from "../repositories/fund-transfer.repository";
import { type HttpClient } from "@erp-digital-printing/http";

export function getFundTransfersUseCase(http: HttpClient): GetFundTransfers {
  const repository = new ApiFundTransferRepository(http);
  return new GetFundTransfers(repository);
}

export function createFundTransferUseCase(http: HttpClient): CreateFundTransfer {
  const repository = new ApiFundTransferRepository(http);
  return new CreateFundTransfer(repository);
}

export function getFundTransferWidgetsUseCase(http: HttpClient): GetFundTransferWidgets {
  const repository = new ApiFundTransferRepository(http);
  return new GetFundTransferWidgets(repository);
}
