import type { HttpClient } from "@erp-digital-printing/http";
import type { AuthRepository } from "@core/auth/domains/repositories/auth.repository";
import type { LoginInput } from "@core/auth/applications/inputs/auth.input";
import type { LoginModel } from "@core/auth/domains/models/auth.model";
import type { LoginResponse } from "@infrastructure/auth/schemas";
import {
  mapLoginInputToRequest,
  mapLoginResponseToModel,
} from "@infrastructure/auth/mappers";
import { safeApiCall } from "@infrastructure/libs/error";
import type { ApiResponse } from "@infrastructure/libs/api-response";

/**
 * ApiAuthRepository
 *
 * Implementasi konkret dari AuthRepository yang berkomunikasi dengan
 * backend API menggunakan HttpClient.
 */
export class ApiAuthRepository implements AuthRepository {
  constructor(private readonly http: HttpClient) {}

  async login(input: LoginInput): Promise<LoginModel> {
    return safeApiCall(async () => {
      const request = mapLoginInputToRequest(input);
      const response = await this.http.post<ApiResponse<LoginResponse>>(
        "/auth/login",
        request,
      );

      return mapLoginResponseToModel(response.data);
    });
  }

  async refresh(): Promise<LoginModel> {
    return safeApiCall(async () => {
      // Cookie refresh_token dikirim otomatis
      const response = await this.http.post<ApiResponse<LoginResponse>>(
        "/auth/refresh",
      );
      return mapLoginResponseToModel(response.data);
    });
  }

  async logout(): Promise<void> {
    return safeApiCall(async () => {
      await this.http.post("/auth/logout");
    });
  }
}
