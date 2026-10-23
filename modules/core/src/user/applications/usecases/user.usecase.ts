import type {
  UserRepository,
  CreateUserInput,
  UpdateUserInput,
  ChangeUserPasswordInput,
} from "../../domains/repositories/user.repository";
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

export class UpdateUser {
  constructor(private readonly repository: UserRepository) {}
  async execute(input: UpdateUserInput): Promise<UserModel> {
    return await this.repository.updateUser(input);
  }
}

export class ChangeUserPassword {
  constructor(private readonly repository: UserRepository) {}
  async execute(input: ChangeUserPasswordInput): Promise<UserModel> {
    return await this.repository.changePassword(input);
  }
}

export class DeleteUser {
  constructor(private readonly repository: UserRepository) {}
  async execute(id: string): Promise<void> {
    return await this.repository.deleteUser(id);
  }
}

export class GetRoles {
  constructor(private readonly repository: UserRepository) {}
  async execute(): Promise<RoleModel[]> {
    return await this.repository.getRoles();
  }
}

export class GetProfile {
  constructor(private readonly repository: UserRepository) {}
  async execute(): Promise<UserModel> {
    return await this.repository.getProfile();
  }
}

