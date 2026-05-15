import type { LoginInput } from "@core/auth/applications/inputs";
import type { LoginModel } from "@core/auth/domains/models";
import type { AuthRepository } from "@core/auth/domains/repositories/auth.repository";

export class Login {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: LoginInput): Promise<LoginModel> {
    return await this.authRepository.login(input);
  }
}

export class Refresh {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<LoginModel> {
    return await this.authRepository.refresh();
  }
}

export class Logout {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    return await this.authRepository.logout();
  }
}
