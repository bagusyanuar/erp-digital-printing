import {
  isAxiosError,
  type AxiosError,
  type AxiosResponse,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import type { TokenSetter } from "./request";
import { HttpError } from "../errors";

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const responseInterceptor = (response: AxiosResponse) => {
  return response;
};

/**
 * Factory untuk error interceptor agar bisa mengakses instance axios untuk retry
 */
interface ApiErrorResponse {
  message?: string;
  code?: string;
  errors?: Record<string, unknown>;
}

export const createResponseErrorInterceptor = (
  instance: AxiosInstance,
  onTokenRefreshed?: TokenSetter,
  onAuthFailure?: () => void | Promise<void>,
) => {
  return async (error: AxiosError) => {
    const originalRequest = error.config as CustomRequestConfig;

    // 1. Cek jika status 401 (Unauthorized)
    // 2. Pastikan bukan request ke /auth/refresh itu sendiri agar tidak looping
    // 3. Pastikan belum pernah di-retry sebelumnya
    if (
      error.response?.status === 401 &&
      originalRequest.url !== "/auth/refresh" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Hit endpoint refresh.
        // Karena withCredentials: true, browser otomatis mengirim cookie refresh_token.
        const refreshResponse = await instance.post<{
          data: { access_token: string };
        }>("/auth/refresh");
        const newToken = refreshResponse.data?.data?.access_token;

        if (newToken) {
          // Update store (Zustand) lewat callback
          if (onTokenRefreshed) {
            await onTokenRefreshed(newToken);
          }

          // Update header request yang gagal tadi
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        // Ulangi original request
        return instance(originalRequest);
      } catch (refreshError) {
        // Jika refresh gagal (misal refresh_token di cookie juga expired)
        console.error("Session expired. Please login again.");

        if (onAuthFailure) {
          await onAuthFailure();
        }

        const data = isAxiosError(refreshError)
          ? (refreshError.response?.data as ApiErrorResponse)
          : undefined;

        const finalError = isAxiosError(refreshError)
          ? new HttpError(
              data?.message || refreshError.message,
              refreshError.response?.status,
              data?.code,
              data,
              refreshError,
            )
          : refreshError;

        return Promise.reject(finalError);
      }
    }

    const data = error.response?.data as ApiErrorResponse;
    const finalError = new HttpError(
      data?.message || error.message,
      error.response?.status,
      data?.code,
      data,
      error,
    );

    return Promise.reject(finalError);
  };
};
