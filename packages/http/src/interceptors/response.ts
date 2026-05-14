import type {
  AxiosError,
  AxiosResponse,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const responseInterceptor = (response: AxiosResponse) => {
  return response;
};

/**
 * Factory untuk error interceptor agar bisa mengakses instance axios untuk retry
 */
export const createResponseErrorInterceptor = (instance: AxiosInstance) => {
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
        await instance.post("/auth/refresh");

        // Jika refresh sukses, ulangi original request
        return instance(originalRequest);
      } catch (refreshError) {
        // Jika refresh gagal (misal refresh_token di cookie juga expired)
        console.error("Session expired. Please login again.");

        // Opsional: Redirect ke login atau hapus state user
        // window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  };
};
