import type { LoginInput } from "@core/auth/applications/inputs";
import type { LoginModel } from "@core/auth/domains/models";

export interface AuthRepository {
  login(input: LoginInput): Promise<LoginModel>;
}
