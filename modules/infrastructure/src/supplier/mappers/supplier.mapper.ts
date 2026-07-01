import type { SupplierParams, CreateSupplierInput } from "@core/supplier/applications/inputs";
import type { SupplierQuery, SupplierResponse, CreateSupplierRequest } from "../schemas";
import type { SupplierModel } from "@core/supplier/domains/models";

export function mapSupplierParamToQuery(params: SupplierParams): SupplierQuery {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search,
    sort_by: params.sortBy,
    sort_order: params.sortOrder,
  };
}

export function mapSupplierResponseToModel(
  response: SupplierResponse,
): SupplierModel {
  return {
    id: response.id,
    name: response.name,
    contactName: response.contact_name,
    phone: response.phone,
    email: response.email,
    address: response.address,
    createdAt: response.created_at,
  };
}

export function mapCreateInputToRequest(
  input: CreateSupplierInput,
): CreateSupplierRequest {
  return {
    name: input.name,
    contact_name: input.contactName,
    phone: input.phone,
    email: input.email || null,
    address: input.address,
  };
}
