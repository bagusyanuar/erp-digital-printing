import { type HttpClient } from "@erp-digital-printing/http";
import { ApiUserRepository } from "../repositories/user.repository";
import { GetUsers, CreateUser, GetRoles } from "@core/user/applications/usecases/user.usecase";

export function getUsersUseCase(http: HttpClient) {
  return new GetUsers(new ApiUserRepository(http));
}

export function createUserUseCase(http: HttpClient) {
  return new CreateUser(new ApiUserRepository(http));
}

export function getRolesUseCase(http: HttpClient) {
  return new GetRoles(new ApiUserRepository(http));
}

