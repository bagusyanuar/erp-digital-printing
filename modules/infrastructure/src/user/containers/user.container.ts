import { type HttpClient } from "@erp-digital-printing/http";
import { ApiUserRepository } from "../repositories/user.repository";
import {
  GetUsers,
  CreateUser,
  UpdateUser,
  ChangeUserPassword,
  DeleteUser,
  GetRoles,
  GetProfile,
} from "@core/user/applications/usecases/user.usecase";

export function getUsersUseCase(http: HttpClient) {
  return new GetUsers(new ApiUserRepository(http));
}

export function createUserUseCase(http: HttpClient) {
  return new CreateUser(new ApiUserRepository(http));
}

export function updateUserUseCase(http: HttpClient) {
  return new UpdateUser(new ApiUserRepository(http));
}

export function changeUserPasswordUseCase(http: HttpClient) {
  return new ChangeUserPassword(new ApiUserRepository(http));
}

export function deleteUserUseCase(http: HttpClient) {
  return new DeleteUser(new ApiUserRepository(http));
}

export function getRolesUseCase(http: HttpClient) {
  return new GetRoles(new ApiUserRepository(http));
}

export function getProfileUseCase(http: HttpClient) {
  return new GetProfile(new ApiUserRepository(http));
}

