import { type HttpClient } from "@erp-digital-printing/http";
import { GetResellers, CreateReseller, GetResellerById, UpdateReseller, DeleteReseller } from "@core/reseller/applications/usecases/reseller.usecase";
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

export function updateResellerUseCase(http: HttpClient): UpdateReseller {
  const repository = new ApiResellerRepository(http);
  return new UpdateReseller(repository);
}

export function deleteResellerUseCase(http: HttpClient): DeleteReseller {
  const repository = new ApiResellerRepository(http);
  return new DeleteReseller(repository);
}
