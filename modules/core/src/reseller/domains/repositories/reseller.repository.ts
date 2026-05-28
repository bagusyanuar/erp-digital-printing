import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { ResellerParams, CreateResellerInput } from "../../applications/inputs";
import type { ResellerModel } from "../models";

export interface ResellerRepository {
  getResellers(
    params: ResellerParams,
  ): Promise<PaginatedResponse<ResellerModel>>;
  getResellerById(id: string): Promise<ResellerModel>;
  create(input: CreateResellerInput): Promise<ResellerModel>;
  update(id: string, input: CreateResellerInput): Promise<ResellerModel>;
  delete(id: string): Promise<void>;
}
