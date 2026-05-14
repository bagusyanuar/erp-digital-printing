import { HttpClient } from "@erp-digital-printing/http";
import type { TokenGetter } from "@erp-digital-printing/http";

/**
 * HttpClient Factory
 *
 * Factory function untuk membuat instance HttpClient.
 * Dependency (seperti TokenGetter) di-inject dari luar (Composition Root),
 * sehingga layer Infrastructure tetap agnostik terhadap state management.
 */
export const createHttpClient = (getToken?: TokenGetter): HttpClient =>
  new HttpClient({ getToken });
