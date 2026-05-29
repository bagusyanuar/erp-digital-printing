import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { AttributeParams, CreateAttributeInput } from "@core/attribute/applications/inputs";
import type { AttributeModel } from "../models";

export interface AttributeRepository {
  getAttributes(
    params: AttributeParams,
  ): Promise<PaginatedResponse<AttributeModel>>;
  getAttributeById(id: string): Promise<AttributeModel>;
  create(input: CreateAttributeInput): Promise<AttributeModel>;
  update(id: string, input: CreateAttributeInput): Promise<AttributeModel>;
  delete(id: string): Promise<void>;
}
