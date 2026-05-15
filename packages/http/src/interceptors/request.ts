import type { InternalAxiosRequestConfig } from "axios";

/**
 * Type untuk function pengambil token agar agnostic terhadap library store (Zustand/Redux/dll)
 */
export type TokenGetter = () =>
  | string
  | null
  | undefined
  | Promise<string | null | undefined>;

export type TokenSetter = (token: string) => void | Promise<void>;

export const createRequestInterceptor = (getToken?: TokenGetter) => {
  return async (config: InternalAxiosRequestConfig) => {
    // Jika ada function getToken, panggil dan masukkan ke header Authorization
    if (getToken) {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  };
};

export const requestErrorInterceptor = (error: unknown) => {
  return Promise.reject(error);
};
