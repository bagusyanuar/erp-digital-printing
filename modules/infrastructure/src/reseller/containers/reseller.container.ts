import { type HttpClient } from "@erp-digital-printing/http";
import { GetResellers, CreateReseller, GetResellerById } from "@core/reseller/applications/usecases/reseller.usecase";
import { ApiResellerRepository } from "../repositories/reseller.repository";

export function getResellerUseCase(http: HttpClient): GetResellers {
  const repository = new ApiResellerRepository(http);
  return new GetResellers(repository);
}

export function createResellerUseCase(http: HttpClient): CreateReseller {
  const repository = new ApiResellerRepository(http);
  return new CreateReseller(repository);
}

export function getResellerByIdUseCase(http: HttpClient): GetResellerById {
  const repository = new ApiResellerRepository(http);
  return new GetResellerById(repository);
}
