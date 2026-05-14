import type { LoginInput } from "@core/auth/applications/inputs/auth.input";
import type { LoginModel } from "@core/auth/domains/models/auth.model";
import type { LoginRequest, LoginResponse } from "../schemas";

/**
 * mapLoginInputToRequest
 * Mengonversi input dari domain ke format yang dimengerti API.
 */
export function mapLoginInputToRequest(input: LoginInput): LoginRequest {
  return {
    username: input.username,
    password: input.password,
  };
}

/**
 * mapLoginResponseToModel
 * Mengonversi response dari API ke format model domain.
 */
export function mapLoginResponseToModel(response: LoginResponse): LoginModel {
  return {
    accessToken: response.access_token,
  };
}
