import type { UserModel, RoleModel } from "../models/user.model";

export interface CreateUserInput {
  username: string;
  password?: string;
  roleIds: string[];
}

export interface UpdateUserInput {
  id: string;
  username: string;
  password?: string;
  roleIds?: string[];
}

export interface ChangeUserPasswordInput {
  id: string;
  username: string;
  password: string;
}

export interface UserRepository {
  getUsers(): Promise<UserModel[]>;
  createUser(input: CreateUserInput): Promise<UserModel>;
  updateUser(input: UpdateUserInput): Promise<UserModel>;
  changePassword(input: ChangeUserPasswordInput): Promise<UserModel>;
  deleteUser(id: string): Promise<void>;
  getRoles(): Promise<RoleModel[]>;
  getProfile(): Promise<UserModel>;
}

