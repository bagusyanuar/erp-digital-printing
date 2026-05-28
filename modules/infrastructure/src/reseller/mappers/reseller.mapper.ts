import type { ResellerParams, CreateResellerInput } from "@core/reseller/applications/inputs";
import type { ResellerQuery, ResellerResponse, CreateResellerRequest } from "../schemas";
import type { ResellerModel } from "@core/reseller/domains/models";

export function mapResellerParamToQuery(params: ResellerParams): ResellerQuery {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search,
    sort: params.sort,
    order: params.sortBy,
  };
}

export function mapResellerResponseToModel(
  response: ResellerResponse,
): ResellerModel {
  return {
    id: response.id,
    name: response.name,
    email: response.email,
    phone: response.phone,
    address: response.address,
    creditLimit: response.credit_limit,
  };
}

export function mapCreateInputToRequest(
  input: CreateResellerInput,
): CreateResellerRequest {
  return {
    customer_level_id: "d2c67ef8-82e4-4d8b-968b-5a1e2f5b6154",
    name: input.name,
    email: input.email,
    phone: input.phone,
    address: input.address,
    credit_limit: input.creditLimit,
  };
}
