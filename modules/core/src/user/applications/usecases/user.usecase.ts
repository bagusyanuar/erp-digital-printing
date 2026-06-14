import type { UserRepository } from "../../domains/repositories/user.repository";
import type { UserModel } from "../../domains/models/user.model";

export class GetUsers {
  constructor(private readonly repository: UserRepository) {}
  async execute(): Promise<UserModel[]> {
    return await this.repository.getUsers();
  }
}
