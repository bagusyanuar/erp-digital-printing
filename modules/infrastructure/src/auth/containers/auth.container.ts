import { ApiAuthRepository } from "@infrastructure/auth/repositories/auth.repository";
import { Login } from "@core/auth/applications/usecases/auth.usecase";
import { type HttpClient } from "@erp-digital-printing/http";

/**
 * createLoginUseCase
 *
 * Factory function untuk merakit dependency Login Use Case.
 * Bundler bisa men-tree-shake fungsi ini jika tidak dipanggil.
 */
export function createLoginUseCase(http: HttpClient): Login {
  const repository = new ApiAuthRepository(http);
  return new Login(repository);
}
