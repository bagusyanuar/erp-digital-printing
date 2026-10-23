import type { HttpClient } from "@erp-digital-printing/http";
import type {
  UserRepository,
  CreateUserInput,
  UpdateUserInput,
  ChangeUserPasswordInput,
} from "@core/user/domains/repositories/user.repository";
import type { UserModel, RoleModel } from "@core/user/domains/models/user.model";
import type { ApiResponse } from "../../libs/api-response";
import { safeApiCall } from "../../libs/error";
import type { UserResponse } from "../schemas/user.schema";
import { mapUserResponseToModel } from "../mappers/user.mapper";

export class ApiUserRepository implements UserRepository {
  constructor(private readonly http: HttpClient) {}

  async getUsers(): Promise<UserModel[]> {
    return safeApiCall(async () => {
      const response = await this.http.get<ApiResponse<UserResponse[]>>("/users");
      return response.data.map(mapUserResponseToModel);
    });
  }

  async createUser(input: CreateUserInput): Promise<UserModel> {
    return safeApiCall(async () => {
      const response = await this.http.post<ApiResponse<UserResponse>>("/users", {
        username: input.username,
        password: input.password,
        role_ids: input.roleIds,
      });
      return mapUserResponseToModel(response.data);
    });
  }

  async updateUser(input: UpdateUserInput): Promise<UserModel> {
    return safeApiCall(async () => {
      const response = await this.http.put<ApiResponse<UserResponse>>(`/users/${input.id}`, {
        username: input.username,
        password: input.password,
        role_ids: input.roleIds,
      });
      return mapUserResponseToModel(response.data);
    });
  }

  async changePassword(input: ChangeUserPasswordInput): Promise<UserModel> {
    return safeApiCall(async () => {
      const response = await this.http.put<ApiResponse<UserResponse>>(`/users/${input.id}`, {
        username: input.username,
        password: input.password,
      });
      return mapUserResponseToModel(response.data);
    });
  }

  async deleteUser(id: string): Promise<void> {
    return safeApiCall(async () => {
      await this.http.delete(`/users/${id}`);
    });
  }

  async getRoles(): Promise<RoleModel[]> {
    return safeApiCall(async () => {
      const response = await this.http.get<ApiResponse<RoleModel[]>>("/rbac/roles");
      return response.data;
    });
  }

  async getProfile(): Promise<UserModel> {
    return safeApiCall(async () => {
      const response = await this.http.get<ApiResponse<UserResponse>>("/me");
      return mapUserResponseToModel(response.data);
    });
  }
}

