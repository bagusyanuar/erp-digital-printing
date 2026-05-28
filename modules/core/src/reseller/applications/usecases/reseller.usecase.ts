import type { ResellerRepository } from "../../domains/repositories";
import type { ResellerModel } from "../../domains/models";
import type { ResellerParams } from "../inputs";
import type { PaginatedResponse } from "@core/shared/api/pagination";

export class GetResellers {
  constructor(private readonly resellerRepository: ResellerRepository) {}

  async execute(
    params: ResellerParams,
  ): Promise<PaginatedResponse<ResellerModel>> {
    return await this.resellerRepository.getResellers(params);
  }
}

export class GetResellerById {
  constructor(private readonly resellerRepository: ResellerRepository) {}

  async execute(id: string): Promise<ResellerModel> {
    return await this.resellerRepository.getResellerById(id);
  }
}
