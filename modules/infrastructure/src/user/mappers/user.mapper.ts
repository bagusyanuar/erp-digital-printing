import type { UserResponse, RoleResponse } from "../schemas/user.schema";
import type { UserModel, RoleModel } from "@core/user/domains/models/user.model";

export function mapRoleResponseToModel(res: RoleResponse): RoleModel {
  return {
    id: res.id,
    name: res.name,
  };
}

export function mapUserResponseToModel(res: UserResponse): UserModel {
  return {
    id: res.id,
    username: res.username,
    roles: res.roles?.map(mapRoleResponseToModel),
  };
}
