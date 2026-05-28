import type { ResellerParams } from "@core/reseller/applications/inputs";
import type { ResellerQuery, ResellerResponse } from "../schemas";
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
