import type { UserModel, RoleModel } from "../models/user.model";

export interface CreateUserInput {
  username: string;
  password?: string;
  roleIds: string[];
}

export interface UserRepository {
  getUsers(): Promise<UserModel[]>;
  createUser(input: CreateUserInput): Promise<UserModel>;
  getRoles(): Promise<RoleModel[]>;
}

