import type { UserModel } from "../models/user.model";

export interface UserRepository {
  getUsers(): Promise<UserModel[]>;
}
