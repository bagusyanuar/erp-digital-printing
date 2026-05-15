import { HttpClient } from "@erp-digital-printing/http";
import type { TokenGetter, TokenSetter } from "@erp-digital-printing/http";

/**
 * HttpClient Factory
 *
 * Factory function untuk membuat instance HttpClient.
 * Dependency (seperti TokenGetter/TokenSetter) di-inject dari luar (Composition Root),
 * sehingga layer Infrastructure tetap agnostik terhadap state management.
 */
export const createHttpClient = (
  getToken?: TokenGetter,
  onTokenRefreshed?: TokenSetter,
  onAuthFailure?: () => void | Promise<void>,
): HttpClient => new HttpClient({ getToken, onTokenRefreshed, onAuthFailure });
