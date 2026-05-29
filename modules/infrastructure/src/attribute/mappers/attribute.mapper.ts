import type { AttributeParams, CreateAttributeInput } from "@core/attribute/applications/inputs";
import type { AttributeQuery, AttributeResponse, CreateAttributeRequest } from "../schemas";
import type { AttributeModel } from "@core/attribute/domains/models";

export function mapAttributeParamToQuery(params: AttributeParams): AttributeQuery {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search,
    sort: params.sort,
    order: params.sortBy,
  };
}

export function mapAttributeResponseToModel(
  response: AttributeResponse,
): AttributeModel {
  return {
    id: response.id,
    name: response.name,
    value_type: response.value_type,
    options: response.options?.map((opt) => opt.value) ?? [],
  };
}

export function mapCreateAttributeInputToRequest(
  input: CreateAttributeInput,
): CreateAttributeRequest {
  return {
    name: input.name,
    value_type: input.value_type || "text",
    options: input.options,
  };
}
