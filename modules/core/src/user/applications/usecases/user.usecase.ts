import type { UserRepository, CreateUserInput } from "../../domains/repositories/user.repository";
import type { UserModel, RoleModel } from "../../domains/models/user.model";

export class GetUsers {
  constructor(private readonly repository: UserRepository) {}
  async execute(): Promise<UserModel[]> {
    return await this.repository.getUsers();
  }
}

export class CreateUser {
  constructor(private readonly repository: UserRepository) {}
  async execute(input: CreateUserInput): Promise<UserModel> {
    return await this.repository.createUser(input);
  }
}

export class GetRoles {
  constructor(private readonly repository: UserRepository) {}
  async execute(): Promise<RoleModel[]> {
    return await this.repository.getRoles();
  }
}

