import { type HttpClient } from "@erp-digital-printing/http";
import { ApiUserRepository } from "../repositories/user.repository";
import { GetUsers } from "@core/user/applications/usecases/user.usecase";

export function getUsersUseCase(http: HttpClient) {
  return new GetUsers(new ApiUserRepository(http));
}
