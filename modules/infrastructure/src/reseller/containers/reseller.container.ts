import { type HttpClient } from "@erp-digital-printing/http";
import { GetResellers } from "@core/reseller/applications/usecases/reseller.usecase";
import { ApiResellerRepository } from "../repositories/reseller.repository";

export function getResellerUseCase(http: HttpClient): GetResellers {
  const repository = new ApiResellerRepository(http);
  return new GetResellers(repository);
}
