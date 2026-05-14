import type { LoginInput } from "@core/auth/applications/inputs";
import type { LoginModel } from "@core/auth/domains/models";
import type { AuthRepository } from "@core/auth/domains/repositories/auth.repository";

export class Login {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: LoginInput): Promise<LoginModel> {
    return await this.authRepository.login(input);
  }
}
