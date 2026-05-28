import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { ResellerParams } from "../../applications/inputs";
import type { ResellerModel } from "../models";

export interface ResellerRepository {
  getResellers(
    params: ResellerParams,
  ): Promise<PaginatedResponse<ResellerModel>>;
  getResellerById(id: string): Promise<ResellerModel>;
}
