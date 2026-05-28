export * from "./httpClient";
export * from "./errors";
export * from "./interceptors/request";
export * from "./interceptors/response";

// Re-export essential Axios types to avoid direct dependency in infrastructure
export type {
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosInstance,
} from "axios";
