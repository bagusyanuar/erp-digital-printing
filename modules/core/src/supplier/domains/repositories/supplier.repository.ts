import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { SupplierParams, CreateSupplierInput } from "../../applications/inputs";
import type { SupplierModel } from "../models";

export interface SupplierRepository {
  getSuppliers(
    params: SupplierParams,
  ): Promise<PaginatedResponse<SupplierModel>>;
  getSupplierById(id: string): Promise<SupplierModel>;
  create(input: CreateSupplierInput): Promise<SupplierModel>;
  update(id: string, input: CreateSupplierInput): Promise<SupplierModel>;
  delete(id: string): Promise<void>;
}
