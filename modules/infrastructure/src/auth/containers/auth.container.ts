import { ApiAuthRepository } from "@infrastructure/auth/repositories/auth.repository";
import { Login, Refresh, Logout } from "@core/auth/applications/usecases/auth.usecase";
import { type HttpClient } from "@erp-digital-printing/http";

/**
 * createLoginUseCase
 */
export function createLoginUseCase(http: HttpClient): Login {
  const repository = new ApiAuthRepository(http);
  return new Login(repository);
}

/**
 * createRefreshUseCase
 */
export function createRefreshUseCase(http: HttpClient): Refresh {
  const repository = new ApiAuthRepository(http);
  return new Refresh(repository);
}

/**
 * createLogoutUseCase
 */
export function createLogoutUseCase(http: HttpClient): Logout {
  const repository = new ApiAuthRepository(http);
  return new Logout(repository);
}
